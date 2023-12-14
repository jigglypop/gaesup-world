"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import calculation from "../physics";
import { AirplaneInnerGroupRef } from "./gltf/AirplaneGltf";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { AirplaneCollider, AirplaneGroup, AirplaneRigidBody, } from "./ref/airplane";
import setInit from "./setInit";
export function Airplane(_a) {
    var controllerProps = _a.controllerProps, refs = _a.refs;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, capsuleColliderRef = refs.capsuleColliderRef, innerGroupRef = refs.innerGroupRef, characterInnerRef = refs.characterInnerRef;
    calculation(controllerProps);
    setInit(rigidBodyRef);
    return (_jsx(_Fragment, { children: _jsx(AirplaneGroup, { ref: outerGroupRef, controllerProps: controllerProps, children: _jsxs(AirplaneRigidBody, { ref: rigidBodyRef, controllerProps: controllerProps, children: [_jsx(AirplaneCollider, { prop: controllerProps, ref: capsuleColliderRef }), controllerProps.isRider && (_jsx(CharacterInnerGroupRef, { prop: controllerProps, groupProps: controllerProps.groupProps, groundRay: controllerProps.groundRay, refs: refs, callbacks: controllerProps.callbacks, isRider: controllerProps.isRider, ref: characterInnerRef })), _jsx(AirplaneInnerGroupRef, { ref: innerGroupRef })] }) }) }));
}
