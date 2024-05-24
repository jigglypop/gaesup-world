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
import { useFrame } from "@react-three/fiber";
import { quat } from "@react-three/rapier";
import { useRef } from "react";
import { AirplaneInnerRef } from "../../inner/airplane";
export function PassiveAirplane(props) {
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var colliderRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        colliderRef: colliderRef,
    };
    useFrame(function () {
        if (innerGroupRef && innerGroupRef.current) {
            var _euler = props.rotation.clone();
            _euler.y = 0;
            innerGroupRef.current.setRotationFromQuaternion(quat()
                .setFromEuler(innerGroupRef.current.rotation.clone())
                .slerp(quat().setFromEuler(_euler), 0.2));
        }
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setGravityScale(props.position.y < 10
                ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1
                : 0.1, false);
        }
    });
    return (_jsx(AirplaneInnerRef, __assign({ isActive: false, componentType: "airplane", name: "airplane", controllerOptions: props.controllerOptions || {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        }, position: props.position, rotation: props.rotation, currentAnimation: props.currentAnimation, ridingUrl: props.ridingUrl }, props, refs, { children: props.children })));
}
