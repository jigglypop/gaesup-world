import * as THREE from "three";
import { GLTFResult } from "../../../component/gltf/type";
import { innerColliderPropType } from "../type";
export type getGltfResultType = {
    characterGltf: GLTFResult;
    vehicleGltf: GLTFResult;
    wheelGltf: GLTFResult;
    airplaneGltf: GLTFResult;
    characterSize: THREE.Vector3;
    vehicleSize: THREE.Vector3;
    wheelSize: THREE.Vector3;
    airplaneSize: THREE.Vector3;
};
export default function getGltf({ value, dispatch, }: innerColliderPropType): getGltfResultType;
