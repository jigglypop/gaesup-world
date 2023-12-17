import { useEffect } from "react";
import * as THREE from "three";
import { GLTFResult } from "../../../component/type";
import { useGltfAndSize } from "../../../utils/gltf";
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

export default function getGltf({
  value,
  dispatch,
}: innerColliderPropType): getGltfResultType {
  const { url } = value;
  const result = {
    characterGltf: null,
    vehicleGltf: null,
    wheelGltf: null,
    airplaneGltf: null,
    characterSize: null,
    vehicleSize: null,
    wheelSize: null,
    airplaneSize: null,
  };
  if (url.characterUrl) {
    const characterGltfAndSize = useGltfAndSize(url.characterUrl);
    result.characterGltf = characterGltfAndSize.gltf;
    result.characterSize = characterGltfAndSize.size;
  }
  if (url.vehicleUrl) {
    const vehicleAndSize = useGltfAndSize(url.vehicleUrl);
    result.vehicleGltf = vehicleAndSize.gltf;
    result.vehicleSize = vehicleAndSize.size;
    if (url.wheelUrl) {
      const wheelAndSize = useGltfAndSize(url.wheelUrl);
      result.wheelGltf = wheelAndSize.gltf;
      result.wheelSize = wheelAndSize.size;
    }
  }
  if (url.airplaneUrl) {
    const airplaneAndSize = useGltfAndSize(url.airplaneUrl);
    result.airplaneGltf = airplaneAndSize.gltf;
    result.airplaneSize = airplaneAndSize.size;
  }

  useEffect(() => {
    dispatch({
      type: "update",
      payload: {
        characterGltf: result.characterGltf,
        vehicleGltf: result.vehicleGltf,
        wheelGltf: result.wheelGltf,
        airplaneGltf: result.airplaneGltf,
      },
    });
  }, [
    url,
    result.airplaneGltf,
    result.characterGltf,
    result.vehicleGltf,
    result.wheelGltf,
  ]);
  return result;
}
