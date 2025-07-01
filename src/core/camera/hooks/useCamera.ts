import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraEngine } from '../core/CameraEngine';
import { CameraCalcProps } from '../core/types';
import { useCameraBridge } from '../bridge/useCameraBridge';
import { CameraEngineConfig } from '../bridge/types';
import { useGaesupStore } from '../../stores/gaesupStore';

export function useCamera() {
  const block = useGaesupStore((state) => state.block);
  const activeState = useGaesupStore((state) => state.activeState);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const mode = useGaesupStore((state) => state.mode);
  
  const initialConfig: CameraEngineConfig = useMemo(() => ({
    mode: mode?.control || 'thirdPerson',
    enableMetrics: true,
    autoUpdate: true,
    ...cameraOption,
  }), []);
  
  const { engine, updateConfig } = useCameraBridge(
    CameraEngine,
    initialConfig
  );
  
  useEffect(() => {
    updateConfig({
      mode: mode?.control || 'thirdPerson',
      ...cameraOption,
    });
  }, [cameraOption, mode, updateConfig]);
  
  useFrame((state, delta) => {
    if (!engine || block.camera) return;
    
    const calcProps: CameraCalcProps = {
      camera: state.camera,
      scene: state.scene,
      deltaTime: delta,
      activeState,
      clock: state.clock,
      excludeObjects: [],
    };
    engine.calculate(calcProps);
  });
  
  return {
    engine,
  };
} 