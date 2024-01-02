import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { forwardRef, useContext, useRef } from "react";
import { GaesupWorldContext } from "../../../world/context";
export var WheelRegidBodyRef = forwardRef(function (_a, ref) {
    var index = _a.index, wheelPosition = _a.wheelPosition, bodyRef = _a.bodyRef, wheel = _a.wheel, bodyAnchor = _a.bodyAnchor, wheelAnchor = _a.wheelAnchor, rotationAxis = _a.rotationAxis;
    var _b = useContext(GaesupWorldContext), collider = _b.vehicleCollider, url = _b.url;
    var wheelSizeX = collider.wheelSizeX, wheelSizeY = collider.wheelSizeY;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
    var colliderRef = useRef(null);
    return (_jsxs(RigidBody, { colliders: false, ref: ref, userData: { intangible: true }, args: [wheelSizeX / 2, wheelSizeY / 2], rotation: [0, 0, Math.PI / 2], children: [_jsx(CylinderCollider, { args: [wheelSizeX / 2, wheelSizeY / 2], rotation: [0, 0, Math.PI / 2], ref: colliderRef }), _jsx(Gltf, { src: url.wheelUrl })] }));
});
