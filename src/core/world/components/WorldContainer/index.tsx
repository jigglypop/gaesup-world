import { Suspense, useEffect, ReactNode } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { WorldContainerProps } from './types';
import { ActiveObjects } from '../ActiveObjects';
import { PassiveObjects } from '../PassiveObjects';
import { RideableObjects } from '../Rideable';
import { PerformanceTracker } from '@debug/performance/PerformanceTracker';

function LoadingIndicator() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 1000
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 10px'
      }} />
      Loading World...
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function WorldContainer(props: WorldContainerProps) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const worldSlice = useGaesupStore((state) => state.world);
  const { debug } = useGaesupStore((state) => state.mode);

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
    <Suspense fallback={<LoadingIndicator />}>
      <group name="gaesup-world">
        {debug && <PerformanceTracker />}

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
