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
import { Gltf } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { S3 } from "../../utils/constant";
import { GaesupWorldContext } from "../../world/context";
export var VehicleRigidBody = forwardRef(function (_a, ref) {
    var controllerProps = _a.controllerProps, children = _a.children;
    return (_jsxs(RigidBody, __assign({ colliders: false, ref: ref }, controllerProps.rigidBodyProps, { children: [controllerProps.debug && (_jsx("mesh", { visible: controllerProps.debug, children: _jsx("arrowHelper", { args: [
                        controllerProps.groundRay.dir,
                        controllerProps.groundRay.origin,
                        controllerProps.groundRay.length,
                    ] }) })), children] })));
});
export var VehicleCollider = forwardRef(function (_, ref) {
    var collider = useContext(GaesupWorldContext).vehicleCollider;
    var vehicleSizeX = collider.vehicleSizeX, vehicleSizeY = collider.vehicleSizeY, vehicleSizeZ = collider.vehicleSizeZ;
    return (_jsx(CuboidCollider, { ref: ref, args: [vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2], position: [0, vehicleSizeY / 2, 0] }));
});
export var VehicleGroup = forwardRef(function (_a, ref) {
    var controllerProps = _a.controllerProps, children = _a.children;
    return (_jsx("group", __assign({ ref: ref, userData: { intangible: true } }, controllerProps.vehicle, { children: children })));
});
export var WheelRegidBodyRef = forwardRef(function (_a, ref) {
    var wheelPosition = _a.wheelPosition, wheelsUrl = _a.wheelsUrl, bodyRef = _a.bodyRef, wheel = _a.wheel, bodyAnchor = _a.bodyAnchor, wheelAnchor = _a.wheelAnchor, rotationAxis = _a.rotationAxis;
    var collider = useContext(GaesupWorldContext).vehicleCollider;
    var wheelSizeX = collider.wheelSizeX, wheelSizeY = collider.wheelSizeY;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, ref: ref, children: [_jsx(CylinderCollider, { args: [wheelSizeX / 2, wheelSizeY / 2], rotation: [0, 0, Math.PI / 2] }), _jsx(Gltf, { src: wheelsUrl || S3 + "/wheel.glb" })] }));
});
