import { useGLTF } from "@react-three/drei";
import { useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export const useGltfAndSize = ({ url }) => {
    const { sizes } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const gltf = useGLTF(url);
    const { scene } = gltf;
    const makeGltfSize = () => {
        return new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    };
    // getter
    const getSize = (keyName) => {
        const key = keyName || url;
        if (key in sizes) {
            return sizes[key];
        }
        else {
            return null;
        }
    };
    // setter
    const setSize = (size, keyName) => {
        const key = keyName || url;
        if (!(key in sizes)) {
            sizes[key] = size || makeGltfSize();
            dispatch({
                type: "update",
                payload: {
                    sizes: Object.assign({}, sizes),
                },
            });
            return sizes[key];
        }
        else {
            return sizes[key];
        }
    };
    return { gltf, size: setSize(), setSize, getSize };
};
export const useGaesupGltf = () => {
    const { sizes } = useContext(GaesupWorldContext);
    // get size by url
    const getSizesByUrls = (urls) => {
        const matchedSizes = {};
        if (!urls)
            return matchedSizes;
        Object.keys(urls).forEach((key) => {
            const url = urls[key];
            if (url in sizes) {
                matchedSizes[key] = sizes[url];
            }
            else {
                matchedSizes[key] = null;
            }
        });
        return matchedSizes;
    };
    return { getSizesByUrls };
};
