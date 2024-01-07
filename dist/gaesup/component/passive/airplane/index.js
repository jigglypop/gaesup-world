import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, quat } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
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
            airplaneUrl: props.airplaneUrl,
            airplaneSize: props.airplaneSize,
        };
    }, [props]), position = _a.position, euler = _a.euler, currentAnimation = _a.currentAnimation, airplaneUrl = _a.airplaneUrl, airplaneSize = _a.airplaneSize;
    useFrame(function () {
        if (innerGroupRef && innerGroupRef.current) {
            var _euler = euler.clone();
            _euler.y = 0;
            innerGroupRef.current.setRotationFromQuaternion(quat()
                .setFromEuler(innerGroupRef.current.rotation.clone())
                .slerp(quat().setFromEuler(_euler), 0.2));
        }
        // if (rigidBodyRef && rigidBodyRef.current) {
        //   rigidBodyRef.current.setGravityScale(props.gravity, false);
        // }
    });
    return (_jsxs(OuterGroupRef, { ref: refs.outerGroupRef, children: [props.children, airplaneUrl && (_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, position: position, rotation: euler, onCollisionEnter: props.onCollisionEnter, children: [_jsx(InnerGroupRef, { currentAnimation: currentAnimation, ref: refs.innerGroupRef, url: airplaneUrl }), _jsx(CuboidCollider, { ref: colliderRef, args: [airplaneSize.x / 2, airplaneSize.y / 2, airplaneSize.z / 2], position: [0, airplaneSize.y / 2, 0] })] }))] }));
}
