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
import { VehicleInnerRef } from "../../inner/vehicle";
export function VehicleRef(props) {
    return (_jsx(VehicleInnerRef, __assign({ name: "vehicle", isActive: true, currentAnimation: "idle", componentType: "vehicle", ridingUrl: props.ridingUrl }, props, { children: props.children })));
}
