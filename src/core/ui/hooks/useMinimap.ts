import { useCallback, useEffect, useRef, useState } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { useBuildingStore } from '../../building/stores/buildingStore';
import { MinimapProps, MinimapResult } from '../components/Minimap/types';
import { MinimapSystem } from '../core';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

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
  const minimapOption = useGaesupStore((state) => state.minimap);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const sceneObjectsRef = useRef<Map<string, { position: THREE.Vector3; size: THREE.Vector3 }>>(new Map());
  const minimapSystem = useRef(MinimapSystem.getInstance());
  
  const {
    scale: initialScale = DEFAULT_SCALE,
    blockRotate = false,
    angle = 0,
    updateInterval = 33,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(initialScale);
  const isReady = !!(activeState.position && props);

  // Initialize MinimapSystem canvas
    useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      minimapSystem.current.setCanvas(canvas);
    }
    return () => {
      minimapSystem.current.setCanvas(null);
    };
  }, []);

  const upscale = useCallback(() => {
    if (props.blockScale) return;
    setScale((prev) => Math.min(MAX_SCALE, prev + 0.1));
  }, [props.blockScale]);

  const downscale = useCallback(() => {
    if (props.blockScale) return;
    setScale((prev) => Math.max(MIN_SCALE, prev - 0.1));
  }, [props.blockScale]);

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
    const { position, euler } = activeState;
    if (!position || !euler) return;

    minimapSystem.current.render({
      size: MINIMAP_SIZE_PX,
      scale,
      position,
      rotation: euler.y,
      blockRotate,
      tileGroups,
      sceneObjects: sceneObjectsRef.current
    });
  }, [activeState, scale, blockRotate, tileGroups]);

  useEffect(() => {
    if (!isReady) return;
    
    const interval = setInterval(() => {
      const { position, euler } = activeState;
      if (position && euler) {
        minimapSystem.current.checkForUpdates(position, euler.y);
        updateCanvas();
      }
    }, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [updateCanvas, updateInterval, isReady, activeState]);

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
