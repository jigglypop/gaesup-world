import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
export var OuterGroupRef = forwardRef(function (_a, ref) {
    var children = _a.children;
    return (_jsx("group", { ref: ref, userData: { intangible: true }, children: children }));
});
