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
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export default function initCallback(_a) {
    var prop = _a.prop, callbacks = _a.callbacks, outerGroupRef = _a.outerGroupRef;
    var _b = useContext(GaesupWorldContext), characterGltf = _b.characterGltf, characterAnimations = _b.animations, activeState = _b.activeState, states = _b.states;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var animations = characterGltf.animations;
    var control = useKeyboardControls()[1]();
    var actions = useAnimations(animations, outerGroupRef).actions;
    var playAnimation = function (tag) {
        characterAnimations.current = tag;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, characterAnimations),
            },
        });
    };
    var controllerProp = __assign(__assign({}, prop), { activeState: activeState, control: control, states: states });
    useEffect(function () {
        if (callbacks && callbacks.onReady) {
            callbacks.onReady(controllerProp);
        }
        return function () {
            if (callbacks && callbacks.onDestory) {
                callbacks.onDestory(controllerProp);
            }
        };
    }, []);
    useFrame(function (prop) {
        if (callbacks && callbacks.onFrame) {
            callbacks.onFrame(__assign(__assign({}, controllerProp), prop));
        }
        if (callbacks && callbacks.onAnimate) {
            callbacks.onAnimate(__assign(__assign(__assign({}, controllerProp), prop), { actions: actions, animation: characterAnimations, playAnimation: playAnimation }));
        }
    });
}
