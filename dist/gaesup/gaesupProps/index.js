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
import { vec3 } from "@react-three/rapier";
import { Suspense, useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import useClicker from "../hooks/useClicker";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function GaeSupProps(_a) {
    var _b = _a.type, type = _b === void 0 ? "normal" : _b, text = _a.text, position = _a.position, children = _a.children;
    var groupRef = useRef(null);
    var _c = useContext(GaesupWorldContext), minimap = _c.minimap, activeState = _c.activeState, clicker = _c.clicker;
    var dispatch = useContext(GaesupWorldDispatchContext);
    // clicker
    var moveClicker = useClicker().moveClicker;
    //   const moveClicker = (e: ThreeEvent<MouseEvent>) => {
    //     const originPoint = activeState.position;
    //     const newPosition = e.point;
    //     const newAngle = Math.atan2(
    //       newPosition.z - originPoint.z,
    //       newPosition.x - originPoint.x
    //     );
    //     const norm = Math.sqrt(
    //       Math.pow(newPosition.z - originPoint.z, 2) +
    //         Math.pow(newPosition.x - originPoint.x, 2)
    //     );
    //     if (norm < 1) return;
    //     dispatch({
    //       type: "update",
    //       payload: {
    //         clicker: {
    //           point: V3(e.point.x, e.point.y, e.point.z),
    //           angle: newAngle,
    //           isOn: true,
    //         },
    //       },
    //     });
    //   };
    //
    //   // 거리 계산
    //   useEffect(() => {
    //     const originPoint = activeState.position;
    //     const newPosition = clicker.point;
    //     const norm = Math.sqrt(
    //       Math.pow(newPosition.z - originPoint.z, 2) +
    //         Math.pow(newPosition.x - originPoint.x, 2)
    //     );
    //     if (norm < 1) {
    //       clicker.isOn = false;
    //       dispatch({
    //         type: "update",
    //         payload: {
    //           clicker: clicker,
    //         },
    //       });
    //     }
    //   }, [activeState.position, clicker.point]);
    useEffect(function () {
        if (groupRef.current) {
            var box = new THREE.Box3().setFromObject(groupRef.current);
            var size = vec3(box.getSize(new THREE.Vector3())).clone();
            var center = vec3(box.getCenter(new THREE.Vector3())).clone();
            var obj = {
                type: type ? type : "normal",
                text: text,
                size: size,
                center: center,
            };
            minimap.props[text] = obj;
            dispatch({
                type: "update",
                payload: {
                    minimap: __assign({}, minimap),
                },
            });
        }
    }, []);
    return (_jsx(Suspense, { fallback: null, children: _jsx("group", { ref: groupRef, position: position, 
            // onClick={(e) => clickerPoint(e, activeState.position.clone())}
            onPointerDown: function (e) { return moveClicker(e, false); }, onDoubleClick: function (e) { return moveClicker(e, true); }, children: children }) }));
}
