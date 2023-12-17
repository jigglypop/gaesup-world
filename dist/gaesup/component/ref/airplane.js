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
import { CuboidCollider, RigidBody, useRapier, } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { getRayHit } from "../../utils/ray";
import { useForwardRef } from "../../utils/ref";
import { GaesupWorldContext } from "../../world/context";
export var AirplaneRigidBody = forwardRef(function (_a, ref) {
    var props = _a.props, children = _a.children;
    return (_jsxs(RigidBody, __assign({ colliders: false, ref: ref }, props.rigidBodyProps, { children: [props.debug && (_jsx("mesh", { visible: props.debug, children: _jsx("arrowHelper", { args: [
                        props.groundRay.dir,
                        props.groundRay.origin,
                        props.groundRay.length,
                    ] }) })), children] })));
});
export var AirplaneCollider = forwardRef(function (_a, ref) {
    var _b;
    var prop = _a.prop;
    var collider = useContext(GaesupWorldContext).airplaneCollider;
    var airplaneSizeX = collider.airplaneSizeX, airplaneSizeY = collider.airplaneSizeY, airplaneSizeZ = collider.airplaneSizeZ;
    var colliderRef = useForwardRef(ref);
    var rapier = useRapier().rapier;
    var groundRay = prop.groundRay;
    groundRay.length = airplaneSizeY * 5 + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
        ray: groundRay,
        ref: colliderRef,
    });
    groundRay.parent = (_b = groundRay.hit) === null || _b === void 0 ? void 0 : _b.collider.parent();
    return (_jsx(CuboidCollider, { ref: ref, args: [airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2], position: [0, airplaneSizeY / 2, 0] }));
});
export var AirplaneGroup = forwardRef(function (_a, ref) {
    var props = _a.props, children = _a.children;
    return (_jsx("group", __assign({ ref: ref, userData: { intangible: true } }, props.airplane, { children: children })));
});
