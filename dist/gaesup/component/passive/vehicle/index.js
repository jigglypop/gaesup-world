import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { Wheels } from "./wheels";
export function PassiveVehicle(props) {
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var colliderRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        capsuleColliderRef: colliderRef,
    };
    var _a = useMemo(function () {
        return {
            position: props.position,
            euler: props.euler,
            vehicleSize: props.vehicleSize,
            wheelSize: props.wheelSize,
            currentAnimation: props.currentAnimation,
            wheelUrl: props.url.wheelUrl,
            vehicleUrl: props.url.vehicleUrl,
        };
    }, [props]), position = _a.position, euler = _a.euler, vehicleSize = _a.vehicleSize, wheelSize = _a.wheelSize, currentAnimation = _a.currentAnimation, wheelUrl = _a.wheelUrl, vehicleUrl = _a.vehicleUrl;
    useEffect(function () {
        if (rigidBodyRef.current) {
            rigidBodyRef.current.lockRotations(true, true);
        }
    }, []);
    return (_jsxs(OuterGroupRef, { ref: refs.outerGroupRef, children: [props.children, vehicleUrl && (_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, position: position, rotation: euler, onCollisionEnter: props.onCollisionEnter, children: [_jsx(InnerGroupRef, { currentAnimation: currentAnimation, ref: refs.innerGroupRef, url: vehicleUrl }), wheelUrl ? (_jsx(CuboidCollider, { ref: colliderRef, args: [vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2], position: [0, vehicleSize.y + wheelSize.y / 2, 0] })) : (_jsx(CuboidCollider, { ref: colliderRef, args: [vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2], position: [0, vehicleSize.y, 0] }))] })), wheelUrl && (_jsx(Wheels, { vehicleSize: vehicleSize, wheelSize: wheelSize, rigidBodyRef: rigidBodyRef, url: wheelUrl }))] }));
}
