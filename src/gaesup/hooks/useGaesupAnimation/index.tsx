import { useCallback, useMemo, useContext } from 'react';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../../world/context';
import { animationAtomType } from '../../world/context/type';

export function useGaesupAnimation({ type }: { type: 'character' | 'vehicle' | 'airplane' }) {
  const { animationState } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  // 현재 타입에 맞는 애니메이션 상태 메모이제이션
  const currentTypeAnimState = useMemo(() => {
    return animationState[type] || { current: 'idle', default: 'idle', store: {} };
  }, [animationState, type]);
  // 상태 업데이트 함수 메모이제이션 - 불필요한 함수 생성 방지
  const updateAnimationState = useCallback(() => {
    dispatch({
      type: 'update',
      payload: {
        animationState: { ...animationState },
      },
    });
  }, [dispatch, animationState]);
  // 애니메이션 태그 유효성 확인 함수
  const getAnimationTag = useCallback(
    (tag: string): { name: string; isValid: boolean } => {
      const animation = currentTypeAnimState.store[tag];
      if (!animation) {
        return { name: currentTypeAnimState.default, isValid: false };
      }
      return {
        name: animation.condition() ? animation.animationName || tag : currentTypeAnimState.default,
        isValid: animation.condition(),
      };
    },
    [currentTypeAnimState],
  );
  // 현재 조건에 맞는 애니메이션 알림 함수
  const notify = useCallback(() => {
    // 현재 타입의 기본 애니메이션을 초기값으로 설정
    let tag = currentTypeAnimState.default;
    // 모든 등록된 애니메이션을 조건 확인
    for (const key of Object.keys(currentTypeAnimState.store)) {
      const checked = getAnimationTag(key);
      if (checked.isValid) {
        tag = checked.name;
        break;
      }
    }
    // 현재 애니메이션 업데이트 (이전과 다른 경우에만)
    if (currentTypeAnimState.current !== tag) {
      animationState[type].current = tag;
      updateAnimationState();
    }
    return tag;
  }, [animationState, currentTypeAnimState, getAnimationTag, type, updateAnimationState]);

  // 애니메이션 구독 해제 함수
  const unsubscribe = useCallback(
    (tag: string) => {
      if (currentTypeAnimState.store[tag]) {
        delete animationState[type].store[tag];
        updateAnimationState();
      }
    },
    [animationState, currentTypeAnimState.store, type, updateAnimationState],
  );

  // 애니메이션 구독 함수
  const subscribe = useCallback(
    (props: animationAtomType) => {
      const { tag, condition, action, animationName, key } = props;

      animationState[type].store[tag] = {
        condition,
        action: action || (() => {}),
        animationName: animationName || tag,
        key: key || tag,
      };

      updateAnimationState();
    },
    [animationState, type, updateAnimationState],
  );

  // 다중 애니메이션 구독 함수
  const subscribeAll = useCallback(
    (props: animationAtomType[]) => {
      const subscribedTags: string[] = [];

      // 모든 애니메이션 등록
      props.forEach((item) => {
        animationState[type].store[item.tag] = {
          condition: item.condition,
          action: item.action || (() => {}),
          animationName: item.animationName || item.tag,
          key: item.key || item.tag,
        };
        subscribedTags.push(item.tag);
      });

      updateAnimationState();

      // 구독 해제 함수 반환 (클린업용)
      return () => {
        subscribedTags.forEach((tag) => {
          if (animationState[type]?.store[tag]) {
            delete animationState[type].store[tag];
          }
        });
        updateAnimationState();
      };
    },
    [animationState, type, updateAnimationState],
  );

  // 메모이제이션된 스토어 참조
  const animationStore = useMemo(
    () => currentTypeAnimState.store || {},
    [currentTypeAnimState.store],
  );

  // 최적화된 API 반환
  return {
    subscribe,
    subscribeAll,
    store: animationStore,
    unsubscribe,
    notify,
  };
}
