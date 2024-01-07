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
import { useAnimations, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
// 캐릭터 등록, 애니메이션 이름 설정, 애니메이션 실행
export function readyAnimation() {
    var _a = useContext(GaesupWorldContext), characterGltf = _a.characterGltf, vehicleGltf = _a.vehicleGltf, airplaneGltf = _a.airplaneGltf;
    var resultRef = {
        character: null,
        vehicle: null,
        airplane: null,
    };
    if (characterGltf && characterGltf.animations)
        resultRef.character = useAnimations(characterGltf.animations);
    if (vehicleGltf && vehicleGltf.animations)
        resultRef.vehicle = useAnimations(vehicleGltf.animations);
    if (airplaneGltf && airplaneGltf.animations)
        resultRef.airplane = useAnimations(airplaneGltf.animations);
    return {
        resultRef: resultRef,
    };
}
export default function playCharacterActions(_a) {
    var groundRay = _a.groundRay;
    var _b = useContext(GaesupWorldContext), states = _b.states, activeState = _b.activeState, animations = _b.animations, mode = _b.mode, characterGltf = _b.characterGltf, vehicleGltf = _b.vehicleGltf, airplaneGltf = _b.airplaneGltf;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var control = useKeyboardControls()[1]();
    var _c = useGaesupAnimation(), subscribeAll = _c.subscribeAll, notify = _c.notify, store = _c.store;
    var resultRef = {
        character: null,
        vehicle: null,
        airplane: null,
    };
    if (characterGltf && characterGltf.animations)
        resultRef.character = useAnimations(characterGltf.animations);
    if (vehicleGltf && vehicleGltf.animations)
        resultRef.vehicle = useAnimations(vehicleGltf.animations);
    if (airplaneGltf && airplaneGltf.animations)
        resultRef.airplane = useAnimations(airplaneGltf.animations);
    var play = function (tag) {
        animations.current = tag;
        var currentAnimation = store[tag];
        if (currentAnimation === null || currentAnimation === void 0 ? void 0 : currentAnimation.action) {
            currentAnimation.action();
        }
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    var _d = resultRef.character, actions = _d.actions, ref = _d.ref;
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
    useEffect(function () {
        animations.keyControl = control;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    }, [control]);
    useEffect(function () {
        var _a;
        var action = (_a = actions[animations.current]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        return function () {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [animations.current, mode.type]);
    useFrame(function () {
        var tag = notify();
        play(tag);
    });
    return {
        ref: ref,
        resultRef: resultRef,
    };
}
