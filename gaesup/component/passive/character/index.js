import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { CharacterInnerRef } from "../../inner/character";
export function PassiveCharacter(props) {
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
    useEffect(() => {
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setEnabledRotations(false, false, false, false);
        }
    }, []);
    return (_jsx(CharacterInnerRef, Object.assign({ isActive: false, componentType: "character", controllerOptions: props.controllerOptions || {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        }, position: props.position, rotation: props.rotation, groundRay: props.groundRay, currentAnimation: props.currentAnimation }, refs, props, { children: props.children })));
}
