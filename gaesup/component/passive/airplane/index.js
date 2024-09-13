import { jsx as _jsx } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { quat } from "@react-three/rapier";
import { useRef } from "react";
import { AirplaneInnerRef } from "../../inner/airplane";
export function PassiveAirplane(props) {
    const rigidBodyRef = useRef(null);
    const outerGroupRef = useRef(null);
    const innerGroupRef = useRef(null);
    const colliderRef = useRef(null);
    const refs = {
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef,
    };
    useFrame(() => {
        if (innerGroupRef && innerGroupRef.current) {
            const _euler = props.rotation.clone();
            _euler.y = 0;
            innerGroupRef.current.setRotationFromQuaternion(quat()
                .setFromEuler(innerGroupRef.current.rotation.clone())
                .slerp(quat().setFromEuler(_euler), 0.2));
        }
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setGravityScale(props.position.y < 10
                ? ((1 - 0.1) / (0 - 10)) * props.position.y + 1
                : 0.1, false);
        }
    });
    return (_jsx(AirplaneInnerRef, Object.assign({ isActive: false, componentType: "airplane", name: "airplane", controllerOptions: props.controllerOptions || {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        }, position: props.position, rotation: props.rotation, currentAnimation: props.currentAnimation, ridingUrl: props.ridingUrl }, props, refs, { children: props.children })));
}
