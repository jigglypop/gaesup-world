import { jsx as _jsx } from "react/jsx-runtime";
import { CuboidCollider, useRapier } from "@react-three/rapier";
import { forwardRef, useContext } from "react";
import { getRayHit, useForwardRef } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
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
