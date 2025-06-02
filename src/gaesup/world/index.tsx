'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { GaesupWorldContext, GaesupWorldDispatchContext } from './context';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';
import { cameraOptionAtom } from '../atoms';

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  const setCameraOption = useSetAtom(cameraOptionAtom);

  // cameraOption props가 있으면 atom에 설정
  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption(prevOption => ({
        ...prevOption,
        ...props.cameraOption,
      }));
    }
  }, [props.cameraOption, setCameraOption]);

  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {props.children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
