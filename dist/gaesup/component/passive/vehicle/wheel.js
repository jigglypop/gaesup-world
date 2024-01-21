import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { forwardRef, useRef } from "react";
export var WheelRegidBodyRef = forwardRef(function (_a, ref) {
    var props = _a.props;
    var bodyRef = props.bodyRef, wheel = props.wheel, bodyAnchor = props.bodyAnchor, wheelAnchor = props.wheelAnchor, rotationAxis = props.rotationAxis, wheelPosition = props.wheelPosition, wheelSize = props.wheelSize, url = props.url;
    useRevoluteJoint(bodyRef, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
        [0, 0],
    ]);
    var refs = useRef(null);
    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, ref: ref, children: [_jsx(CylinderCollider, { args: [wheelSize.x / 2, wheelSize.y / 2], rotation: [0, 0, Math.PI / 2], ref: refs }), _jsx(Gltf, { src: url })] }));
});
