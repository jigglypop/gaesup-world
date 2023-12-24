import { jsx as _jsx } from "react/jsx-runtime";
import { CapsuleCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var CharacterCapsuleCollider = forwardRef(function (_a, ref) {
    var collider = _a.collider;
    return (_jsx(CapsuleCollider, { ref: ref, args: [collider.height, collider.radius], position: [0, collider.height + collider.radius, 0] }));
});
