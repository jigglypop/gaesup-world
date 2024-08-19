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
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function subscribeActions(_a) {
    var type = _a.type;
    var states = useContext(GaesupWorldContext).states;
    var subscribeAll = useGaesupAnimation({ type: type }).subscribeAll;
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
                tag: "ride",
                condition: function () { return states.isPush["keyR"]; },
                action: function () { },
                animationName: "ride",
                key: "ride",
            },
            {
                tag: "land",
                condition: function () { return states.isLanding; },
                action: function () { },
                animationName: "land",
                key: "land",
            },
            {
                tag: "fall",
                condition: function () { return states.isFalling; },
                action: function () { },
                animationName: "fall",
                key: "fall",
            },
        ]);
    }, []);
}
export default function playActions(_a) {
    var _b, _c;
    var type = _a.type, actions = _a.actions, animationRef = _a.animationRef, currentAnimation = _a.currentAnimation, isActive = _a.isActive;
    var _d = useContext(GaesupWorldContext), mode = _d.mode, animationState = _d.animationState, block = _d.block;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var _e = useGaesupAnimation({ type: type }), notify = _e.notify, store = _e.store;
    if (isActive) {
        currentAnimation = (_b = animationState === null || animationState === void 0 ? void 0 : animationState[type]) === null || _b === void 0 ? void 0 : _b.current;
    }
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
        var animation = "idle";
        if (block.animation) {
            animation = "idle";
        }
        else if (currentAnimation) {
            animation = currentAnimation;
        }
        else if (animationState[type].current) {
            animation = animationState[type].current;
        }
        var action = (_a = actions[animation]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        return function () {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [currentAnimation, mode.type, block.animation, type]);
    useFrame(function () {
        if (isActive) {
            var tag = notify();
            play(tag);
        }
    });
    return {
        animationRef: animationRef,
        currentAnimation: (_c = animationState === null || animationState === void 0 ? void 0 : animationState[type]) === null || _c === void 0 ? void 0 : _c.current,
    };
}
