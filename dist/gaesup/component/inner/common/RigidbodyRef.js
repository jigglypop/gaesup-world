import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody, euler, } from "@react-three/rapier";
import { forwardRef } from "react";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children, name = _a.name, position = _a.position, rotation = _a.rotation, userData = _a.userData, onCollisionEnter = _a.onCollisionEnter;
    return (_jsx(RigidBody, { colliders: false, ref: ref, name: name, position: position, rotation: euler().set(0, (rotation === null || rotation === void 0 ? void 0 : rotation.clone().y) || 0, 0), userData: userData, onCollisionEnter: onCollisionEnter, children: children }));
});
