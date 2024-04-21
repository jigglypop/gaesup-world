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
import { CuboidCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export function AirplaneInnerRef(props) {
    var airplaneUrl = props.urls.airplaneUrl;
    var _a = props.refs, rigidBodyRef = _a.rigidBodyRef, innerGroupRef = _a.innerGroupRef, outerGroupRef = _a.outerGroupRef, colliderRef = _a.colliderRef;
    var size = useGltfAndSize({
        url: airplaneUrl,
    }).size;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: airplaneUrl && (_jsxs(RigidBodyRef, __assign({ ref: rigidBodyRef, name: props.name, url: props.urls.vehicleUrl, outerGroupRef: outerGroupRef, innerGroupRef: innerGroupRef, rigidBodyRef: rigidBodyRef, colliderRef: colliderRef, componentType: "vehicle" }, props, { children: [_jsx(CuboidCollider, { args: [size.x / 2, size.y / 2, size.z / 2], position: [0, size.y / 2, 0] }), props.children] }))) }));
}
