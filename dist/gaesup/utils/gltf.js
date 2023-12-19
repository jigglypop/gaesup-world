import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
export var useGltfAndSize = function (url) {
    var gltf = useGLTF(url);
    var scene = gltf.scene;
    var size = new THREE.Box3()
        .setFromObject(scene)
        .getSize(new THREE.Vector3());
    return { gltf: gltf, size: size };
};
