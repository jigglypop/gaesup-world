import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, useRevoluteJoint, } from "@react-three/rapier";
import { createRef, useContext, useRef } from "react";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { GaesupWorldContext } from "../../../world/context";
const WheelJoint = ({ body, wheel, bodyAnchor, wheelAnchor, rotationAxis, }) => {
    const joint = useRevoluteJoint(body, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    ]);
    const { activeState } = useContext(GaesupWorldContext);
    useFrame(() => {
        if (joint.current) {
            joint.current.configureMotorPosition(activeState.position.length(), 0.8, 0);
        }
    });
    return null;
};
export function WheelsRef({ vehicleSize, rigidBodyRef, wheelUrl, }) {
    const { size: wheelSize } = useGltfAndSize({
        url: wheelUrl,
    });
    const X = (vehicleSize.x - wheelSize.x) / 2;
    const Z = (vehicleSize.z - 2 * wheelSize.z) / 2;
    const wheelPositions = [
        [-X, 0, Z],
        [-X, 0, -Z],
        [X, 0, Z],
        [X, 0, -Z],
    ];
    const wheelRefs = useRef(wheelPositions.map(() => createRef()));
    return (_jsxs(_Fragment, { children: [wheelRefs &&
                wheelPositions.map((wheelPosition, index) => {
                    if (!wheelRefs ||
                        !wheelRefs.current ||
                        !wheelRefs.current[index] ||
                        !wheelSize.x ||
                        !wheelSize.y)
                        return _jsx(_Fragment, {});
                    const wheelRef = wheelRefs.current[index];
                    return (_jsxs(RigidBody, { position: wheelPosition, colliders: false, type: "dynamic", ref: wheelRef, rotation: [0, 0, Math.PI / 2], children: [_jsx(CylinderCollider, { rotation: [0, 0, Math.PI / 2], args: [wheelSize.x / 2, wheelSize.y / 2] }), _jsx(Gltf, { src: wheelUrl })] }, index));
                }), wheelRefs &&
                wheelPositions.map((wheelPosition, index) => {
                    if (!wheelRefs ||
                        !wheelRefs.current ||
                        !wheelRefs.current[index] ||
                        !wheelSize.x ||
                        !wheelSize.y)
                        return _jsx(_Fragment, {});
                    const wheelRef = wheelRefs.current[index];
                    return (_jsx(WheelJoint, { body: rigidBodyRef, wheel: wheelRef, bodyAnchor: wheelPosition, wheelAnchor: [0, 0, 0], rotationAxis: [1, 0, 0] }, index));
                })] }));
}
