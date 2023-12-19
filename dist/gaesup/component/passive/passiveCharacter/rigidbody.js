import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
export var PassiveCharacterRigidBody = forwardRef(function (_a, ref) {
    var children = _a.children;
    return (_jsx(RigidBody, { colliders: false, canSleep: false, ref: ref, children: children }));
});
