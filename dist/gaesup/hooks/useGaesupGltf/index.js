var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useGLTF } from "@react-three/drei";
import { useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export var useGltfAndSize = function (_a) {
    var url = _a.url;
    var sizes = useContext(GaesupWorldContext).sizes;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var gltf = useGLTF(url);
    var scene = gltf.scene;
    var makeGltfSize = function () {
        return new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    };
    // getter
    var getSize = function (keyName) {
        var key = keyName || url;
        if (key in sizes) {
            return sizes[key];
        }
        else {
            return null;
        }
    };
    // setter
    var setSize = function (size, keyName) {
        var key = keyName || url;
        if (!(key in sizes)) {
            sizes[key] = size || makeGltfSize();
            dispatch({
                type: "update",
                payload: {
                    sizes: __assign({}, sizes),
                },
            });
            return sizes[key];
        }
        else {
            return sizes[key];
        }
    };
    return { gltf: gltf, size: setSize(), setSize: setSize, getSize: getSize };
};
export var useGaesupGltf = function () {
    var sizes = useContext(GaesupWorldContext).sizes;
    // get size by url
    var getSizesByUrls = function (urls) {
        var matchedSizes = {};
        if (!urls)
            return matchedSizes;
        Object.keys(urls).forEach(function (key) {
            var url = urls[key];
            if (url in sizes) {
                matchedSizes[key] = sizes[url];
            }
            else {
                matchedSizes[key] = null;
            }
        });
        return matchedSizes;
    };
    return { getSizesByUrls: getSizesByUrls };
};
