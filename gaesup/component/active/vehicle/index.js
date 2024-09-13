import { jsx as _jsx } from "react/jsx-runtime";
import { VehicleInnerRef } from "../../inner/vehicle";
export function VehicleRef(props) {
    return (_jsx(VehicleInnerRef, Object.assign({ name: "vehicle", isActive: true, currentAnimation: "idle", componentType: "vehicle", ridingUrl: props.ridingUrl }, props, { children: props.children })));
}
