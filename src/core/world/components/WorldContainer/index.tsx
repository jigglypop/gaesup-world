import { Suspense, useEffect, ReactNode } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { WorldContainerProps } from './types';
import { ActiveObjects } from '../ActiveObjects';
import { PassiveObjects } from '../PassiveObjects';
import { RideableObjects } from '../Rideable';
import { PerformanceTracker } from '@debug/performance/PerformanceTracker';

function WorldContent({ children, showGrid, showAxes }: { 
  children?: ReactNode; 
  showGrid?: boolean; 
  showAxes?: boolean; 
}) {
  const worldSlice = useGaesupStore((state) => state.world);
  const { debug } = useGaesupStore((state) => state.mode);

  const activeObjects = worldSlice?.objects?.filter(obj => obj.type === 'active') || [];
  const passiveObjects = worldSlice?.objects?.filter(obj => obj.type === 'passive') || [];
  const rideableObjects = worldSlice?.objects?.filter(obj => obj.type === 'rideable') || [];

  return (
    <group name="gaesup-world">
      {debug && <PerformanceTracker />}

      {showGrid && (
        <gridHelper args={[100, 100, "#888888", "#444444"]} />
      )}
      
      {showAxes && (
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

      {children}
    </group>
  );
}

export function WorldContainer(props: WorldContainerProps) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);

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

  return props.children;
}

export function GaesupWorldContent({ children, showGrid, showAxes }: { 
  children?: ReactNode; 
  showGrid?: boolean; 
  showAxes?: boolean; 
}) {
  return (
    <Suspense fallback={null}>
      <WorldContent showGrid={showGrid} showAxes={showAxes}>
        {children}
      </WorldContent>
    </Suspense>
  );
}

export default WorldContainer;
