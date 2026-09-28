import * as THREE from 'three';

import type { ModelShadow } from './batch';
import type { PlacedObject } from '../../../types';

/** Side of the square cells static models merge in, in meters: a cell is one draw a pass, culled on its own. */
export const STATIC_CELL = 32;
/**
 * Vertices the copies of one model may add to the cells. A model placed so often that its copies pass this stays
 * instanced, where it costs a draw a part instead of memory for every copy.
 */
export const STATIC_VERTEX_BUDGET = 65_536;

export type StaticModelGroup = { url: string; objects: PlacedObject[]; shadow: ModelShadow };

/** A drawn range of one mesh of a model, with its material's flat surface and its transform in the model. */
export type StaticPart = {
  geometry: THREE.BufferGeometry;
  start: number;
  count: number;
  color: THREE.Color;
  emissive: THREE.Color;
  roughness: number;
  matrix: THREE.Matrix4;
};

/** A model's parts by the material side they draw with, and the vertices one copy adds. */
export type BakedModel = { vertices: number; sides: ReadonlyMap<THREE.Side, readonly StaticPart[]> };

export type StaticEntry = { object: PlacedObject; parts: readonly StaticPart[] };
export type StaticCell = { key: string; shadow: ModelShadow; side: THREE.Side; entries: StaticEntry[] };
export type StaticLayout = { cells: StaticCell[]; instanced: readonly StaticModelGroup[] };

const MAPS = ['map', 'normalMap', 'bumpMap', 'emissiveMap', 'alphaMap', 'aoMap', 'lightMap', 'roughnessMap', 'metalnessMap', 'displacementMap'] as const;
// Corner order of a triangle under a mirroring transform: swapping two corners keeps its front face outward.
const MIRRORED = [0, 2, 1] as const;

const baked = new WeakMap<THREE.Object3D, BakedModel | null>();
const UP = new THREE.Vector3(0, 1, 0);
const spot = new THREE.Vector3();
const turn = new THREE.Quaternion();
const size = new THREE.Vector3();
const placement = new THREE.Matrix4();
const matrix = new THREE.Matrix4();
const normalMatrix = new THREE.Matrix3();
const vector = new THREE.Vector3();

/** One flat color: a standard material, opaque, without maps, vertex colors or transmission. */
function isFlat(material: THREE.Material | undefined): material is THREE.MeshStandardMaterial {
  const standard = material as THREE.MeshStandardMaterial | undefined;
  if (!standard?.isMeshStandardMaterial || standard.transparent || standard.alphaTest > 0 || standard.vertexColors) return false;
  if ((standard as THREE.MeshPhysicalMaterial).transmission > 0) return false;
  return MAPS.every((name) => !standard[name]);
}

/**
 * The meshes of a glTF scene as flat parts, or null when one is skinned, morphed or instanced or a material is not
 * flat: such models stay instanced. Cached per scene.
 */
export function bakeModel(scene: THREE.Object3D): BakedModel | null {
  const cached = baked.get(scene);
  if (cached !== undefined) return cached;
  scene.updateMatrixWorld(true);
  const sides = new Map<THREE.Side, StaticPart[]>();
  let vertices = 0;
  let flat = true;
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!flat || !mesh.isMesh) return;
    const { geometry } = mesh;
    const position = geometry.getAttribute('position');
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh || (mesh as THREE.InstancedMesh).isInstancedMesh
      || geometry.morphAttributes.position || !position || !geometry.getAttribute('normal')) {
      flat = false;
      return;
    }
    const length = geometry.index?.count ?? position.count;
    // A single material draws the whole geometry; groups only split it between the materials of an array.
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const groups = Array.isArray(mesh.material) && geometry.groups.length ? geometry.groups : [{ start: 0, count: length, materialIndex: 0 }];
    for (const group of groups) {
      const material = materials[group.materialIndex ?? 0];
      if (!isFlat(material)) {
        flat = false;
        return;
      }
      let parts = sides.get(material.side);
      if (!parts) sides.set(material.side, (parts = []));
      parts.push({
        geometry,
        start: group.start,
        count: Math.min(group.count, length - group.start),
        color: material.color.clone(),
        emissive: material.emissive.clone().multiplyScalar(material.emissiveIntensity),
        roughness: material.roughness,
        matrix: mesh.matrixWorld.clone(),
      });
      vertices += position.count;
    }
  });
  const result = flat && vertices > 0 ? { vertices, sides } : null;
  baked.set(scene, result);
  return result;
}

/** Where a placed object puts its model: its position, its turn about Y and its uniform `modelScale`. */
export function placementOf(object: PlacedObject, target: THREE.Matrix4): THREE.Matrix4 {
  return target.compose(
    spot.set(object.position.x, object.position.y, object.position.z),
    turn.setFromAxisAngle(UP, object.rotation ?? 0),
    size.setScalar(object.config?.modelScale ?? 1),
  );
}

/**
 * One geometry of every entry's parts placed in the world, with each part's color, emission and roughness per vertex:
 * the draw of a whole cell. Quantized glTF attributes are read unpacked. `userData.mergedParts` lists the index offset
 * where each entry ends, so a camera fade turns one placed object see-through instead of the whole cell.
 */
export function mergeStaticModels(entries: readonly StaticEntry[]): THREE.BufferGeometry | null {
  let vertexCount = 0;
  let indexCount = 0;
  for (const { parts } of entries) {
    for (const part of parts) {
      vertexCount += part.geometry.getAttribute('position').count;
      indexCount += part.count;
    }
  }
  if (indexCount === 0) return null;
  const position = new Float32Array(vertexCount * 3);
  const normal = new Float32Array(vertexCount * 3);
  const color = new Float32Array(vertexCount * 3);
  const emissive = new Float32Array(vertexCount * 3);
  const roughness = new Float32Array(vertexCount);
  const index = vertexCount > 0xffff ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
  const ends = new Uint32Array(entries.length);
  let base = 0;
  let cursor = 0;
  for (const [entry, { object, parts }] of entries.entries()) {
    placementOf(object, placement);
    for (const part of parts) {
      matrix.multiplyMatrices(placement, part.matrix);
      normalMatrix.getNormalMatrix(matrix);
      const positions = part.geometry.getAttribute('position');
      const normals = part.geometry.getAttribute('normal');
      for (let vertex = 0; vertex < positions.count; vertex++) {
        const at = (base + vertex) * 3;
        vector.fromBufferAttribute(positions, vertex).applyMatrix4(matrix).toArray(position, at);
        vector.fromBufferAttribute(normals, vertex).applyNormalMatrix(normalMatrix).toArray(normal, at);
        part.color.toArray(color, at);
        part.emissive.toArray(emissive, at);
        roughness[base + vertex] = part.roughness;
      }
      const source = part.geometry.index;
      const order = matrix.determinant() < 0 ? MIRRORED : null;
      for (let corner = 0; corner < part.count; corner++) {
        const at = part.start + (order ? corner - (corner % 3) + order[corner % 3]! : corner);
        index[cursor++] = base + (source ? source.getX(at) : at);
      }
      base += positions.count;
    }
    ends[entry] = cursor;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.userData['mergedParts'] = ends;
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
  geometry.setAttribute('emissive', new THREE.BufferAttribute(emissive, 3));
  geometry.setAttribute('roughness', new THREE.BufferAttribute(roughness, 1));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Which models merge into which cells and which stay instanced. A cell holds the models of one 32 m square with the
 * same shadow policy and material side. Models not baked yet (still loading) are left out; a null bake stays instanced.
 */
export function layoutStaticModels(groups: readonly StaticModelGroup[], models: ReadonlyMap<string, BakedModel | null>): StaticLayout {
  const cells = new Map<string, StaticCell>();
  const instanced: StaticModelGroup[] = [];
  for (const group of groups) {
    if (!models.has(group.url)) continue;
    const model = models.get(group.url);
    if (!model || (group.objects.length > 1 && group.objects.length * model.vertices > STATIC_VERTEX_BUDGET)) {
      instanced.push(group);
      continue;
    }
    for (const object of group.objects) {
      const square = `${Math.floor(object.position.x / STATIC_CELL)}:${Math.floor(object.position.z / STATIC_CELL)}:${group.shadow}`;
      for (const [side, parts] of model.sides) {
        const key = `${square}:${side}`;
        let cell = cells.get(key);
        if (!cell) cells.set(key, (cell = { key, shadow: group.shadow, side, entries: [] }));
        cell.entries.push({ object, parts });
      }
    }
  }
  return { cells: [...cells.values()], instanced };
}

/** The same objects with the same parts in the same order: the cell's merged geometry still holds. */
export function sameStaticCell(a: StaticCell, b: StaticCell): boolean {
  return a.entries.length === b.entries.length
    && a.entries.every((entry, index) => entry.object === b.entries[index]!.object && entry.parts === b.entries[index]!.parts);
}
