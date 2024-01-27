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
import { jsx as _jsx } from "react/jsx-runtime";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { GaesupWorldContext } from "../world/context";
import normal from "./control/normal";
import orbit from "./control/orbit";
import detector from "./detector";
export default function Camera(_a) {
    var refs = _a.refs, prop = _a.prop, control = _a.control;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var mode = worldContext.mode, cameraOption = worldContext.cameraOption;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef;
    var _b = useThree(), scene = _b.scene, camera = _b.camera;
    var cameraRef = useRef();
    var intersectObjectMap = useMemo(function () { return ({}); }, []);
    var cameraProp = __assign(__assign({}, prop), { control: control, controllerContext: controllerContext, worldContext: worldContext, intersectObjectMap: intersectObjectMap });
    var getMeshs = function (object) {
        if (object.userData && object.userData.intangible)
            return;
        if (object instanceof THREE.Mesh &&
            object.geometry.type !== "InstancedBufferGeometry") {
            intersectObjectMap[object.uuid] = object;
        }
        object.children.forEach(function (child) {
            getMeshs(child);
        });
    };
    useEffect(function () {
        scene.children.forEach(function (child) { return getMeshs(child); });
    }, []);
    var position = useMemo(function () { return camera.position; }, []);
    var dir = useMemo(function () { return vec3(); }, []);
    cameraProp.cameraRay.rayCast = new THREE.Raycaster(cameraProp.cameraRay.origin, cameraProp.cameraRay.dir, 0, -cameraOption.maxDistance);
    useEffect(function () {
        cameraProp.cameraRay.origin.copy(position);
        cameraProp.cameraRay.dir.copy(camera.getWorldDirection(dir));
    }, [cameraProp]);
    useFrame(function (state, delta) {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return;
        cameraProp.delta = delta;
        cameraProp.state = state;
        if (!worldContext.block.camera) {
            if (mode.control === "orbit") {
                orbit(cameraProp);
            }
            else if (mode.control === "normal") {
                normal(cameraProp);
            }
            detector(cameraProp);
        }
    });
    //   // moveTo 함수 정의
    //   worldContext.moveTo = async (
    //     position: THREE.Vector3,
    //     target: THREE.Vector3
    //   ) => {
    //     camera.position.copy(position);
    //     if (mode.control === "orbit") {
    //       await Promise.all([
    //         cameraRef.current.setPosition(position.x, position.y, position.z, true),
    //
    //         camera.rotation.copy(worldContext.activeState.euler),
    //         cameraRef.current.setLookAt(
    //           position.x,
    //           position.y,
    //           position.z,
    //           target.x,
    //           target.y,
    //           target.z,
    //           true
    //         ),
    //       ]);
    //     } else if (mode.control === "normal") {
    //       await Promise.all([
    //         cameraRef.current.setPosition(0, position.y, position.z, true),
    //         camera.rotation.copy(worldContext.activeState.euler),
    //         cameraRef.current.setLookAt(
    //           0,
    //           position.y,
    //           position.z,
    //           target.x,
    //           target.y,
    //           target.z,
    //           true
    //         ),
    //       ]);
    //     }
    //   };
    return _jsx(CameraControls, { ref: cameraRef });
}
