import { jsx as _jsx } from "react/jsx-runtime";
import { CapsuleCollider } from "@react-three/rapier";
import { forwardRef } from "react";
export var CharacterCapsuleCollider = forwardRef(function (_a, ref) {
    var height = _a.height, diameter = _a.diameter;
    return (_jsx(CapsuleCollider, { ref: ref, args: [height, diameter / 2], position: [0, height + diameter / 2, 0] }));
});
