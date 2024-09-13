import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../../world/context";
export default function initCallback({ props, actions, componentType, }) {
    const { animationState } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const { store } = useGaesupAnimation({ type: componentType });
    const { activeState, states, control } = useContext(GaesupWorldContext);
    const { subscribe } = useGaesupAnimation({ type: componentType });
    const playAnimation = (tag, key) => {
        if (!(key in control))
            return;
        if (control[key] && animationState[componentType]) {
            animationState[componentType].current = tag;
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
        }
    };
    const controllerProp = {
        activeState,
        control,
        states,
        subscribe,
    };
    useEffect(() => {
        if (props.onReady) {
            props.onReady(controllerProp);
        }
        return () => {
            if (props.onDestory) {
                props.onDestory(controllerProp);
            }
        };
    }, []);
    useFrame((prop) => {
        if (props.onFrame) {
            props.onFrame(Object.assign(Object.assign({}, controllerProp), prop));
        }
        if (props.onAnimate) {
            props.onAnimate(Object.assign(Object.assign(Object.assign({}, controllerProp), prop), { actions,
                animationState,
                playAnimation }));
        }
    });
    return {
        subscribe,
        playAnimation,
        dispatch,
    };
}
