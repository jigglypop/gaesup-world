import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { forwardRef } from "react";
export var WheelRegidBodyRef = forwardRef(function (_a, ref) {
    var props = _a.props;
    var _b = props.vehicleCollider, wheelSizeX = _b.wheelSizeX, wheelSizeY = _b.wheelSizeY, bodyRef = props.bodyRef, wheel = props.wheel, bodyAnchor = props.bodyAnchor, wheelAnchor = props.wheelAnchor, rotationAxis = props.rotationAxis, wheelPosition = props.wheelPosition, url = props.url;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, ref: ref, children: [_jsx(CylinderCollider, { args: [wheelSizeX / 2, wheelSizeY / 2], rotation: [0, 0, Math.PI / 2] }), _jsx(Gltf, { src: url })] }));
});
