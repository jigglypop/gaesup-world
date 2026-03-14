import { useEffect, useMemo, useCallback, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingStore } from '../../building/stores/buildingStore';
import { InteractionSystem } from '../../interactions/core/InteractionSystem';
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
  const interactionSystemRef = useRef(InteractionSystem.getInstance());

  // Keep refs for event handlers to avoid re-registering listeners on every option change.
  const cameraOptionRef = useRef(cameraOption);
  useEffect(() => {
    cameraOptionRef.current = cameraOption;
  }, [cameraOption]);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const isInEditModeRef = useRef(isInEditMode);
  useEffect(() => {
    isInEditModeRef.current = isInEditMode;
  }, [isInEditMode]);

  const excludeObjectsRef = useRef<THREE.Object3D[]>([]);
  const calcPropsRef = useRef<CameraCalcProps | null>(null);
  const orbitYawRef = useRef(0);
  const orbitPitchRef = useRef(0);
  const lookAroundActiveRef = useRef(false);
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  
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
    orbitYaw: 0,
    orbitPitch: 0,
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

  const syncCameraConfig = useCallback(() => {
    const opt = cameraOptionRef.current;
    const currentMode = modeRef.current;

    updateConfig({
      mode: currentMode?.control || 'thirdPerson',
      distance: {
        x: opt?.xDistance ?? 0,
        y: opt?.yDistance ?? 0,
        z: opt?.zDistance ?? 0,
      },
      smoothing: {
        position: opt?.smoothing?.position ?? 0.1,
        rotation: opt?.smoothing?.rotation ?? 0.1,
        fov: opt?.smoothing?.fov ?? 0.1,
      },
      fov: opt?.fov ?? 75,
      zoom: opt?.zoom ?? 1,
      enableCollision: opt?.enableCollision ?? true,
      orbitYaw: orbitYawRef.current,
      orbitPitch: orbitPitchRef.current,
      ...(opt?.maxDistance !== undefined ? { maxDistance: opt.maxDistance } : {}),
      ...(opt?.offset
        ? { offset: { x: opt.offset.x, y: opt.offset.y, z: opt.offset.z } }
        : {}),
      ...(opt?.target
        ? { lookAt: { x: opt.target.x, y: opt.target.y, z: opt.target.z } }
        : {}),
      ...(opt?.focus !== undefined ? { focus: opt.focus } : {}),
      ...(opt?.focusTarget
        ? { focusTarget: { x: opt.focusTarget.x, y: opt.focusTarget.y, z: opt.focusTarget.z } }
        : { focusTarget: undefined }),
      ...(opt?.focusDistance !== undefined ? { focusDistance: opt.focusDistance } : {}),
      ...(opt?.focusLerpSpeed !== undefined ? { focusLerpSpeed: opt.focusLerpSpeed } : {}),
    });
  }, [updateConfig]);

  const setLookAroundActive = useCallback((active: boolean) => {
    if (lookAroundActiveRef.current === active) return;
    lookAroundActiveRef.current = active;
    lastPointerPositionRef.current = null;
    interactionSystemRef.current.updateMouse({ isLookAround: active });
  }, []);
  
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
    const currentMode = mode?.control;
    const supportsLookAround = currentMode === 'thirdPerson' || currentMode === 'chase';
    if (!supportsLookAround || isInEditMode) {
      setLookAroundActive(false);
    }
  }, [isInEditMode, mode?.control, setLookAroundActive]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'ShiftLeft' && event.code !== 'ShiftRight') return;
      if (isInEditModeRef.current || cameraOptionRef.current?.focus) return;
      const currentMode = modeRef.current?.control;
      if (currentMode !== 'thirdPerson' && currentMode !== 'chase') return;
      setLookAroundActive(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        setLookAroundActive(false);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!lookAroundActiveRef.current || isInEditModeRef.current) return;

      const lastPointer = lastPointerPositionRef.current;
      const deltaX = event.movementX || (lastPointer ? event.clientX - lastPointer.x : 0);
      const deltaY = event.movementY || (lastPointer ? event.clientY - lastPointer.y : 0);
      lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };

      if (deltaX === 0 && deltaY === 0) return;

      orbitYawRef.current -= deltaX * 0.008;
      orbitPitchRef.current = THREE.MathUtils.clamp(
        orbitPitchRef.current - deltaY * 0.006,
        -Math.PI * 0.2,
        Math.PI * 0.35,
      );
      syncCameraConfig();
    };

    const handleWindowBlur = () => {
      setLookAroundActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      canvas.removeEventListener('mousemove', handleMouseMove);
      setLookAroundActive(false);
    };
  }, [gl, setLookAroundActive, syncCameraConfig]);
  
  useEffect(() => {
    syncCameraConfig();
  }, [cameraOption, mode, syncCameraConfig]);
  
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