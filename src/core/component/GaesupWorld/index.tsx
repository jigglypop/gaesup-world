import { Suspense, useEffect } from 'react';
import { gaesupWorldPropsType } from './types';
import { useGaesupStore } from '@stores/gaesupStore';

export function GaesupWorld(props: gaesupWorldPropsType) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setUrls = useGaesupStore((state) => state.setUrls);

  useEffect(() => {
    if (props.mode) {
      setMode(props.mode);
    }
  }, [props.mode, setMode]);

  useEffect(() => {
    if (props.urls) {
      const updates: Record<string, string> = {};
      if (props.urls.characterUrl) updates.characterUrl = props.urls.characterUrl;
      if (props.urls.vehicleUrl) updates.vehicleUrl = props.urls.vehicleUrl;
      if (props.urls.airplaneUrl) updates.airplaneUrl = props.urls.airplaneUrl;
      if (props.urls.wheelUrl) updates.wheelUrl = props.urls.wheelUrl;
      if (props.urls.ridingUrl) updates.ridingUrl = props.urls.ridingUrl;
      if (Object.keys(updates).length > 0) {
        setUrls(updates);
      }
    }
  }, [props.urls, setUrls]);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);

  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption(props.cameraOption);
    }
  }, [props.cameraOption, setCameraOption]);

  return <Suspense fallback={null}>{props.children}</Suspense>;
}
