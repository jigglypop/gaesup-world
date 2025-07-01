import { Suspense, useEffect, ReactNode } from 'react';
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
