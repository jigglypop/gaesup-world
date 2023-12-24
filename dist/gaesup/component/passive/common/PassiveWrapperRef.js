import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { InnerGroupRef } from "./InnerGroupRef";
import { RigidBodyRef } from "./RigidbodyRef";
export function PassiveWrapperRef(_a) {
    var children = _a.children, outerChildren = _a.outerChildren, props = _a.props, refs = _a.refs, url = _a.url;
    return (_jsxs(OuterGroupRef, { ref: refs.outerGroupRef, children: [_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, children: [children, _jsx(InnerGroupRef, { props: props, ref: refs.innerGroupRef, url: url })] }), outerChildren] }));
}
