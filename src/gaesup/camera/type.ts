export type cameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  lerpingPoint: THREE.Vector3;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  followCamera: THREE.Object3D;
  pivot: THREE.Object3D;
  intersetesAndTransParented: THREE.Intersection<
    THREE.Object3D<THREE.Object3DEventMap>
  >[];
  intersects: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[];
  intersectObjects: THREE.Object3D[];
  intersectObjectMap: { [uuid: string]: THREE.Object3D };
};
