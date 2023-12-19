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
import { RigidBody } from "@react-three/rapier";
import { forwardRef } from "react";
export var CharacterRigidBody = forwardRef(function (_a, ref) {
    var props = _a.props, children = _a.children;
    return (_jsxs(RigidBody, __assign({ colliders: false, canSleep: false, ref: ref }, props.rigidBodyProps, { children: [props.debug && (_jsx("mesh", { visible: props.debug, children: _jsx("arrowHelper", { args: [
                        props.groundRay.dir,
                        props.groundRay.origin,
                        props.groundRay.length,
                    ] }) })), children] })));
});
