import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { useGaesupAnimation } from "../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
export function subscribeActions({ type }) {
    const { states } = useContext(GaesupWorldContext);
    const { subscribeAll } = useGaesupAnimation({ type });
    // 초기 기본 애니메이션 등록
    useEffect(() => {
        subscribeAll([
            {
                tag: "walk",
                condition: () => !states.isRunning && states.isMoving,
                action: () => { },
                animationName: "walk",
                key: "walk",
            },
            {
                tag: "run",
                condition: () => states.isRunning,
                action: () => { },
                animationName: "run",
                key: "run",
            },
            {
                tag: "jump",
                condition: () => states.isJumping,
                action: () => { },
                animationName: "jump",
                key: "jump",
            },
            {
                tag: "ride",
                condition: () => states.isPush["keyR"],
                action: () => { },
                animationName: "ride",
                key: "ride",
            },
            {
                tag: "land",
                condition: () => states.isLanding,
                action: () => { },
                animationName: "land",
                key: "land",
            },
            {
                tag: "fall",
                condition: () => states.isFalling,
                action: () => { },
                animationName: "fall",
                key: "fall",
            },
        ]);
    }, []);
}
export default function playActions({ type, actions, animationRef, currentAnimation, isActive, }) {
    var _a, _b;
    const { mode, animationState, block } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const { notify, store } = useGaesupAnimation({ type });
    if (isActive) {
        currentAnimation = (_a = animationState === null || animationState === void 0 ? void 0 : animationState[type]) === null || _a === void 0 ? void 0 : _a.current;
    }
    const play = (tag) => {
        animationState[type].current = tag;
        const currentAnimation = store[tag];
        if (currentAnimation === null || currentAnimation === void 0 ? void 0 : currentAnimation.action) {
            currentAnimation.action();
        }
        dispatch({
            type: "update",
            payload: {
                animationState: Object.assign({}, animationState),
            },
        });
    };
    useEffect(() => {
        var _a;
        let animation = "idle";
        if (block.animation) {
            animation = "idle";
        }
        else if (currentAnimation) {
            animation = currentAnimation;
        }
        else if (animationState[type].current) {
            animation = animationState[type].current;
        }
        const action = (_a = actions[animation]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        return () => {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [currentAnimation, mode.type, block.animation, type]);
    useFrame(() => {
        if (isActive) {
            const tag = notify();
            play(tag);
        }
    });
    return {
        animationRef,
        currentAnimation: (_b = animationState === null || animationState === void 0 ? void 0 : animationState[type]) === null || _b === void 0 ? void 0 : _b.current,
    };
}
