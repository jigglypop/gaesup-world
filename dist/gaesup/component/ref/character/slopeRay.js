import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
export var CharacterSlopeRay = forwardRef(function (_a, ref) {
    var groundRay = _a.groundRay, slopeRay = _a.slopeRay;
    return (_jsx("mesh", { position: [
            groundRay.offset.x,
            groundRay.offset.y,
            groundRay.offset.z + slopeRay.offset.z,
        ], ref: ref, visible: false, userData: { intangible: true }, children: _jsx("boxGeometry", { args: [0.15, 0.15, 0.15] }) }));
});
