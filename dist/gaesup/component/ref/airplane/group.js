var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export var AirplaneGroup = forwardRef(function (_a, ref) {
    var props = _a.props, children = _a.children;
    var mode = useContext(GaesupWorldContext).mode;
    return (_jsx("group", __assign({ ref: ref, userData: { intangible: true } }, props.airplane, { visible: mode.type === "airplane", children: children })));
});
