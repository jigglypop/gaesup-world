import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export var WheelRegidBodyRef = forwardRef(function (_a, ref) {
    var wheelPosition = _a.wheelPosition, bodyRef = _a.bodyRef, wheel = _a.wheel, bodyAnchor = _a.bodyAnchor, wheelAnchor = _a.wheelAnchor, rotationAxis = _a.rotationAxis;
    var _b = useContext(GaesupWorldContext), collider = _b.vehicleCollider, url = _b.url;
    var wheelSizeX = collider.wheelSizeX, wheelSizeY = collider.wheelSizeY;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, ref: ref, children: [_jsx(CylinderCollider, { args: [wheelSizeX / 2, wheelSizeY / 2], rotation: [0, 0, Math.PI / 2] }), _jsx(Gltf, { src: url.wheelUrl })] }));
});
