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
import { AirplaneInnerRef } from "../../inner/airplane";
export function AirplaneRef(props) {
    return (_jsx(AirplaneInnerRef, __assign({ name: "airplane", isActive: true, currentAnimation: "idle", componentType: "airplane", ridingUrl: props.ridingUrl }, props, { children: props.children })));
}
