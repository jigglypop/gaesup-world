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
export function usePlayActions() {
    var _a = useContext(GaesupWorldContext), characterGltf = _a.characterGltf, vehicleGltf = _a.vehicleGltf, airplaneGltf = _a.airplaneGltf, animations = _a.animations;
    var resultRef = {
        character: null,
        vehicle: null,
        airplane: null,
    };
    if (characterGltf && characterGltf.animations) {
        resultRef.character = useAnimations(characterGltf.animations);
    }
    if (vehicleGltf && vehicleGltf.animations) {
        resultRef.vehicle = useAnimations(vehicleGltf.animations);
    }
    if (airplaneGltf && airplaneGltf.animations) {
        resultRef.airplane = useAnimations(airplaneGltf.animations);
    }
    var dispatch = useContext(GaesupWorldDispatchContext);
    var play = function (tag) {
        animations.current = tag;
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    var setAnimationName = function (actions) {
        animations.animationNames = Object.assign(animations.animationNames, Object.keys(actions).reduce(function (acc, cur) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[cur] = cur, _a));
        }, {}));
        dispatch({
            type: "update",
            payload: {
                animations: __assign({}, animations),
            },
        });
    };
    return { resultRef: resultRef, play: play, setAnimationName: setAnimationName };
}
export default function playCharacterActions(_a) {
    var groundRay = _a.groundRay;
    var _b = usePlayActions(), _c = _b.resultRef.character, actions = _c.actions, ref = _c.ref, play = _b.play, setAnimationName = _b.setAnimationName;
    var _d = useContext(GaesupWorldContext), states = _d.states, activeState = _d.activeState, animations = _d.animations, mode = _d.mode;
    var isNotMoving = states.isNotMoving, isMoving = states.isMoving, isJumping = states.isJumping, isRunning = states.isRunning, isAnimationOuter = states.isAnimationOuter, isOnTheGround = states.isOnTheGround;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var control = useKeyboardControls()[1]();
    var resetAni = function () { return play("idle"); };
    var playIdle = function () { return play("idle"); };
    var playWalk = function () { return play("walk"); };
    var playRun = function () { return play("run"); };
    var playJump = function () { return play("jump"); };
    var playFall = function () { return play("fall"); };
    var playRide = function () { return play("ride"); };
    var playLanding = function () { return play("land"); };
    useEffect(function () {
        return function () {
            resetAni();
        };
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
        if (mode.type === "character") {
            var action_1 = (_a = actions[animations.current]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
            setAnimationName(actions);
            return function () {
                action_1 === null || action_1 === void 0 ? void 0 : action_1.fadeOut(0.2);
            };
        }
    }, [animations.current, mode.type]);
    useFrame(function () {
        if (mode.type === "character") {
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
                // if (groundRay.hit) {
                //   if (!isJumping && !isOnTheGround) {
                //     if (groundRay.hit.toi < 5) {
                //       playLanding();
                //     } else {
                //       playFall();
                //     }
                //   }
                // }
                // if (groundRay.hit === null && activeState.velocity.y < 0) {
                //   playFall();
                // }
            }
        }
    });
    return {
        ref: ref,
    };
}
