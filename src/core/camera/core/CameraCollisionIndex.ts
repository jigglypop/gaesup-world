import * as THREE from 'three';

export const CAMERA_COLLIDER_LAYER = 30;

let globalGeneration = 0;

export function invalidateCameraColliders(): void {
  globalGeneration++;
}

function isRaycastableMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh && !('isLineSegments2' in object && object.isLineSegments2);
}

export class CameraCollisionIndex {
  private readonly scene: THREE.Scene;
  private readonly allMeshes: THREE.Mesh[] = [];
  private readonly colliderMeshes: THREE.Mesh[] = [];
  private readonly observed = new Set<THREE.Object3D>();
  private dirty = true;
  private generation = globalGeneration;
  private rebuildCount = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  getTargets(): readonly THREE.Mesh[] {
    if (this.dirty || this.generation !== globalGeneration) this.rebuild();
    return this.colliderMeshes.length > 0 ? this.colliderMeshes : this.allMeshes;
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
