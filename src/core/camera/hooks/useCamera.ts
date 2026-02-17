import { useEffect, useMemo, useCallback, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

  // Keep refs for event handlers to avoid re-registering listeners on every option change.
  const cameraOptionRef = useRef(cameraOption);
  useEffect(() => {
    cameraOptionRef.current = cameraOption;
  }, [cameraOption]);
  const isInEditModeRef = useRef(isInEditMode);
  useEffect(() => {
    isInEditModeRef.current = isInEditMode;
  }, [isInEditMode]);

  const excludeObjectsRef = useRef<THREE.Object3D[]>([]);
  const calcPropsRef = useRef<CameraCalcProps | null>(null);
  
  const initialConfig: CameraSystemConfig = useMemo(() => ({
    mode: mode?.control || 'thirdPerson',
    distance: {
      x: cameraOption?.xDistance ?? 0,
      y: cameraOption?.yDistance ?? 0,
      z: cameraOption?.zDistance ?? 0,
    },
    smoothing: {
      position: cameraOption?.smoothing?.position ?? 0.1,
      rotation: cameraOption?.smoothing?.rotation ?? 0.1,
      fov: cameraOption?.smoothing?.fov ?? 0.1,
    },
    fov: cameraOption?.fov ?? 75,
    zoom: cameraOption?.zoom ?? 1,
    enableCollision: cameraOption?.enableCollision ?? true,
    ...(cameraOption?.maxDistance !== undefined ? { maxDistance: cameraOption.maxDistance } : {}),
    ...(cameraOption?.offset
      ? { offset: { x: cameraOption.offset.x, y: cameraOption.offset.y, z: cameraOption.offset.z } }
      : {}),
    ...(cameraOption?.target
      ? { lookAt: { x: cameraOption.target.x, y: cameraOption.target.y, z: cameraOption.target.z } }
      : {}),
  }), []);
  
  const { system, updateConfig } = useCameraBridge(
    CameraSystem,
    initialConfig
  );
  
  const handleWheel = useCallback((event: WheelEvent) => {
    const opt = cameraOptionRef.current;
    if (!opt?.enableZoom || isInEditModeRef.current) return;

    event.preventDefault();

    const zoomSpeed = opt.zoomSpeed || 0.001;
    const minZoom = opt.minZoom || 0.1;
    const maxZoom = opt.maxZoom || 2.0;
    const currentZoom = opt.zoom || 1;

    // 스크롤 방향 반대로 수정 (양수로 변경)
    const delta = event.deltaY * zoomSpeed;
    const newZoom = Math.min(Math.max(currentZoom + delta, minZoom), maxZoom);

    setCameraOption({ zoom: newZoom });
  }, [setCameraOption]);
  
  useEffect(() => {
    const canvas = gl.domElement;
    if (cameraOption?.enableZoom && !isInEditMode) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
    return undefined;
  }, [gl, handleWheel, cameraOption?.enableZoom, isInEditMode]);
  
  
  // ESC 키로 포커스 해제
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const opt = cameraOptionRef.current;
      if (event.key === 'Escape' && opt?.focus) {
        setCameraOption({ focus: false });
      }
    };
    
    if (cameraOption?.enableFocus && !isInEditMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [cameraOption?.enableFocus, isInEditMode, setCameraOption]);
  
  useEffect(() => {
    updateConfig({
      mode: mode?.control || 'thirdPerson',
      distance: {
        x: cameraOption?.xDistance ?? 0,
        y: cameraOption?.yDistance ?? 0,
        z: cameraOption?.zDistance ?? 0,
      },
      smoothing: {
        position: cameraOption?.smoothing?.position ?? 0.1,
        rotation: cameraOption?.smoothing?.rotation ?? 0.1,
        fov: cameraOption?.smoothing?.fov ?? 0.1,
      },
      fov: cameraOption?.fov ?? 75,
      zoom: cameraOption?.zoom ?? 1,
      enableCollision: cameraOption?.enableCollision ?? true,
      ...(cameraOption?.maxDistance !== undefined ? { maxDistance: cameraOption.maxDistance } : {}),
      ...(cameraOption?.offset
        ? { offset: { x: cameraOption.offset.x, y: cameraOption.offset.y, z: cameraOption.offset.z } }
        : {}),
      ...(cameraOption?.target
        ? { lookAt: { x: cameraOption.target.x, y: cameraOption.target.y, z: cameraOption.target.z } }
        : {}),
    });
  }, [cameraOption, mode, updateConfig]);
  
  useFrame((state, delta) => {
    if (!system || isInEditMode) return;
    
    // Reuse the calc props object to avoid per-frame allocations.
    if (!calcPropsRef.current) {
      calcPropsRef.current = {
        camera: state.camera,
        scene: state.scene,
        deltaTime: delta,
        activeState,
        clock: state.clock,
        excludeObjects: excludeObjectsRef.current,
      };
    } else {
      const calcProps = calcPropsRef.current;
      calcProps.camera = state.camera;
      calcProps.scene = state.scene;
      calcProps.deltaTime = delta;
      calcProps.activeState = activeState;
      calcProps.clock = state.clock;
    }
    system.calculate(calcPropsRef.current);
  });
  
  return {
    system,
  };
} 