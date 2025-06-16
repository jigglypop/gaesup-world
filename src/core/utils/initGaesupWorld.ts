import { useMemo } from 'react';
import { useGaesupStore, gaesupWorldDefault } from '../stores/gaesupStore';
import { gaesupWorldPropsType } from '../component/types';
import { initialClickerOptionState } from '../stores/slices/clickerOption';

export function initGaesupWorld(props: gaesupWorldPropsType) {
  const initializeState = useGaesupStore((state) => state.initializeState);
  const resetState = useGaesupStore((state) => state.resetState);

  const initialState = useMemo(
    () => ({
      activeState: {
        ...gaesupWorldDefault.activeState,
        position: props.startPosition || gaesupWorldDefault.activeState.position,
      },
      mode: { ...gaesupWorldDefault.mode, ...(props.mode || {}) },
      urls: { ...gaesupWorldDefault.urls, ...(props.urls || {}) },
      refs: null,
      states: gaesupWorldDefault.states,
      rideable: gaesupWorldDefault.rideable || {},
      control: gaesupWorldDefault.control,
      clicker: gaesupWorldDefault.clicker,
      clickerOption: {
        ...initialClickerOptionState,
        ...(props.clickerOption || {}),
      },
      animationState: gaesupWorldDefault.animationState,
      block: { ...gaesupWorldDefault.block, ...(props.block || {}) },
      sizes: gaesupWorldDefault.sizes,
    }),
    [props.startPosition, props.mode, props.urls, props.clickerOption, props.block],
  );

  useMemo(() => {
    resetState();
    initializeState(initialState);
  }, [initialState, initializeState, resetState]);
}
