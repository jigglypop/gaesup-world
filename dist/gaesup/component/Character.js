"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import calculation from "../physics";
import { CharacterInnerGroupRef, InnerGroupRef } from "./gltf/CharacterGltf";
import { CharacterCapsuleCollider, CharacterGroup, CharacterRigidBody, CharacterSlopeRay, } from "./ref/character";
import setInit from "./setInit";
export function Character(_a) {
    var controllerProps = _a.controllerProps, refs = _a.refs;
    var capsuleColliderRef = refs.capsuleColliderRef, rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, slopeRayOriginRef = refs.slopeRayOriginRef, characterInnerRef = refs.characterInnerRef, innerGroupRef = refs.innerGroupRef;
    calculation(controllerProps);
    setInit(rigidBodyRef);
    return (_jsxs(CharacterRigidBody, { ref: rigidBodyRef, controllerProps: controllerProps, children: [_jsx(CharacterCapsuleCollider, { prop: controllerProps, ref: capsuleColliderRef }), _jsxs(CharacterGroup, { ref: outerGroupRef, controllerProps: controllerProps, children: [_jsx(CharacterSlopeRay, { slopeRay: controllerProps.slopeRay, groundRay: controllerProps.groundRay, ref: slopeRayOriginRef }), controllerProps.children, _jsx(InnerGroupRef, { ref: innerGroupRef }), _jsx(CharacterInnerGroupRef, { prop: controllerProps, groupProps: controllerProps.groupProps, groundRay: controllerProps.groundRay, refs: refs, callbacks: controllerProps.callbacks, ref: characterInnerRef, isRider: false })] })] }));
}
