import { useGLTF } from "@react-three/drei";
import { useContext } from "react";
import * as THREE from "three";
import { GLTFResult } from "../../component/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { urlsType } from "../../world/context/type";

export type gltfAndSizeType = {
  size: THREE.Vector3;
  setSize: (size: THREE.Vector3, keyName?: string) => void;
  getSize: () => THREE.Vector3;
};

export type useGltfAndSizeType = {
  url: string;
};

export const useGltfAndSize = ({ url }: useGltfAndSizeType) => {
  const { sizes } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const gltf = useGLTF(url) as GLTFResult;
  const { scene } = gltf;

  const makeGltfSize = () => {
    return new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
  };
  // getter
  const getSize = (keyName?: string) => {
    const key = keyName || url;
    if (key in sizes) {
      return sizes[key];
    } else {
      return null;
    }
  };
  // setter
  const setSize = (size?: THREE.Vector3, keyName?: string) => {
    const key = keyName || url;
    if (!(key in sizes)) {
      sizes[key] = size || makeGltfSize();
      dispatch({
        type: "update",
        payload: {
          sizes: { ...sizes },
        },
      });
      return sizes[key];
    } else {
      return sizes[key];
    }
  };

  return { gltf, size: setSize(), setSize, getSize };
};

export const useGaesupGltf = () => {
  const { sizes } = useContext(GaesupWorldContext);

  // get size by url
  const getSizesByUrls = (urls?: urlsType) => {
    const matchedSizes: { [key in keyof urlsType]: THREE.Vector3 } = {};
    if (!urls) return matchedSizes;
    Object.keys(urls).forEach((key) => {
      const url = urls[key];
      if (url in sizes) {
        matchedSizes[key] = sizes[url];
      } else {
        matchedSizes[key] = null;
      }
    });
    return matchedSizes;
  };

  return { getSizesByUrls };
};
