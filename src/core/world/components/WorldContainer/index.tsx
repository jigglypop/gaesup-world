import { Suspense, useEffect, ReactNode } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { WorldContainerProps } from './types';
import { ActiveObjects } from '../ActiveObjects';
import { PassiveObjects } from '../PassiveObjects';
import { RideableObjects } from '../Rideable';

export function WorldContainer(props: WorldContainerProps) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const worldSlice = useGaesupStore((state) => state.world);

  useEffect(() => {
    if (props.mode) {
      setMode(props.mode);
    }
  }, [props.mode, setMode]);

  useEffect(() => {
    if (props.urls) {
      const urlUpdates = Object.fromEntries(
        Object.entries(props.urls).filter(([, value]) => value !== undefined),
      );
      if (Object.keys(urlUpdates).length > 0) {
        setUrls(urlUpdates);
      }
    }
  }, [props.urls, setUrls]);

  useEffect(() => {
    if (props.cameraOption) {
      setCameraOption(props.cameraOption);
    }
  }, [props.cameraOption, setCameraOption]);

  const activeObjects = worldSlice?.objects?.filter(obj => obj.type === 'active') || [];
  const passiveObjects = worldSlice?.objects?.filter(obj => obj.type === 'passive') || [];
  const rideableObjects = worldSlice?.objects?.filter(obj => obj.type === 'rideable') || [];

  return (
    <Suspense fallback={<div>Loading World...</div>}>
      <group name="gaesup-world">
        {props.showGrid && (
          <gridHelper args={[100, 100, "#888888", "#444444"]} />
        )}
        
        {props.showAxes && (
          <axesHelper args={[10]} />
        )}

        <ActiveObjects
          objects={activeObjects as any}
          selectedId={worldSlice?.selectedObjectId}
          onSelect={worldSlice?.selectObject}
          showDebugInfo={worldSlice?.showDebugInfo}
        />

        <PassiveObjects
          objects={passiveObjects as any}
          selectedId={worldSlice?.selectedObjectId}
          onSelect={worldSlice?.selectObject}
          showDebugInfo={worldSlice?.showDebugInfo}
        />

        <RideableObjects
          objects={rideableObjects as any}
          showDebugInfo={worldSlice?.showDebugInfo}
        />

        {props.children}
      </group>
    </Suspense>
  );
}

export default WorldContainer;
