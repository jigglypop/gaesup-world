import { useContext } from "react";
import * as THREE from "three";
import { Api } from "../../../animation/actions";
import { useGaesupAnimation } from "../../../hooks/useGaesupAnimation";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../../world/context";
import { animationTagType } from "../../type";

export default function initCallback({
  // props,
  animationResult,
  type,
}: {
  // props: controllerInnerType;
  animationResult: Api<THREE.AnimationClip>;
  type: "character" | "vehicle" | "airplane";
}) {
  const { actions } = animationResult;
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { store } = useGaesupAnimation({ type });
  const { activeState, states, control } = useContext(GaesupWorldContext);
  const { subscribe } = useGaesupAnimation({ type });

  const playAnimation = (tag: keyof animationTagType, key: string) => {
    if (!(key in control)) return;
    if (control[key]) {
      animationState[type].current = tag;
      const currentAnimation = store[tag];
      if (currentAnimation?.action) {
        currentAnimation.action();
      }
      dispatch({
        type: "update",
        payload: {
          animationState: {
            ...animationState,
          },
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
    subscribe,
    playAnimation,
    dispatch,
  };
}
