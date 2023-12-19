import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export var CharacterOuterGroup = forwardRef(function (_a, ref) {
    var children = _a.children;
    var mode = useContext(GaesupWorldContext).mode;
    return (_jsx("group", { ref: ref, userData: { intangible: true }, visible: mode.type === "character", children: children }));
});
