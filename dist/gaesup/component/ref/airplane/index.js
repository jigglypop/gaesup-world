import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CharacterInnerGroupRef } from "../character/innerGltf";
import { AirplaneCollider } from "./collider";
import { AirplaneGroup } from "./group";
import { AirplaneInnerGroupRef } from "./innerGltf";
import { AirplaneRigidBody } from "./rigidbody";
export function AirplaneRef(_a) {
    var props = _a.props, refs = _a.refs;
    return (_jsx(AirplaneGroup, { ref: refs.outerGroupRef, props: props, children: _jsxs(AirplaneRigidBody, { ref: refs.rigidBodyRef, props: props, children: [_jsx(AirplaneCollider, { prop: props, ref: refs.capsuleColliderRef }), props.isRider && (_jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: refs.characterInnerRef })), _jsx(AirplaneInnerGroupRef, { ref: refs.innerGroupRef })] }) }));
}
