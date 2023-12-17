import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { S3 } from "../../../utils/constant";
export default function getGltf(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var url = value.url;
    var result = {
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
        var characterGltf = useLoader(GLTFLoader, url.characterUrl);
        var characterScene = characterGltf.scene;
        var characterSize = new THREE.Box3()
            .setFromObject(characterScene)
            .getSize(new THREE.Vector3());
        result.characterGltf = characterGltf;
        result.characterSize = characterSize;
    }
    if (url.vehicleUrl) {
        var vehicleGltf = useLoader(GLTFLoader, url.vehicleUrl);
        var wheelGltf = useLoader(GLTFLoader, url.wheelUrl || S3 + "/wheel.glb");
        var vehicleScene = vehicleGltf.scene;
        var wheelScene = wheelGltf.scene;
        var vehicleSize = new THREE.Box3()
            .setFromObject(vehicleScene)
            .getSize(new THREE.Vector3());
        var wheelsize = new THREE.Box3()
            .setFromObject(wheelScene)
            .getSize(new THREE.Vector3());
        result.vehicleGltf = vehicleGltf;
        result.wheelGltf = wheelGltf;
        result.vehicleSize = vehicleSize;
        result.wheelSize = wheelsize;
    }
    if (url.airplaneUrl) {
        var airplaneGltf = useLoader(GLTFLoader, url.airplaneUrl);
        var airplaneScene = airplaneGltf.scene;
        var airplaneSize = new THREE.Box3()
            .setFromObject(airplaneScene)
            .getSize(new THREE.Vector3());
        result.airplaneGltf = airplaneGltf;
        result.airplaneSize = airplaneSize;
    }
    useEffect(function () {
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
