import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import initCallback from "../../../controller/initialize/callback";
import { CharacterCapsuleCollider } from "./collider";
import { CharacterGroup } from "./group";
import { CharacterInnerGroupRef, InnerGroupRef } from "./innerGltf";
import { CharacterOuterGroup } from "./outerGroup";
import { CharacterRigidBody } from "./rigidbody";
import { CharacterSlopeRay } from "./slopeRay";
export function CharacterRef(_a) {
    var props = _a.props, refs = _a.refs, isPassive = _a.isPassive;
    initCallback(props);
    return (_jsx(CharacterOuterGroup, { children: _jsxs(CharacterRigidBody, { ref: refs.rigidBodyRef, props: props, children: [_jsx(CharacterCapsuleCollider, { props: props, ref: refs.capsuleColliderRef }), _jsxs(CharacterGroup, { ref: refs.outerGroupRef, props: props, children: [_jsx(CharacterSlopeRay, { slopeRay: props.slopeRay, groundRay: props.groundRay, ref: refs.slopeRayOriginRef }), props.children, _jsx(InnerGroupRef, { ref: refs.innerGroupRef }), _jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: refs.characterInnerRef })] })] }) }));
}
