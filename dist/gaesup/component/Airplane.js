"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import calculation from "../physics";
import { AirplaneInnerGroupRef } from "./gltf/AirplaneGltf";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { AirplaneCollider, AirplaneGroup, AirplaneRigidBody, } from "./ref/airplane";
import setInit from "./setInit";
export function Airplane(_a) {
    var props = _a.props, refs = _a.refs;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, capsuleColliderRef = refs.capsuleColliderRef, innerGroupRef = refs.innerGroupRef, characterInnerRef = refs.characterInnerRef;
    calculation(props);
    setInit(rigidBodyRef);
    return (_jsx(_Fragment, { children: _jsx(AirplaneGroup, { ref: outerGroupRef, props: props, children: _jsxs(AirplaneRigidBody, { ref: rigidBodyRef, props: props, children: [_jsx(AirplaneCollider, { prop: props, ref: capsuleColliderRef }), props.isRider && (_jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: characterInnerRef })), _jsx(AirplaneInnerGroupRef, { ref: innerGroupRef })] }) }) }));
}
