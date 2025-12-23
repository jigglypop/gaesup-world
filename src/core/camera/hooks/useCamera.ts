import { useEffect, useMemo, useCallback } from 'react';

import { useFrame, useThree } from '@react-three/fiber';

import { useBuildingStore } from '../../building/stores/buildingStore';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../stores/gaesupStore';
import { CameraSystemConfig } from '../bridge/types';
import { useCameraBridge } from '../bridge/useCameraBridge';
import { CameraSystem } from '../core/CameraSystem';
import { CameraCalcProps } from '../core/types';

export function useCamera() {
  const { gl } = useThree();
  const { activeState } = useStateSystem();
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const mode = useGaesupStore((state) => state.mode);
  const isInEditMode = useBuildingStore((state) => state.isInEditMode());
  
  const initialConfig: CameraSystemConfig = useMemo(() => ({
    mode: mode?.control || 'thirdPerson',
    enableMetrics: true,
    autoUpdate: true,
    ...cameraOption,
  }), []);
  
  const { system, updateConfig } = useCameraBridge(
    CameraSystem,
    initialConfig
  );
  
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!cameraOption?.enableZoom || isInEditMode) {
      return;
    }
    
    event.preventDefault();
    
    const zoomSpeed = cameraOption.zoomSpeed || 0.001;
    const minZoom = cameraOption.minZoom || 0.1;
    const maxZoom = cameraOption.maxZoom || 2.0;
    const currentZoom = cameraOption.zoom || 1;
    
    // 스크롤 방향 반대로 수정 (양수로 변경)
    const delta = event.deltaY * zoomSpeed;
    const newZoom = Math.min(Math.max(currentZoom + delta, minZoom), maxZoom);
    
    setCameraOption({ ...cameraOption, zoom: newZoom });
  }, [cameraOption, setCameraOption, isInEditMode]);
  
  useEffect(() => {
    const canvas = gl.domElement;
    if (cameraOption?.enableZoom && !isInEditMode) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [gl, handleWheel, cameraOption?.enableZoom, isInEditMode]);
  
  
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
    
    if (cameraOption?.enableFocus && !isInEditMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [cameraOption, setCameraOption, isInEditMode]);
  
  useEffect(() => {
    updateConfig({
      mode: mode?.control || 'thirdPerson',
      ...cameraOption,
    });
  }, [cameraOption, mode, updateConfig]);
  
  useFrame((state, delta) => {
    if (!system || isInEditMode) return;
    
    const calcProps: CameraCalcProps = {
      camera: state.camera,
      scene: state.scene,
      deltaTime: delta,
      activeState,
      clock: state.clock,
      excludeObjects: [],
    };
    system.calculate(calcProps);
  });
  
  return {
    system,
  };
} 