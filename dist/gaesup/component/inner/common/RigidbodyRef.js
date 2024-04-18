import { jsx as _jsx } from "react/jsx-runtime";
import { RigidBody, euler, } from "@react-three/rapier";
import { forwardRef, useEffect, useState, } from "react";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children, name = _a.name, position = _a.position, rotation = _a.rotation, userData = _a.userData, onCollisionEnter = _a.onCollisionEnter, positionLerp = _a.positionLerp, type = _a.type;
    var _b = useState(position), newPosition = _b[0], setNewPosition = _b[1];
    useEffect(function () {
        if (!positionLerp)
            return;
        setNewPosition(function (ordPosition) {
            return ordPosition.lerp(position.clone(), positionLerp);
        });
    }, [position, positionLerp]);
    return (_jsx(RigidBody, { colliders: false, ref: ref, name: name, position: positionLerp ? newPosition === null || newPosition === void 0 ? void 0 : newPosition.clone() : position, rotation: euler().set(0, (rotation === null || rotation === void 0 ? void 0 : rotation.clone().y) || 0, 0), userData: userData, onCollisionEnter: onCollisionEnter, type: type || "dynamic", children: children }));
});
