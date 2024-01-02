import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { quat } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { AirplaneCollider } from "./collider";
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
        };
    }, [props]), position = _a.position, euler = _a.euler, currentAnimation = _a.currentAnimation, airplaneUrl = _a.airplaneUrl;
    useFrame(function () {
        if (innerGroupRef && innerGroupRef.current) {
            var _euler = euler.clone();
            _euler.y = 0;
            innerGroupRef.current.setRotationFromQuaternion(quat()
                .setFromEuler(innerGroupRef.current.rotation.clone())
                .slerp(quat().setFromEuler(_euler), 0.2));
        }
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setGravityScale(props.gravity, false);
        }
    });
    return (_jsx(OuterGroupRef, { ref: refs.outerGroupRef, children: props.airplaneUrl && (_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, position: props.position, rotation: props.euler, children: [_jsx(InnerGroupRef, { currentAnimation: props.currentAnimation, ref: refs.innerGroupRef, url: props.airplaneUrl }), _jsx(AirplaneCollider, { airplaneSize: props.airplaneSize, ref: colliderRef })] })) }));
}
