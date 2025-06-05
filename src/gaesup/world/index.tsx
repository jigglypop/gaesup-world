'use client';

import { useSetAtom } from 'jotai';
import { useEffect, Suspense } from 'react';
import { cameraOptionAtom } from '../atoms';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import { GaesupWorldContext, GaesupWorldDispatchContext } from './context';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';

function LoadingSpinner() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}>
      <div>Loading 3D Models...</div>
    </div>
  );
}

export function GaesupWorld(props: gaesupWorldPropsType) {
  const { gaesupProps } = initGaesupWorld(props);
  const setCameraOption = useSetAtom(cameraOptionAtom);
  const { preloadSizes } = useGaesupGltf();
  
  useEffect(() => {
    const urls = Object.values(props.urls || {}).filter(Boolean) as string[];
    if (urls.length > 0) {
      preloadSizes(urls);
    }
  }, [props.urls, preloadSizes]);
  
  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption((prevOption) => ({
        ...prevOption,
        ...props.cameraOption,
      }));
    }
  }, [props.cameraOption, setCameraOption]);
  
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        <Suspense fallback={<LoadingSpinner />}>
          {props.children}
        </Suspense>
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
