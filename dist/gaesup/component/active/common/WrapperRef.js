import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { SlopeRayRef } from "../common/slopeRayRef";
import { RigidBodyRef } from "./RigidbodyRef";
export function WrapperRef(_a) {
    var children = _a.children, outerChildren = _a.outerChildren, props = _a.props, refs = _a.refs, gltf = _a.gltf, animationRef = _a.animationRef;
    return (_jsxs(OuterGroupRef, { ref: refs.outerGroupRef, props: props, children: [_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, children: [_jsx(SlopeRayRef, { slopeRay: props.slopeRay, groundRay: props.groundRay, ref: refs.slopeRayOriginRef }), children, props.children, _jsx(InnerGroupRef, { props: props, gltf: gltf, ref: refs.innerGroupRef, animationRef: animationRef })] }), outerChildren] }));
}
