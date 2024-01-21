import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { quat } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { CharacterCapsuleCollider } from "./collider";
export function PassiveCharacter(props) {
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var colliderRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        capsuleColliderRef: colliderRef,
    };
    var _a = useMemo(function () {
        return {
            position: props.position,
            euler: props.euler,
            currentAnimation: props.currentAnimation,
            characterUrl: props.url.characterUrl,
        };
    }, [props]), position = _a.position, euler = _a.euler, currentAnimation = _a.currentAnimation, characterUrl = _a.characterUrl;
    useEffect(function () {
        if (rigidBodyRef || rigidBodyRef.current) {
            rigidBodyRef.current.setEnabledRotations(false, false, false, false);
        }
    }, []);
    useFrame(function (_, delta) {
        if (innerGroupRef && innerGroupRef.current) {
            innerGroupRef.current.quaternion.rotateTowards(quat().setFromEuler(euler), 10 * delta);
        }
    });
    return (_jsxs(OuterGroupRef, { ref: refs.outerGroupRef, children: [props.children, characterUrl && (_jsxs(RigidBodyRef, { ref: refs.rigidBodyRef, position: position, children: [_jsx(CharacterCapsuleCollider, { height: props.height, diameter: props.diameter, ref: colliderRef }), _jsx(InnerGroupRef, { currentAnimation: currentAnimation, ref: refs.innerGroupRef, url: characterUrl })] }))] }));
}
