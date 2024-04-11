import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import { VehicleInnerRef } from "../../inner/vehicle";
export function PassiveVehicle(props) {
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var colliderRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        colliderRef: colliderRef,
    };
    var position = props.position, euler = props.euler, currentAnimation = props.currentAnimation, urls = props.urls;
    return (_jsx(VehicleInnerRef, { refs: refs, urls: urls, position: position, rotation: euler, userData: { intangible: true }, onCollisionEnter: props.onCollisionEnter, currentAnimation: currentAnimation, type: props.type, children: props.children }));
}
