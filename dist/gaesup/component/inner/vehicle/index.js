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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { WheelsRef } from "./wheels";
export function VehicleInnerRef(props) {
    var _a = props.urls, vehicleUrl = _a.vehicleUrl, wheelUrl = _a.wheelUrl;
    var _b = props.refs, rigidBodyRef = _b.rigidBodyRef, innerGroupRef = _b.innerGroupRef, outerGroupRef = _b.outerGroupRef, colliderRef = _b.colliderRef;
    var vehicleSize = useGltfAndSize({
        url: props.urls.vehicleUrl,
    }).size;
    return (_jsxs(OuterGroupRef, { ref: outerGroupRef, children: [vehicleUrl && (_jsx(RigidBodyRef, __assign({ ref: rigidBodyRef, name: props.name, url: props.urls.vehicleUrl, outerGroupRef: outerGroupRef, innerGroupRef: innerGroupRef, rigidBodyRef: rigidBodyRef, colliderRef: colliderRef, componentType: "vehicle" }, props, { children: props.children }))), wheelUrl && (_jsx(WheelsRef, { refs: props.refs, urls: props.urls, vehicleSize: vehicleSize }))] }));
}
