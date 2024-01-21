import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody, } from "@react-three/rapier";
import { forwardRef } from "react";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children, position = _a.position, rotation = _a.rotation, onCollisionEnter = _a.onCollisionEnter;
    var _euler = rotation.clone();
    _euler.x = 0;
    _euler.z = 0;
    return (_jsx(RigidBody, { colliders: false, ref: ref, position: position, rotation: _euler, userData: { intangible: true }, onCollisionEnter: onCollisionEnter, children: children }));
});
