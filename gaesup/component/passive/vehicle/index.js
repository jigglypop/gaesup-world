import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import { VehicleInnerRef } from "../../inner/vehicle";
export function PassiveVehicle(props) {
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
    return (_jsx(VehicleInnerRef, Object.assign({ isActive: false, componentType: "vehicle", name: "vehicle", controllerOptions: props.controllerOptions || {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        }, position: props.position, rotation: props.rotation, currentAnimation: props.currentAnimation, url: props.url, ridingUrl: props.ridingUrl }, props, refs, { children: props.children })));
}
