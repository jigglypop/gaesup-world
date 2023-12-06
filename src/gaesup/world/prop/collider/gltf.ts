import { gaesupWorldPropType } from "@/gaesup/stores/context";
import { GLTFResult } from "@/gaesup/type";
import { S3 } from "@/gaesup/utils/constant";
import { useLoader } from "@react-three/fiber";
import { Dispatch, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

export default function getGltf(
  value: gaesupWorldPropType,
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>
): getGltfResultType {
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
    const characterGltf: GLTFResult = useLoader(GLTFLoader, url.characterUrl);
    const { scene: characterScene } = characterGltf;
    const characterSize = new THREE.Box3()
      .setFromObject(characterScene)
      .getSize(new THREE.Vector3());
    result.characterGltf = characterGltf;
    result.characterSize = characterSize;
  }
  if (url.vehicleUrl) {
    const vehicleGltf: GLTFResult = useLoader(GLTFLoader, url.vehicleUrl);
    const wheelGltf: GLTFResult = useLoader(
      GLTFLoader,
      url.wheelUrl || S3 + "/wheel.glb"
    );
    const { scene: vehicleScene } = vehicleGltf;
    const { scene: wheelScene } = wheelGltf;
    const vehicleSize = new THREE.Box3()
      .setFromObject(vehicleScene)
      .getSize(new THREE.Vector3());
    const wheelsize = new THREE.Box3()
      .setFromObject(wheelScene)
      .getSize(new THREE.Vector3());
    result.vehicleGltf = vehicleGltf;
    result.wheelGltf = wheelGltf;
    result.vehicleSize = vehicleSize;
    result.wheelSize = wheelsize;
  }
  if (url.airplaneUrl) {
    const airplaneGltf: GLTFResult = useLoader(GLTFLoader, url.airplaneUrl);
    const { scene: airplaneScene } = airplaneGltf;
    const airplaneSize = new THREE.Box3()
      .setFromObject(airplaneScene)
      .getSize(new THREE.Vector3());
    result.airplaneGltf = airplaneGltf;
    result.airplaneSize = airplaneSize;
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