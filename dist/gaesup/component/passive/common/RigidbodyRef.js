import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children;
    return (_jsx(RigidBody, { colliders: false, ref: ref, userData: { intangible: true }, children: children }));
});
