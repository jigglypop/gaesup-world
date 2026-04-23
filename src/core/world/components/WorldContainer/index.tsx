import { Suspense, useEffect, ReactNode, useMemo } from 'react';

import { Camera } from '@/core/camera';
import { PerformanceCollector } from '@/core/editor/components/panels/PerformanceCollector';
import type { UrlsState } from '@/core/stores/slices/urls/types';
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

/**
 * Applies world-related configuration into the shared stores and renders children unchanged.
 * Prefer this name for new code; `WorldContainer` remains as a backward-compatible alias.
 */
export function WorldConfigProvider(props: WorldContainerProps) {
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
    const mapped: Partial<UrlsState> = {};

    if (props.urls.characterUrl !== undefined) mapped.characterUrl = props.urls.characterUrl;
    if (props.urls.vehicleUrl !== undefined) mapped.vehicleUrl = props.urls.vehicleUrl;
    if (props.urls.airplaneUrl !== undefined) mapped.airplaneUrl = props.urls.airplaneUrl;

    if (mapped.characterUrl === undefined && props.urls.character !== undefined) {
      mapped.characterUrl = props.urls.character;
    }
    if (mapped.vehicleUrl === undefined && props.urls.vehicle !== undefined) {
      mapped.vehicleUrl = props.urls.vehicle;
    }
    if (mapped.airplaneUrl === undefined && props.urls.airplane !== undefined) {
      mapped.airplaneUrl = props.urls.airplane;
    }

    return Object.keys(mapped).length > 0 ? mapped : null;
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

/**
 * @deprecated Use `WorldConfigProvider` for clearer semantics.
 */
export const WorldContainer = WorldConfigProvider;

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
