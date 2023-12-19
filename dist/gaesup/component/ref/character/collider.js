import { jsx as _jsx } from "react/jsx-runtime";
import { CapsuleCollider, useRapier } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { getRayHit, useForwardRef } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
export var CharacterCapsuleCollider = forwardRef(function (_a, ref) {
    var _b;
    var props = _a.props;
    var collider = useContext(GaesupWorldContext).characterCollider;
    var colliderRef = useForwardRef(ref);
    var rapier = useRapier().rapier;
    var groundRay = props.groundRay, slopeRay = props.slopeRay;
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
