import { useCallback, useEffect, useRef, useState } from 'react';

import type { Vector3 } from 'three';

import { useBuildingStore } from '../../building/stores/buildingStore';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import { MinimapProps, MinimapResult } from '../components/Minimap/types';
import { MinimapSystem } from '../core';
import type { MinimapMarker } from '../types';

const DEFAULT_SCALE = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 20;
const MINIMAP_SIZE_PX = 200;

export interface UseMinimapReturnType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale: number;
  upscale: () => void;
  downscale: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  setupWheelListener: () => void;
  updateCanvas: () => void;
  isReady: boolean;
}

export const useMinimap = (props: MinimapProps): MinimapResult => {
  const { activeState } = useStateSystem();
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const sceneObjectsRef = useRef<Map<string, { position: Vector3; size: Vector3 }>>(new Map());
  const minimapSystem = useRef<MinimapSystem | null>(null);
  
  const {
    size = MINIMAP_SIZE_PX,
    scale: initialScale = props.initialScale ?? DEFAULT_SCALE,
    minScale = MIN_SCALE,
    maxScale = MAX_SCALE,
    blockRotate = false,
    updateInterval = 33,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(() => Math.min(maxScale, Math.max(minScale, initialScale)));
  const isReady = !!(activeState.position && props);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shared = MinimapSystem.getInstance();
    const system = new MinimapSystem();
    system.setCanvas(canvas);
    minimapSystem.current = system;
    const syncMarkers = (markers: Map<string, MinimapMarker>) => {
      system.clear();
      for (const marker of markers.values()) {
        system.addMarker(marker.id, marker.type, marker.text, marker.center, marker.size);
      }
    };
    syncMarkers(shared.getMarkers());
    const unsubscribe = shared.subscribe(syncMarkers);
    return () => {
      unsubscribe();
      minimapSystem.current = null;
      system.dispose();
    };
  }, []);

  const upscale = useCallback(() => {
    if (props.blockScale) return;
    setScale((prev) => Math.min(maxScale, prev + 0.1));
  }, [props.blockScale, maxScale]);

  const downscale = useCallback(() => {
    if (props.blockScale) return;
    setScale((prev) => Math.max(minScale, prev - 0.1));
  }, [props.blockScale, minScale]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (props.blockScale) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [props.blockScale, upscale, downscale],
  );

  const setupWheelListener = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (props.blockScale) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    };
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [props.blockScale, upscale, downscale]);

  const updateCanvas = useCallback(() => {
    if (document.hidden) return;
    const { position, euler } = activeState;
    if (!position || !euler) return;

    minimapSystem.current?.render({
      size,
      scale,
      position,
      rotation: euler.y,
      blockRotate,
      tileGroups,
      sceneObjects: sceneObjectsRef.current
    });
  }, [activeState, size, scale, blockRotate, tileGroups]);

  useEffect(() => {
    if (!isReady) return;
    
    const tick = () => {
      const { position, euler } = activeState;
      if (position && euler) {
        minimapSystem.current?.checkForUpdates(position, blockRotate ? 0 : euler.y);
        updateCanvas();
      }
    };
    let interval = document.hidden ? undefined : setInterval(tick, updateInterval);
    const handleVisibilityChange = () => {
      if (interval !== undefined) clearInterval(interval);
      interval = undefined;
      if (document.hidden) return;
      tick();
      interval = setInterval(tick, updateInterval);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateCanvas, updateInterval, isReady, activeState, blockRotate]);

  useEffect(() => {
    updateCanvas();
  }, [scale, updateCanvas]);

  return {
    canvasRef,
    scale,
    upscale,
    downscale,
    handleWheel,
    setupWheelListener,
    updateCanvas,
    isReady,
  };
};
