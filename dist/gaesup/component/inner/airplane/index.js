import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CuboidCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import RiderRef from "../rider";
export function AirplaneInnerRef(_a) {
    var children = _a.children, refs = _a.refs, urls = _a.urls, isRiderOn = _a.isRiderOn, enableRiding = _a.enableRiding, offset = _a.offset, name = _a.name, position = _a.position, rotation = _a.rotation, userData = _a.userData, onCollisionEnter = _a.onCollisionEnter, type = _a.type;
    var airplaneUrl = urls.airplaneUrl;
    var rigidBodyRef = refs.rigidBodyRef, innerGroupRef = refs.innerGroupRef, outerGroupRef = refs.outerGroupRef;
    var size = useGltfAndSize({
        url: airplaneUrl,
    }).size;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: airplaneUrl && (_jsxs(RigidBodyRef, { ref: rigidBodyRef, name: name, position: position, rotation: rotation, userData: userData, onCollisionEnter: onCollisionEnter, type: type, children: [_jsx(CuboidCollider, { args: [size.x / 2, size.y / 2, size.z / 2], position: [0, size.y / 2, 0] }), children, _jsx(InnerGroupRef, { type: "airplane", url: airplaneUrl, currentAnimation: "idle", ref: innerGroupRef, children: enableRiding && isRiderOn && urls.characterUrl && (_jsx(RiderRef, { urls: urls, offset: offset })) })] })) }));
}
