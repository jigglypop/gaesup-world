"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import calculation from "../physics";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { VehicleInnerGroupRef } from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import setInit from "./setInit";
export function Vehicle(_a) {
    var controllerProps = _a.controllerProps, refs = _a.refs;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, characterInnerRef = refs.characterInnerRef, innerGroupRef = refs.innerGroupRef;
    calculation(controllerProps);
    setInit(rigidBodyRef);
    return (_jsxs(VehicleGroup, { ref: outerGroupRef, controllerProps: controllerProps, children: [_jsxs(VehicleRigidBody, { ref: rigidBodyRef, controllerProps: controllerProps, children: [_jsx(VehicleCollider, {}), controllerProps.isRider && (_jsx(CharacterInnerGroupRef, { prop: controllerProps, groupProps: controllerProps.groupProps, groundRay: controllerProps.groundRay, refs: refs, callbacks: controllerProps.callbacks, ref: characterInnerRef, isRider: true })), _jsx(VehicleInnerGroupRef, { ref: innerGroupRef })] }), _jsx(Wheels, { prop: controllerProps })] }));
}
