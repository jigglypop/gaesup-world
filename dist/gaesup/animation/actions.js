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
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function subscribeActions(_a) {
    var type = _a.type, groundRay = _a.groundRay, animations = _a.animations;
    var _b = useContext(GaesupWorldContext), states = _b.states, activeState = _b.activeState;
    var subscribeAll = useGaesupAnimation({ type: type }).subscribeAll;
    var animationResult = useAnimations(animations);
    // 초기 기본 애니메이션 등록
    useEffect(function () {
        subscribeAll([
            {
                tag: "walk",
                condition: function () { return !states.isRunning && states.isMoving; },
                action: function () { },
                animationName: "walk",
                key: "walk",
            },
            {
                tag: "run",
                condition: function () { return states.isRunning; },
                action: function () { },
                animationName: "run",
                key: "run",
            },
            {
                tag: "jump",
                condition: function () { return states.isJumping; },
                action: function () { },
                animationName: "jump",
                key: "jump",
            },
            {
                tag: "fall",
                condition: function () { return groundRay.hit === null && activeState.velocity.y < 0; },
                action: function () { },
                animationName: "fall",
                key: "fall",
            },
            {
                tag: "ride",
                condition: function () { return states.isPush["keyR"]; },
                action: function () { },
                animationName: "ride",
                key: "ride",
            },
        ]);
    }, []);
    return {
        animationResult: animationResult,
    };
}
export default function playActions(_a) {
    var _b;
    var type = _a.type, animationResult = _a.animationResult, currentAnimation = _a.currentAnimation;
    var _c = useContext(GaesupWorldContext), mode = _c.mode, animationState = _c.animationState;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var _d = useGaesupAnimation({ type: type }), notify = _d.notify, store = _d.store;
    var actions = animationResult.actions, ref = animationResult.ref;
    var play = function (tag) {
        animationState[type].current = tag;
        var currentAnimation = store[tag];
        if (currentAnimation === null || currentAnimation === void 0 ? void 0 : currentAnimation.action) {
            currentAnimation.action();
        }
        dispatch({
            type: "update",
            payload: {
                animationState: __assign({}, animationState),
            },
        });
    };
    useEffect(function () {
        var _a;
        var action = (_a = actions[currentAnimation || animationState[type].current]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        return function () {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [currentAnimation, mode.type]);
    useFrame(function () {
        if (!currentAnimation) {
            var tag = notify();
            play(tag);
        }
    });
    return {
        animationRef: ref,
        currentAnimation: (_b = animationState === null || animationState === void 0 ? void 0 : animationState[type]) === null || _b === void 0 ? void 0 : _b.current,
    };
}
