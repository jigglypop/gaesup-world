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
import { useContext } from "react";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../../world/context";
export default function initCallback(_a) {
    var 
    // props,
    animationResult = _a.animationResult, type = _a.type;
    var actions = animationResult.actions;
    var animationState = useContext(GaesupWorldContext).animationState;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var store = useGaesupAnimation({ type: type }).store;
    var _b = useContext(GaesupWorldContext), activeState = _b.activeState, states = _b.states, control = _b.control;
    var subscribe = useGaesupAnimation({ type: type }).subscribe;
    var playAnimation = function (tag, key) {
        if (!(key in control))
            return;
        if (control[key]) {
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
        }
    };
    //   const controllerProp: callbackPropType = {
    //     ...props,
    //     activeState,
    //     control,
    //     states,
    //     subscribe,
    //   };
    //
    //   useEffect(() => {
    //     if (props.onReady) {
    //       props.onReady(controllerProp);
    //     }
    //     return () => {
    //       if (props.onDestory) {
    //         props.onDestory(controllerProp);
    //       }
    //     };
    //   }, []);
    //
    //   useFrame((prop) => {
    //     if (props.onFrame) {
    //       props.onFrame({ ...controllerProp, ...prop });
    //     }
    //     if (props.onAnimate) {
    //       props.onAnimate({
    //         ...controllerProp,
    //         ...prop,
    //         actions,
    //         animationState,
    //         playAnimation,
    //       });
    //     }
    //   });
    return {
        subscribe: subscribe,
        playAnimation: playAnimation,
        dispatch: dispatch,
    };
}
