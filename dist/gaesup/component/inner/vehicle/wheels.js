import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { createRef, useContext, useRef } from "react";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { GaesupWorldContext } from "../../../world/context";
var WheelJoint = function (_a) {
    var body = _a.body, wheel = _a.wheel, bodyAnchor = _a.bodyAnchor, wheelAnchor = _a.wheelAnchor, rotationAxis = _a.rotationAxis;
    var joint = useRevoluteJoint(body, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    ]);
    var activeState = useContext(GaesupWorldContext).activeState;
    useFrame(function () {
        if (joint.current) {
            joint.current.configureMotorPosition(activeState.position.length(), 0.8, 0);
        }
    });
    return null;
};
export function WheelsRef(_a) {
    var vehicleSize = _a.vehicleSize, refs = _a.refs, urls = _a.urls;
    var wheelUrl = urls.wheelUrl;
    var rigidBodyRef = refs.rigidBodyRef;
    var wheelSize = useGltfAndSize({
        url: urls.wheelUrl,
    }).size;
    var X = (vehicleSize.x - wheelSize.x) / 2;
    var Z = (vehicleSize.z - 2 * wheelSize.z) / 2;
    var wheelPositions = [
        [-X, 0, Z],
        [-X, 0, -Z],
        [X, 0, Z],
        [X, 0, -Z],
    ];
    var wheelRefs = useRef(wheelPositions.map(function () { return createRef(); }));
    return (_jsxs(_Fragment, { children: [rigidBodyRef &&
                wheelUrl &&
                wheelRefs &&
                wheelPositions.map(function (wheelPosition, index) {
                    if (!wheelRefs ||
                        !wheelRefs.current ||
                        !wheelRefs.current[index] ||
                        !wheelSize.x ||
                        !wheelSize.y)
                        return _jsx(_Fragment, {});
                    var wheelRef = wheelRefs.current[index];
                    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, type: "dynamic", ref: wheelRef, rotation: [0, 0, Math.PI / 2], children: [_jsx(CylinderCollider, { rotation: [0, 0, Math.PI / 2], args: [wheelSize.x / 2, wheelSize.y / 2] }), _jsx(Gltf, { src: wheelUrl })] }, index));
                }), rigidBodyRef &&
                wheelUrl &&
                wheelRefs &&
                wheelPositions.map(function (wheelPosition, index) {
                    if (!wheelRefs ||
                        !wheelRefs.current ||
                        !wheelRefs.current[index] ||
                        !wheelSize.x ||
                        !wheelSize.y)
                        return _jsx(_Fragment, {});
                    var wheelRef = wheelRefs.current[index];
                    return (_jsx(WheelJoint, { body: rigidBodyRef, wheel: wheelRef, bodyAnchor: wheelPosition, wheelAnchor: [0, 0, 0], rotationAxis: [1, 0, 0] }, index));
                })] }));
}
