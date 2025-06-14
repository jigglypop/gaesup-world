'use client';
import { useSetAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { cameraOptionAtom } from '../../atoms/cameraOptionAtom';
import { GaesupProvider } from '../../atoms';
import { useGaesupGltf } from '../../utils/gltf';
import { gaesupWorldPropsType } from '../types';
import { initGaesupWorld } from '../../utils/initGaesupWorld';

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
      <Suspense fallback={null}>{props.children}</Suspense>
    </GaesupProvider>
  );
}
