"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import calculation from "../physics";
import { CharacterInnerGroupRef, InnerGroupRef } from "./gltf/CharacterGltf";
import { CharacterCapsuleCollider, CharacterGroup, CharacterRigidBody, CharacterSlopeRay, } from "./ref/character";
import setInit from "./setInit";
export function Character(_a) {
    var props = _a.props, refs = _a.refs;
    var capsuleColliderRef = refs.capsuleColliderRef, rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, slopeRayOriginRef = refs.slopeRayOriginRef, characterInnerRef = refs.characterInnerRef, innerGroupRef = refs.innerGroupRef;
    calculation(props);
    setInit(rigidBodyRef);
    return (_jsxs(CharacterRigidBody, { ref: rigidBodyRef, props: props, children: [_jsx(CharacterCapsuleCollider, { props: props, ref: capsuleColliderRef }), _jsxs(CharacterGroup, { ref: outerGroupRef, props: props, children: [_jsx(CharacterSlopeRay, { slopeRay: props.slopeRay, groundRay: props.groundRay, ref: slopeRayOriginRef }), props.children, _jsx(InnerGroupRef, { ref: innerGroupRef }), _jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: characterInnerRef })] })] }));
}
