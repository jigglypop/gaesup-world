import { jsx as _jsx } from "react/jsx-runtime";
import { AirplaneInnerRef } from "../../inner/airplane";
export function AirplaneRef(_a) {
    var children = _a.children, enableRiding = _a.enableRiding, isRiderOn = _a.isRiderOn, offset = _a.offset, refs = _a.refs, urls = _a.urls;
    return (_jsx(AirplaneInnerRef, { refs: refs, urls: urls, name: "airplane", isRiderOn: isRiderOn, enableRiding: enableRiding, offset: offset, outerGroupRef: refs.outerGroupRef, innerGroupRef: refs.innerGroupRef, rigidBodyRef: refs.rigidBodyRef, colliderRef: refs.colliderRef, isActive: true, currentAnimation: "idle", componentType: "airplane", children: children }));
}
