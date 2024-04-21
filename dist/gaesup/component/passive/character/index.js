import { jsx as _jsx } from "react/jsx-runtime";
import { useFrame } from "@react-three/fiber";
import { quat, } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { CharacterInnerRef } from "../../inner/character";
export function PassiveCharacter(props) {
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
    var _a = useMemo(function () {
        return {
            position: props.position,
            euler: props.euler,
            characterUrl: props.urls.characterUrl,
        };
    }, [props]), position = _a.position, euler = _a.euler;
    useEffect(function () {
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setEnabledRotations(false, false, false, false);
        }
    }, []);
    useFrame(function (_, delta) {
        if (innerGroupRef && innerGroupRef.current) {
            innerGroupRef.current.quaternion.rotateTowards(quat().setFromEuler(euler), 10 * delta);
        }
    });
    return (_jsx(CharacterInnerRef, { position: position, refs: refs, urls: props.urls, currentAnimation: props.currentAnimation, positionLerp: props.positionLerp, type: props.type, outerGroupRef: outerGroupRef, innerGroupRef: innerGroupRef, colliderRef: colliderRef, rigidBodyRef: rigidBodyRef, isActive: false, componentType: "character", children: props.children }));
}
