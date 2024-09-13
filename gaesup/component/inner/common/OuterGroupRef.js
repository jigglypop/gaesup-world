import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
export const OuterGroupRef = forwardRef(({ children, }, ref) => {
    return (_jsx("group", { ref: ref, userData: { intangible: true }, children: children }));
});
