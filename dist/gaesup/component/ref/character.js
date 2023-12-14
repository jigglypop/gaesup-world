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
import { CapsuleCollider, RigidBody, useRapier, } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { getRayHit } from "../../utils/ray";
import { useForwardRef } from "../../utils/ref";
import { GaesupWorldContext } from "../../world/context";
export var CharacterRigidBody = forwardRef(function (_a, ref) {
    var controllerProps = _a.controllerProps, children = _a.children;
    return (_jsxs(RigidBody, __assign({ colliders: false, canSleep: false, ref: ref }, controllerProps.rigidBodyProps, { children: [controllerProps.debug && (_jsx("mesh", { visible: controllerProps.debug, children: _jsx("arrowHelper", { args: [
                        controllerProps.groundRay.dir,
                        controllerProps.groundRay.origin,
                        controllerProps.groundRay.length,
                    ] }) })), children] })));
});
export var CharacterCapsuleCollider = forwardRef(function (_a, ref) {
    var _b;
    var prop = _a.prop;
    var collider = useContext(GaesupWorldContext).characterCollider;
    var colliderRef = useForwardRef(ref);
    var rapier = useRapier().rapier;
    var groundRay = prop.groundRay, slopeRay = prop.slopeRay;
    groundRay.length = collider.radius + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
        ray: groundRay,
        ref: colliderRef,
    });
    groundRay.parent = (_b = groundRay.hit) === null || _b === void 0 ? void 0 : _b.collider.parent();
    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);
    slopeRay.length = collider.radius + 3;
    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);
    return (_jsx(CapsuleCollider, { ref: ref, args: [collider.height, collider.radius] }));
});
export var CharacterGroup = forwardRef(function (_a, ref) {
    var controllerProps = _a.controllerProps, children = _a.children;
    return (_jsx("group", __assign({ ref: ref, userData: { intangible: true } }, controllerProps.character, { children: children })));
});
export var CharacterSlopeRay = forwardRef(function (_a, ref) {
    var groundRay = _a.groundRay, slopeRay = _a.slopeRay;
    return (_jsx("mesh", { position: [
            groundRay.offset.x,
            groundRay.offset.y,
            groundRay.offset.z + slopeRay.offset.z,
        ], ref: ref, visible: false, userData: { intangible: true }, children: _jsx("boxGeometry", { args: [0.15, 0.15, 0.15] }) }));
});
