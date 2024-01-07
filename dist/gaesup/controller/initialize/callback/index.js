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
import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../../world/context";
export default function initCallback(props) {
    var _a = useContext(GaesupWorldContext), characterGltf = _a.characterGltf, characterAnimations = _a.animations, activeState = _a.activeState, states = _a.states, control = _a.control;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var animations = characterGltf.animations;
    var actions = useAnimations(animations, props.outerGroupRef).actions;
    var subscribe = useGaesupAnimation().subscribe;
    var playAnimation = function (tag, key) {
        if (!(key in control))
            return;
        if (control[key]) {
            characterAnimations.current = tag;
            dispatch({
                type: "update",
                payload: {
                    animations: __assign({}, characterAnimations),
                },
            });
        }
    };
    var controllerProp = __assign(__assign({}, props), { activeState: activeState, control: control, states: states, subscribe: subscribe });
    useEffect(function () {
        if (props.onReady) {
            props.onReady(controllerProp);
        }
        return function () {
            if (props.onDestory) {
                props.onDestory(controllerProp);
            }
        };
    }, []);
    useFrame(function (prop) {
        if (props.onFrame) {
            props.onFrame(__assign(__assign({}, controllerProp), prop));
        }
        if (props.onAnimate) {
            props.onAnimate(__assign(__assign(__assign({}, controllerProp), prop), { actions: actions, animation: characterAnimations, playAnimation: playAnimation }));
        }
    });
}
