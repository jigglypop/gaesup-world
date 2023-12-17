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
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export default function playActions(_a) {
    var outerGroupRef = _a.outerGroupRef, groundRay = _a.groundRay, isRider = _a.isRider;
    var _b = useContext(GaesupWorldContext), characterGltf = _b.characterGltf, characterAnimations = _b.animations;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var animations = characterGltf.animations;
    var control = useKeyboardControls()[1]();
    var actions = useAnimations(animations, outerGroupRef).actions;
    useEffect(function () {
        characterAnimations.keyControl = control;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, characterAnimations),
            },
        });
    }, [control]);
    var play = function (tag) {
        characterAnimations.current = tag;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, characterAnimations),
            },
        });
    };
    var setAnimationName = function (actions) {
        characterAnimations.animationNames = Object.assign(characterAnimations.animationNames, Object.keys(actions).reduce(function (acc, cur) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[cur] = cur, _a));
        }, {}));
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, characterAnimations),
            },
        });
    };
    var resetAni = function () { return play("idle"); };
    var playIdle = function () { return play("idle"); };
    var playWalk = function () { return play("walk"); };
    var playRun = function () { return play("run"); };
    var playJump = function () { return play("jump"); };
    var playFall = function () { return play("fall"); };
    var playRide = function () { return play("ride"); };
    useEffect(function () {
        return function () {
            resetAni();
        };
    }, []);
    useEffect(function () {
        var _a;
        // Play animation
        var action = (_a = actions[characterAnimations.current]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        setAnimationName(actions);
        return function () {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [characterAnimations.current]);
    var _c = useContext(GaesupWorldContext), states = _c.states, activeState = _c.activeState;
    var isNotMoving = states.isNotMoving, isMoving = states.isMoving, isJumping = states.isJumping, isRunning = states.isRunning, isAnimationOuter = states.isAnimationOuter;
    useFrame(function () {
        if (isRider) {
            playRide();
        }
        else {
            if (!isAnimationOuter) {
                if (isJumping) {
                    playJump();
                }
                else if (isNotMoving) {
                    playIdle();
                }
                else if (isRunning) {
                    playRun();
                }
                else if (isMoving) {
                    playWalk();
                }
                if (groundRay.hit === null && activeState.velocity.y < 0) {
                    playFall();
                }
            }
        }
    });
}
