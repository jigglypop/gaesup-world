import { BatchedMesh, Box3, InstancedMesh, Matrix4, Mesh, Ray, Triangle, Vector3 } from 'three';

const triangle = new Triangle();
const closest = new Vector3();
const normal = new Vector3();
const center = new Vector3();
const contact = new Vector3();
const edge = new Vector3();
const offset = new Vector3();
const box = new Box3();
const segmentBox = new Box3();
const instanceMatrix = new Matrix4();
const worldMatrix = new Matrix4();
const morphProxies = new WeakMap<InstancedMesh, Mesh>();
const batchRange = { vertexStart: 0, vertexCount: 0, reservedVertexCount: 0, indexStart: 0, indexCount: 0, reservedIndexCount: 0, start: 0, count: 0 };

/** Reject static meshes before matrix inversion, raycast and triangle traversal.
 * InstancedMesh uses its all-instance bounds, so a far batch never reaches the per-instance loop.
 */
export function cameraMeshMayIntersect(mesh: Mesh, ray: Ray, radius: number, maxDistance: number): boolean {
  const instanced = (mesh as InstancedMesh).isInstancedMesh ? mesh as InstancedMesh : null;
  if (instanced) {
    if (instanced.morphTexture) return true;
    if (!instanced.boundingSphere) instanced.computeBoundingSphere();
    if (!instanced.boundingBox) instanced.computeBoundingBox();
  } else if (mesh.raycast !== Mesh.prototype.raycast || mesh.morphTargetInfluences?.length) {
    return true;
  } else if (!mesh.geometry.boundingSphere) {
    mesh.geometry.computeBoundingSphere();
  }
  const bounds = instanced ?? mesh.geometry;
  const sphere = bounds.boundingSphere;
  if (sphere && sphere.radius >= 0) {
    // One matrix-vector product rejects most far meshes before transforming eight box corners.
    center.copy(sphere.center).applyMatrix4(mesh.matrixWorld);
    const reach = sphere.radius * mesh.matrixWorld.getMaxScaleOnAxis() + radius;
    const along = Math.min(Math.max(offset.subVectors(center, ray.origin).dot(ray.direction), 0), maxDistance);
    if (closest.copy(ray.direction).multiplyScalar(along).add(ray.origin).distanceToSquared(center) > reach * reach) {
      return false;
    }
  }
  if (!instanced && !mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  if (!bounds.boundingBox) return true;
  box.copy(bounds.boundingBox).applyMatrix4(mesh.matrixWorld).expandByScalar(radius);
  if (box.containsPoint(ray.origin)) return true;
  return Boolean(ray.intersectBox(box, contact) && contact.distanceToSquared(ray.origin) <= maxDistance * maxDistance);
}

/** Sphere sweep against the mesh's world bounding sphere (bind pose for skinned meshes). */
export function sweepSphereBounds(mesh: Mesh, ray: Ray, radius: number, maxDistance: number, point: Vector3): number {
  if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
  const sphere = mesh.geometry.boundingSphere;
  if (!sphere) return Infinity;
  center.copy(sphere.center).applyMatrix4(mesh.matrixWorld);
  const reach = sphere.radius * mesh.matrixWorld.getMaxScaleOnAxis() + radius;
  offset.subVectors(ray.origin, center);
  const b = offset.dot(ray.direction);
  const c = offset.lengthSq() - reach * reach;
  if (c <= 0) {
    point.copy(ray.origin);
    return 0;
  }
  const discriminant = b * b - c;
  if (discriminant < 0) return Infinity;
  const time = -b - Math.sqrt(discriminant);
  if (time < 0 || time > maxDistance) return Infinity;
  point.copy(ray.origin).addScaledVector(ray.direction, time);
  return time;
}

function vertexTime(ray: Ray, vertex: Vector3, radius: number): number {
  offset.subVectors(ray.origin, vertex);
  const b = offset.dot(ray.direction);
  const discriminant = b * b - (offset.lengthSq() - radius * radius);
  if (discriminant < 0) return Infinity;
  const time = -b - Math.sqrt(discriminant);
  return time >= 0 ? time : Infinity;
}

function edgeTime(ray: Ray, a: Vector3, b: Vector3, radius: number): number {
  edge.subVectors(b, a);
  offset.subVectors(ray.origin, a);
  const edgeSq = edge.lengthSq();
  const along = edge.dot(ray.direction);
  const projected = edge.dot(offset);
  const qa = edgeSq - along * along;
  if (qa <= Number.EPSILON * edgeSq * 4) return Infinity;
  const qb = edgeSq * ray.direction.dot(offset) - projected * along;
  const qc = edgeSq * (offset.lengthSq() - radius * radius) - projected * projected;
  const discriminant = qb * qb - qa * qc;
  if (discriminant < 0) return Infinity;
  const time = (-qb - Math.sqrt(discriminant)) / qa;
  const alongEdge = projected + time * along;
  return time >= 0 && alongEdge >= 0 && alongEdge <= edgeSq ? time : Infinity;
}

/** Earliest contact of a moving sphere with a two-sided triangle, in world units.
 * Tests the offset faces, edge cylinders and vertex spheres analytically; no temporal sampling.
 * Geometric decomposition: https://peroxide.dk/papers/collision/collision.pdf
 * ray.direction must be normalized. Infinity means no contact within maxDistance.
 */
export function sweepSphereTriangle(ray: Ray, radius: number, surface: Triangle, maxDistance: number, point: Vector3): number {
  surface.closestPointToPoint(ray.origin, closest);
  if (closest.distanceToSquared(ray.origin) <= radius * radius) {
    point.copy(closest);
    return 0;
  }
  let best = Infinity;
  surface.getNormal(normal);
  const velocity = normal.dot(ray.direction);
  const height = normal.dot(offset.subVectors(ray.origin, surface.a));
  if (velocity !== 0) {
    for (let side = -1; side <= 1; side += 2) {
      const time = (side * radius - height) / velocity;
      if (time < 0 || time > maxDistance || time >= best) continue;
      center.copy(ray.origin).addScaledVector(ray.direction, time);
      contact.copy(center).addScaledVector(normal, -side * radius);
      if (surface.containsPoint(contact)) best = time;
    }
  }
  best = Math.min(best,
    edgeTime(ray, surface.a, surface.b, radius),
    edgeTime(ray, surface.b, surface.c, radius),
    edgeTime(ray, surface.c, surface.a, radius),
    vertexTime(ray, surface.a, radius), vertexTime(ray, surface.b, radius), vertexTime(ray, surface.c, radius));
  if (best > maxDistance) return Infinity;
  center.copy(ray.origin).addScaledVector(ray.direction, best);
  surface.closestPointToPoint(center, point);
  return best;
}

/** Mesh sweep uses exact triangles after a conservative world-AABB broad phase.
 * Output point is caller-owned. Animated vertices use Mesh.getVertexPosition.
 */
export function sweepSphereMesh(mesh: Mesh, ray: Ray, radius: number, maxDistance: number, point: Vector3): number {
  const geometry = mesh.geometry;
  const positions = geometry.getAttribute('position');
  if (!positions) return Infinity;
  const index = geometry.index;
  const count = index ? index.count : positions.count;
  const drawStart = Math.max(0, geometry.drawRange.start);
  const drawEnd = Math.min(count, drawStart + geometry.drawRange.count);
  const instanced = mesh instanceof InstancedMesh ? mesh : null;
  const batched = mesh instanceof BatchedMesh ? mesh : null;
  let vertices = mesh;
  if (instanced?.morphTexture) {
    let proxy = morphProxies.get(instanced);
    if (!proxy) { proxy = new Mesh(geometry, mesh.material); morphProxies.set(instanced, proxy); }
    if (proxy.geometry !== geometry) { proxy.geometry = geometry; proxy.updateMorphTargets(); }
    vertices = proxy;
  }
  const animated = 'isSkinnedMesh' in mesh || Boolean(mesh.morphTargetInfluences?.length);
  if (!animated && !geometry.boundingBox) geometry.computeBoundingBox();
  segmentBox.set(ray.origin, ray.origin).expandByPoint(center.copy(ray.origin).addScaledVector(ray.direction, maxDistance));
  let nearest = Infinity;
  const visit = (start: number, end: number) => {
    for (let i = start; i + 2 < end; i += 3) {
      vertices.getVertexPosition(index ? index.getX(i) : i, triangle.a).applyMatrix4(worldMatrix);
      vertices.getVertexPosition(index ? index.getX(i + 1) : i + 1, triangle.b).applyMatrix4(worldMatrix);
      vertices.getVertexPosition(index ? index.getX(i + 2) : i + 2, triangle.c).applyMatrix4(worldMatrix);
      const distance = sweepSphereTriangle(ray, radius, triangle, Math.min(maxDistance, nearest), closest);
      if (distance < nearest) { nearest = distance; point.copy(closest); }
    }
  };
  if (batched) {
    // Public IDs can have holes after deletion. Stop after the active instance count.
    let remaining = batched.instanceCount;
    for (let id = 0; id < batched.maxInstanceCount && remaining > 0; id++) {
      let visible: boolean;
      try { visible = batched.getVisibleAt(id); } catch { continue; }
      remaining--;
      if (!visible) continue;
      const geometryId = batched.getGeometryIdAt(id);
      batched.getMatrixAt(id, instanceMatrix);
      worldMatrix.multiplyMatrices(mesh.matrixWorld, instanceMatrix);
      batched.getBoundingBoxAt(geometryId, box);
      if (!box.applyMatrix4(worldMatrix).expandByScalar(radius).intersectsBox(segmentBox)) continue;
      const range = batched.getGeometryRangeAt(geometryId, batchRange);
      if (range) visit(range.start, range.start + range.count);
    }
    return nearest;
  }
  for (let instance = 0; instance < (instanced?.count ?? 1); instance++) {
    if (instanced) {
      instanced.getMatrixAt(instance, instanceMatrix);
      worldMatrix.multiplyMatrices(mesh.matrixWorld, instanceMatrix);
      if (instanced.morphTexture) instanced.getMorphAt(instance, vertices);
    } else worldMatrix.copy(mesh.matrixWorld);
    if (!animated && !instanced?.morphTexture && geometry.boundingBox
      && !box.copy(geometry.boundingBox).applyMatrix4(worldMatrix).expandByScalar(radius).intersectsBox(segmentBox)) continue;
    if (Array.isArray(mesh.material)) {
      for (const group of geometry.groups) {
        if (mesh.material[group.materialIndex ?? 0]) visit(Math.max(drawStart, group.start), Math.min(drawEnd, group.start + group.count));
      }
    } else if (mesh.material) visit(drawStart, drawEnd);
  }
  return nearest;
}
