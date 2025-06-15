import { Suspense, useEffect } from 'react';
import { useGaesupGltf } from '@utils/gltf';
import { gaesupWorldPropsType } from '../types';
import { initGaesupWorld } from '@utils/initGaesupWorld';
import { useGaesupStore } from '@stores/gaesupStore';

export function GaesupWorld(props: gaesupWorldPropsType) {
  initGaesupWorld(props);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const { preloadSizes } = useGaesupGltf();

  useEffect(() => {
    const urls = Object.values(props.urls || {}).filter(Boolean) as string[];
    if (urls.length > 0) {
      preloadSizes(urls);
    }
  }, [props.urls, preloadSizes]);

  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption(props.cameraOption);
    }
  }, [props.cameraOption, setCameraOption]);

  return <Suspense fallback={null}>{props.children}</Suspense>;
}
