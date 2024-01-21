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
import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children, name = _a.name;
    return (_jsx(RigidBody, { colliders: false, ref: ref, name: name, children: children }));
});
export var PassiveRigidBodyRef = forwardRef(function (_a, ref) {
    var props = _a.props, children = _a.children;
    return (_jsx(RigidBody, __assign({ colliders: false, ref: ref }, props.rigidBodyProps, { children: children })));
});
