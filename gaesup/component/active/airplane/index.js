import { jsx as _jsx } from "react/jsx-runtime";
import { AirplaneInnerRef } from "../../inner/airplane";
export function AirplaneRef(props) {
    return (_jsx(AirplaneInnerRef, Object.assign({ name: "airplane", isActive: true, currentAnimation: "idle", componentType: "airplane", ridingUrl: props.ridingUrl }, props, { children: props.children })));
}
