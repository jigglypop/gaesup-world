"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import calculation from "../physics";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { VehicleInnerGroupRef } from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import setInit from "./setInit";
export function Vehicle(_a) {
    var props = _a.props, refs = _a.refs;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, characterInnerRef = refs.characterInnerRef, innerGroupRef = refs.innerGroupRef;
    calculation(props);
    setInit(rigidBodyRef);
    return (_jsxs(VehicleGroup, { ref: outerGroupRef, props: props, children: [_jsxs(VehicleRigidBody, { ref: rigidBodyRef, props: props, children: [_jsx(VehicleCollider, {}), props.isRider && (_jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: characterInnerRef })), _jsx(VehicleInnerGroupRef, { ref: innerGroupRef })] }), _jsx(Wheels, { props: props })] }));
}
