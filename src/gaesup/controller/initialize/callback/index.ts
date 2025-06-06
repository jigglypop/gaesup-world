import { useCallback, useContext, useEffect, useMemo } from 'react';
import { AnimationAction } from 'three';
import { rigidBodyRefType } from '../../../component/inner/common/type';
import { componentTypeString } from '../../../component/passive/type';
import { useGaesupAnimation } from '../../../hooks/useGaesupAnimation';
import { useUnifiedFrame } from '../../../hooks/useUnifiedFrame';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../../world/context';
import { callbackPropType } from './type';
import { AnimationTagType } from '../../type';

export default function initCallback({
  props,
  actions,
  componentType,
}: {
  props: rigidBodyRefType;
  actions: {
    [x: string]: AnimationAction;
  };
  componentType: componentTypeString;
}) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { store } = useGaesupAnimation({ type: componentType });
  const { activeState, states, control } = useContext(GaesupWorldContext);
  const { subscribe } = useGaesupAnimation({ type: componentType });

  const playAnimation = useCallback(
    (tag: keyof AnimationTagType, key: string) => {
      if (!(key in control)) return;
      if (control[key] && animationState[componentType]) {
        const currentTag = animationState[componentType].current;
        if (currentTag !== tag) {
          animationState[componentType].current = tag;
          const currentAnimation = store[tag];
          if (currentAnimation?.action) {
            currentAnimation.action();
          }
          dispatch({
            type: 'update',
            payload: {
              animationState: {
                ...animationState,
                [componentType]: {
                  ...animationState[componentType],
                  current: tag,
                },
              },
            },
          });
        }
      }
    },
    [control, animationState, componentType, store, dispatch],
  );

  const controllerProp: callbackPropType = useMemo(
    () => ({
      activeState,
      control,
      states,
      subscribe,
    }),
    [activeState, control, states, subscribe],
  );

  useEffect(() => {
    if (props.onReady) {
      props.onReady(controllerProp);
    }
    return () => {
      if (props.onDestory) {
        props.onDestory(controllerProp);
      }
    };
  }, [props.onReady, props.onDestory, controllerProp]);
  const animateProps = useMemo(
    () => ({
      ...controllerProp,
      actions,
      animationState,
      playAnimation,
    }),
    [controllerProp, actions, animationState, playAnimation],
  );
  useUnifiedFrame(
    `callback-${componentType}`,
    (prop) => {
      if (props.onFrame) {
        props.onFrame({ ...controllerProp, ...prop });
      }
      if (props.onAnimate) {
        props.onAnimate({
          ...animateProps,
          ...prop,
        });
      }
    },
    2,
    !!(props.onFrame || props.onAnimate),
  );
  return {
    subscribe,
    playAnimation,
    dispatch,
  };
}
