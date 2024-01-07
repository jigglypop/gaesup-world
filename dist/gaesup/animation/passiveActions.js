import { useAnimations } from "@react-three/drei";
import { useEffect } from "react";
export default function playPassiveActions(_a) {
    var current = _a.current, animations = _a.animations;
    var _b = useAnimations(animations), actions = _b.actions, animationRef = _b.ref;
    useEffect(function () {
        var _a;
        var action = (_a = actions[current]) === null || _a === void 0 ? void 0 : _a.reset().fadeIn(0.2).play();
        return function () {
            action === null || action === void 0 ? void 0 : action.fadeOut(0.2);
        };
    }, [current]);
    return {
        animationRef: animationRef,
    };
}
