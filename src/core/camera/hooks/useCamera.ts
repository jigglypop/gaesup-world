import { useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useBuildingStore } from '../../building/stores/buildingStore';
import { useInputBackend } from '../../interactions/hooks';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../stores/gaesupStore';
import { CameraSystemConfig } from '../bridge/types';
import { useCameraBridge } from '../bridge/useCameraBridge';
import { CameraSystem } from '../core/CameraSystem';
import { CameraCalcProps } from '../core/types';

const ORBIT_SPEED = 0.0015;
const ORBIT_SMOOTHING = 10;
const ORBIT_EPSILON = 0.0001;
const ORBIT_DRAG_THRESHOLD = 4;
const MIN_ORBIT_PITCH = -0.65;
const MAX_ORBIT_PITCH = 0.85;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
};

export function useCamera(enableMouse = true) {
  const { gl } = useThree();
  const { activeState } = useStateSystem();
  const cameraOption = useGaesupStore((state) => state.cameraOption);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const mode = useGaesupStore((state) => state.mode);
  const isInEditMode = useBuildingStore((state) => state.isInEditMode());
  const inputBackend = useInputBackend();

  // Keep refs for event handlers to avoid re-registering listeners on every option change.
  const cameraOptionRef = useRef(cameraOption);
  useLayoutEffect(() => {
    cameraOptionRef.current = cameraOption;
  }, [cameraOption]);
  const modeRef = useRef(mode);
  useLayoutEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const excludeObjectsRef = useRef<THREE.Object3D[]>([]);
  const calcPropsRef = useRef<CameraCalcProps | null>(null);
  const orbitModifierKeysRef = useRef<Set<string>>(new Set());
  const orbitPointerActiveRef = useRef(false);
  const orbitYawRef = useRef(0);
  const orbitPitchRef = useRef(0);
  const targetOrbitYawRef = useRef(0);
  const targetOrbitPitchRef = useRef(0);
  
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
    ...(cameraOption?.collisionMargin !== undefined ? { collisionMargin: cameraOption.collisionMargin } : {}),
    orbitYaw: orbitYawRef.current,
    orbitPitch: orbitPitchRef.current,
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
      ...(opt?.collisionMargin !== undefined ? { collisionMargin: opt.collisionMargin } : {}),
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
  
  const handleWheel = useCallback((event: WheelEvent) => {
    const opt = cameraOptionRef.current;
    if (!opt?.enableZoom) return;

    event.preventDefault();

    const zoomSpeed = opt.zoomSpeed ?? 0.001;
    const minZoom = opt.minZoom ?? 0.45;
    const maxZoom = opt.maxZoom ?? 2.4;
    const currentZoom = opt.zoom ?? 1;

    // Zoom is a distance multiplier: scrolling down moves away from the subject.
    const delta = event.deltaY * zoomSpeed;
    const newZoom = Math.min(Math.max(currentZoom + delta, minZoom), maxZoom);

    setCameraOption({ zoom: newZoom });
  }, [setCameraOption]);
  
  useEffect(() => {
    const canvas = gl.domElement;

    if (enableMouse) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
    return undefined;
  }, [gl, handleWheel, enableMouse]);

  useEffect(() => {
    if (!enableMouse) {
      orbitModifierKeysRef.current.clear();
      orbitPointerActiveRef.current = false;
      targetOrbitYawRef.current = orbitYawRef.current;
      targetOrbitPitchRef.current = orbitPitchRef.current;
      return;
    }
    const canvas = gl.domElement;

    let orbitButtonMask = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerLastX = 0;
    let pointerLastY = 0;
    let dragging = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        orbitModifierKeysRef.current.add(event.code);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'ControlLeft' && event.code !== 'ControlRight') return;
      orbitModifierKeysRef.current.delete(event.code);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (isEditableTarget(event.target)) return;
      // Primary clicks belong to world interaction and editor selection.
      if (event.button !== 1 && event.button !== 2) return;

      event.preventDefault();
      orbitPointerActiveRef.current = true;
      orbitButtonMask = event.button === 1 ? 4 : 2;
      pointerStartX = pointerLastX = event.clientX;
      pointerStartY = pointerLastY = event.clientY;
      dragging = false;
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button !== 1 && event.button !== 2) return;
      orbitPointerActiveRef.current = false;
      dragging = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (orbitPointerActiveRef.current && !(event.buttons & orbitButtonMask)) {
        orbitPointerActiveRef.current = false;
        dragging = false;
      }
      const isOrbitActive = orbitModifierKeysRef.current.size > 0 || orbitPointerActiveRef.current;
      if (!isOrbitActive || isEditableTarget(event.target)) return;
      if (!orbitPointerActiveRef.current && event.target !== canvas) return;
      let deltaX = event.movementX;
      let deltaY = event.movementY;
      if (orbitPointerActiveRef.current) {
        deltaX = event.clientX - pointerLastX;
        deltaY = event.clientY - pointerLastY;
        pointerLastX = event.clientX;
        pointerLastY = event.clientY;
        if (!dragging) {
          dragging = Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > ORBIT_DRAG_THRESHOLD;
          return;
        }
      }
      if (deltaX === 0 && deltaY === 0) return;

      targetOrbitYawRef.current -= deltaX * ORBIT_SPEED;
      targetOrbitPitchRef.current = THREE.MathUtils.clamp(
        targetOrbitPitchRef.current + deltaY * ORBIT_SPEED,
        MIN_ORBIT_PITCH,
        MAX_ORBIT_PITCH,
      );
    };

    const clearOrbitKeyState = () => {
      orbitModifierKeysRef.current.clear();
      orbitPointerActiveRef.current = false;
    };

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', clearOrbitKeyState);
    document.addEventListener('visibilitychange', clearOrbitKeyState);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('contextmenu', preventContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', clearOrbitKeyState);
      document.removeEventListener('visibilitychange', clearOrbitKeyState);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [gl, updateConfig, enableMouse]);
  
  
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

  useLayoutEffect(() => {
    inputBackend.updateMouse({ isLookAround: false });
    syncCameraConfig();
  }, [inputBackend, syncCameraConfig]);

  useLayoutEffect(() => {
    syncCameraConfig();
  }, [cameraOption, mode, syncCameraConfig]);
  
  useFrame((state, delta) => {
    if (!system) return;

    const nextOrbitYaw = THREE.MathUtils.damp(
      orbitYawRef.current,
      targetOrbitYawRef.current,
      ORBIT_SMOOTHING,
      delta,
    );
    const nextOrbitPitch = THREE.MathUtils.damp(
      orbitPitchRef.current,
      targetOrbitPitchRef.current,
      ORBIT_SMOOTHING,
      delta,
    );
    if (
      Math.abs(nextOrbitYaw - orbitYawRef.current) > ORBIT_EPSILON ||
      Math.abs(nextOrbitPitch - orbitPitchRef.current) > ORBIT_EPSILON
    ) {
      orbitYawRef.current = nextOrbitYaw;
      orbitPitchRef.current = nextOrbitPitch;
      updateConfig({
        orbitYaw: nextOrbitYaw,
        orbitPitch: nextOrbitPitch,
      });
    }
    
    const legacyClock = 'clock' in state && state.clock instanceof THREE.Clock ? state.clock : undefined;
    // Reuse the calc props object to avoid per-frame allocations.
    if (!calcPropsRef.current) {
      calcPropsRef.current = {
        camera: state.camera,
        scene: state.scene,
        deltaTime: delta,
        activeState,
        clock: legacyClock,
        excludeObjects: excludeObjectsRef.current,
      };
    } else {
      const calcProps = calcPropsRef.current;
      calcProps.camera = state.camera;
      calcProps.scene = state.scene;
      calcProps.deltaTime = delta;
      calcProps.activeState = activeState;
      calcProps.clock = legacyClock;
    }
    system.calculate(calcPropsRef.current);
  });
  
  return {
    system,
  };
} 
