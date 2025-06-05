import { useCallback, useContext, useEffect, useMemo } from 'react';
import { AnimationAction } from 'three';
import { rigidBodyRefType } from '../../../component/inner/common/type';
import { componentTypeString } from '../../../component/passive/type';
import { useGaesupAnimation } from '../../../hooks/useGaesupAnimation';
import { useUnifiedFrame } from '../../../hooks/useUnifiedFrame';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../../world/context';
import { animationTagType } from '../../type';
import { callbackPropType } from './type';

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
    (tag: keyof animationTagType, key: string) => {
      if (!(key in control)) return;
      if (control[key] && animationState[componentType]) {
        const currentTag = animationState[componentType].current;
        if (currentTag !== tag) {
          // 변경된 경우에만 업데이트
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

  // 애니메이션 프로퍼티를 미리 계산
  const animateProps = useMemo(
    () => ({
      ...controllerProp,
      actions,
      animationState,
      playAnimation,
    }),
    [controllerProp, actions, animationState, playAnimation],
  );

  // 통합 프레임 시스템 사용 (우선순위: 2 - 애니메이션 콜백)
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
    2, // 카메라 다음 우선순위
    !!(props.onFrame || props.onAnimate),
  );

  return {
    subscribe,
    playAnimation,
    dispatch,
  };
}
