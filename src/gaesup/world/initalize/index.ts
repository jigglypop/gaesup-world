import { useMemo, useReducer } from 'react';

import { gaesupWorldDefault } from '../../world/context';
import { gaesupWorldReducer } from '../../world/context/reducer';
import { gaesupWorldPropsType } from '../type';

export default function initGaesupWorld(props: gaesupWorldPropsType) {
  const initialState = useMemo(() => ({
    activeState: {
      ...gaesupWorldDefault.activeState,
      position: props.startPosition || gaesupWorldDefault.activeState.position,
    },
    mode: { ...gaesupWorldDefault.mode, ...(props.mode || {}) },
    urls: { ...gaesupWorldDefault.urls, ...(props.urls || {}) },
    refs: null,
    states: gaesupWorldDefault.states,
    rideable: gaesupWorldDefault.rideable,
    control: gaesupWorldDefault.control,
    clicker: gaesupWorldDefault.clicker,
    clickerOption: { ...gaesupWorldDefault.clickerOption, ...(props.clickerOption || {}) },
    animationState: gaesupWorldDefault.animationState,
    block: { ...gaesupWorldDefault.block, ...(props.block || {}) },
    sizes: gaesupWorldDefault.sizes,
  }), [props.startPosition, props.mode, props.urls, props.clickerOption, props.block]);

  const [value, dispatch] = useReducer(gaesupWorldReducer, initialState);
  const gaesupProps = useMemo(() => ({ value, dispatch }), [value, dispatch]);
  return {
    gaesupProps,
  };
}
