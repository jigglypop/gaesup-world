import * as THREE from 'three';

export const CAMERA_COLLIDER_LAYER = 30;

let globalGeneration = 0;

export function invalidateCameraColliders(): void {
  globalGeneration++;
}

type RaycastCandidate = THREE.Object3D & { isMesh?: boolean; isLineSegments2?: boolean; geometry?: unknown };

function isRaycastableMesh(object: RaycastCandidate): object is THREE.Mesh {
  return object.isMesh === true && object.isLineSegments2 !== true && !!object.geometry;
}

function hasAncestorIn(object: THREE.Object3D, ancestors: readonly THREE.Object3D[]): boolean {
  for (let current: THREE.Object3D | null = object; current; current = current.parent) {
    if (ancestors.includes(current)) return true;
  }
  return false;
}

function sameItems(a: readonly THREE.Object3D[], b: readonly THREE.Object3D[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export class CameraCollisionIndex {
  private readonly scene: THREE.Scene;
  private readonly allMeshes: THREE.Mesh[] = [];
  private readonly colliderMeshes: THREE.Mesh[] = [];
  private readonly observed = new Set<THREE.Object3D>();
  private dirty = true;
  private generation = globalGeneration;
  private rebuildCount = 0;
  private excludedKey: readonly THREE.Object3D[] = [];
  private readonly excludedMeshes: THREE.Mesh[] = [];
  private excludedRevision = -1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getTargets(): readonly THREE.Mesh[] {
    this.refresh();
    return this.colliderMeshes.length > 0 ? this.colliderMeshes : this.allMeshes;
  }

  /** Every raycastable mesh in the scene, in pre-order, minus meshes under `excluded` (cached per exclusion list). */
  getMeshes(excluded: readonly THREE.Object3D[] = []): readonly THREE.Mesh[] {
    this.refresh();
    if (excluded.length === 0) return this.allMeshes;
    if (this.excludedRevision !== this.rebuildCount || !sameItems(excluded, this.excludedKey)) {
      this.excludedKey = excluded.slice();
      this.excludedRevision = this.rebuildCount;
      this.excludedMeshes.length = 0;
      for (const mesh of this.allMeshes) if (!hasAncestorIn(mesh, excluded)) this.excludedMeshes.push(mesh);
    }
    return this.excludedMeshes;
  }

  getColliders(): readonly THREE.Mesh[] {
    this.refresh();
    return this.colliderMeshes;
  }

  getRebuildCount(): number {
    return this.rebuildCount;
  }

  invalidate(): void {
    this.dirty = true;
  }

  dispose(): void {
    for (const object of this.observed) this.unobserve(object);
    this.observed.clear();
    this.allMeshes.length = 0;
    this.colliderMeshes.length = 0;
    this.excludedMeshes.length = 0;
    this.excludedKey = [];
  }

  private readonly handleChildAdded = (): void => {
    this.dirty = true;
  };

  private readonly handleChildRemoved = (event: { child: THREE.Object3D }): void => {
    this.dirty = true;
    event.child.traverse((object) => {
      if (this.observed.delete(object)) this.unobserve(object);
    });
  };

  private readonly collect = (object: THREE.Object3D): void => {
    if (!this.observed.has(object)) {
      this.observed.add(object);
      object.addEventListener('childadded', this.handleChildAdded);
      object.addEventListener('childremoved', this.handleChildRemoved);
    }
    if (!isRaycastableMesh(object)) return;
    this.allMeshes.push(object);
    if (object.layers.isEnabled(CAMERA_COLLIDER_LAYER)) this.colliderMeshes.push(object);
  };

  private refresh(): void {
    if (this.dirty || this.generation !== globalGeneration) this.rebuild();
  }

  private rebuild(): void {
    this.allMeshes.length = 0;
    this.colliderMeshes.length = 0;
    this.scene.traverse(this.collect);
    this.dirty = false;
    this.generation = globalGeneration;
    this.rebuildCount++;
  }

  private unobserve(object: THREE.Object3D): void {
    object.removeEventListener('childadded', this.handleChildAdded);
    object.removeEventListener('childremoved', this.handleChildRemoved);
  }
}

const indices = new WeakMap<THREE.Scene, CameraCollisionIndex>();

export function getCameraCollisionIndex(scene: THREE.Scene): CameraCollisionIndex {
  let index = indices.get(scene);
  if (!index) {
    index = new CameraCollisionIndex(scene);
    indices.set(scene, index);
  }
  return index;
}
