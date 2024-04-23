var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
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
    useEffect(function () {
        if (rigidBodyRef && rigidBodyRef.current) {
            rigidBodyRef.current.setEnabledRotations(false, false, false, false);
        }
    }, []);
    return (_jsx(CharacterInnerRef, __assign({ isActive: false, componentType: "character", controllerOptions: props.controllerOptions || {
            lerp: {
                cameraTurn: 1,
                cameraPosition: 1,
            },
        }, position: props.position, rotation: props.rotation, currentAnimation: props.currentAnimation }, refs, props, { children: props.children })));
}
