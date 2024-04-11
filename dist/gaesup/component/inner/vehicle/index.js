import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import RiderRef from "../rider";
import { VehicleCollider, VehicleWheelCollider } from "./collider";
import { WheelsRef } from "./wheels";
export function VehicleInnerRef(_a) {
    var children = _a.children, refs = _a.refs, urls = _a.urls, isRiderOn = _a.isRiderOn, enableRiding = _a.enableRiding, offset = _a.offset, name = _a.name, position = _a.position, rotation = _a.rotation, userData = _a.userData, currentAnimation = _a.currentAnimation, onCollisionEnter = _a.onCollisionEnter, type = _a.type;
    var vehicleUrl = urls.vehicleUrl, wheelUrl = urls.wheelUrl;
    var rigidBodyRef = refs.rigidBodyRef, innerGroupRef = refs.innerGroupRef, outerGroupRef = refs.outerGroupRef;
    var vehicleSize = useGltfAndSize({
        url: urls.vehicleUrl,
    }).size;
    return (_jsxs(OuterGroupRef, { ref: outerGroupRef, children: [vehicleUrl && rigidBodyRef && (_jsxs(RigidBodyRef, { ref: rigidBodyRef, name: name, position: position, rotation: rotation, userData: userData, onCollisionEnter: onCollisionEnter, type: type, children: [wheelUrl ? (_jsx(VehicleWheelCollider, { urls: urls, vehicleSize: vehicleSize })) : (_jsx(VehicleCollider, { vehicleSize: vehicleSize })), enableRiding && isRiderOn && urls.characterUrl && (_jsx(RiderRef, { urls: urls, offset: offset })), children, _jsx(InnerGroupRef, { type: "vehicle", url: vehicleUrl, currentAnimation: currentAnimation, ref: innerGroupRef })] })), wheelUrl && (_jsx(WheelsRef, { refs: refs, urls: urls, vehicleSize: vehicleSize }))] }));
}
