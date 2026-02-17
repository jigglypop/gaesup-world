import { Suspense, useEffect, ReactNode, useMemo } from 'react';

import { Camera } from '@/core/camera';
import { PerformanceCollector } from '@/core/editor/components/panels/PerformanceCollector';
import { useGaesupStore } from '@stores/gaesupStore';

import { WorldContainerProps } from './types';

function WorldContent({ children, showGrid, showAxes }: { 
  children?: ReactNode; 
  showGrid?: boolean; 
  showAxes?: boolean; 
}) {
  return (
    <group name="gaesup-world">
      {showGrid && (
        <gridHelper args={[100, 100, "#888888", "#444444"]} />
      )}
      {showAxes && (
        <axesHelper args={[10]} />
      )}
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

  const urlUpdates = useMemo(() => {
    if (!props.urls) return null;
    const entries = Object.entries(props.urls).filter(([, value]) => value !== undefined);
    if (entries.length === 0) return null;

    const raw = Object.fromEntries(entries) as Record<string, unknown>;
    const mapped: Record<string, unknown> = { ...raw };

    // Map legacy keys -> store keys
    if (typeof raw['character'] === 'string' && !raw['characterUrl']) mapped['characterUrl'] = raw['character'];
    if (typeof raw['vehicle'] === 'string' && !raw['vehicleUrl']) mapped['vehicleUrl'] = raw['vehicle'];
    if (typeof raw['airplane'] === 'string' && !raw['airplaneUrl']) mapped['airplaneUrl'] = raw['airplane'];

    // Do not keep legacy keys to avoid confusing consumers of `urls` state
    delete mapped['character'];
    delete mapped['vehicle'];
    delete mapped['airplane'];

    return mapped;
  }, [props.urls]);
  
  useEffect(() => {
    if (urlUpdates) {
      setUrls(urlUpdates);
    }
  }, [urlUpdates, setUrls]);

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
      <Camera/>
      <PerformanceCollector />
      <WorldContent showGrid={showGrid ?? false} showAxes={showAxes ?? false}>
        {children}
      </WorldContent>
    </Suspense>
  );
}

export default WorldContainer;
