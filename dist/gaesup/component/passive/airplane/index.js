import { jsx as _jsx } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { quat, } from "@react-three/rapier";
import { useMemo, useRef } from "react";
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
    var _a = useMemo(function () {
        return {
            position: props.position,
            euler: props.euler,
            currentAnimation: props.currentAnimation,
            urls: props.urls,
        };
    }, [props]), position = _a.position, euler = _a.euler, currentAnimation = _a.currentAnimation, urls = _a.urls;
    useFrame(function () {
        if (innerGroupRef && innerGroupRef.current) {
            var _euler = euler.clone();
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
    return (_jsx(AirplaneInnerRef, { refs: refs, urls: urls, position: position, rotation: euler, userData: { intangible: true }, onCollisionEnter: props.onCollisionEnter, currentAnimation: props.currentAnimation, type: props.type, children: props.children }));
}
