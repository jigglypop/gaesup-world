import * as THREE from "three";
export type cameraRayType = {
    origin: THREE.Vector3;
    hit: THREE.Raycaster;
    rayCast: THREE.Raycaster | null;
    length: number;
    dir: THREE.Vector3;
    position: THREE.Vector3;
    intersects: THREE.Intersection<THREE.Mesh>[];
    detected: THREE.Intersection<THREE.Mesh>[];
    intersectObjectMap: {
        [uuid: string]: THREE.Mesh;
    };
};
