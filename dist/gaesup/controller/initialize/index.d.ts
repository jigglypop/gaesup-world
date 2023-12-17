import * as THREE from "three";
import { groundRayType, refsType, slopeRayType } from "../../controller/type";
import { keyControlType } from "../../world/context/type";
import { gaesupControllerType } from "../context/type";
export default function initControllerProps({ controllerContext, refs, }: {
    controllerContext: gaesupControllerType;
    refs: refsType;
}): {
    slopeRay: slopeRayType;
    groundRay: groundRayType;
    cameraRay: {
        origin: THREE.Vector3;
        hit: THREE.Raycaster;
        rayCast: THREE.Raycaster;
        lerpingPoint: THREE.Vector3;
        dir: THREE.Vector3;
        position: THREE.Vector3;
        length: number;
        followCamera: THREE.Object3D<THREE.Object3DEventMap>;
        pivot: THREE.Object3D<THREE.Object3DEventMap>;
        intersetesAndTransParented: any[];
        intersects: any[];
        intersectObjects: any[];
        intersectObjectMap: {};
    };
    keyControl: keyControlType;
};
