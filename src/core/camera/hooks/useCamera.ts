import { useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraEngine } from '../core/CameraEngine';
import { CameraCalcProps } from '../core/types';
import { useCameraBridge } from '../bridge/useCameraBridge';
import { CameraEngineConfig } from '../bridge/types';
import { useGaesupStore } from '../../stores/gaesupStore';

export function useCamera() {
  const { gl } = useThree();
  const activeState = useGaesupStore((state) => state.activeState);
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
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
  
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!cameraOption?.enableZoom ) {
      return;
    }
    
    event.preventDefault();
    
    const zoomSpeed = cameraOption.zoomSpeed || 0.001;
    const minZoom = cameraOption.minZoom || 0.1;
    const maxZoom = cameraOption.maxZoom || 2.0;
    const currentZoom = cameraOption.zoom || 1;
    
    const delta = event.deltaY * -zoomSpeed;
    const newZoom = Math.min(Math.max(currentZoom + delta, minZoom), maxZoom);
    
    setCameraOption({ ...cameraOption, zoom: newZoom });
  }, [cameraOption, setCameraOption]);
  
  useEffect(() => {
    const canvas = gl.domElement;
    if (cameraOption?.enableZoom) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [gl, handleWheel, cameraOption?.enableZoom]);
  
  
  // ESC 키로 포커스 해제
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && cameraOption?.focus) {
        setCameraOption({ 
          ...cameraOption, 
          focus: false,
          focusTarget: undefined 
        });
      }
    };
    
    if (cameraOption?.enableFocus) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [cameraOption, setCameraOption]);
  
  useEffect(() => {
    updateConfig({
      mode: mode?.control || 'thirdPerson',
      ...cameraOption,
    });
  }, [cameraOption, mode, updateConfig]);
  
  useFrame((state, delta) => {
    if (!engine ) return;
    
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