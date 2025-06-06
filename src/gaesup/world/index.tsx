'use client';
import { useSetAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { cameraOptionAtom } from '../atoms';
import { GaesupProvider } from '../context';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import initGaesupWorld from './initalize';
import { gaesupWorldPropsType } from './type';

function LoadingSpinner() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
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
    <GaesupProvider initialState={gaesupProps.value}>
      <Suspense fallback={<LoadingSpinner />}>{props.children}</Suspense>
    </GaesupProvider>
  );
}
