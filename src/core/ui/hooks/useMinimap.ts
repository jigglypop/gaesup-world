import { useCallback, useEffect, useRef, useState } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { useBuildingStore } from '../../building/stores/buildingStore';
import { MinimapProps, MinimapResult } from '../components/Minimap/types';
import { MinimapSystem } from '../core';
import * as THREE from 'three';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

const DEFAULT_SCALE = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 20;
const UPDATE_THRESHOLD = 0.1;
const ROTATION_THRESHOLD = 0.01;
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
  const [minimapMarkers, setMinimapMarkers] = useState<Map<string, any>>(new Map());
  const {
    scale: initialScale = DEFAULT_SCALE,
    blockRotate = false,
    angle = 0,
    updateInterval = 33,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(initialScale);
  const lastPositionRef = useRef<{ x: number; z: number } | null>(null);
  const lastRotationRef = useRef<number | null>(null);
  const gradientCacheRef = useRef<{
    background: CanvasGradient | null;
    avatar: CanvasGradient | null;
  }>({ background: null, avatar: null });
  const isDirtyRef = useRef(true);
  const isReady = !!(activeState.position && props);

      // Subscribe to MinimapSystem
    useEffect(() => {
      const engine = MinimapSystem.getInstance();
    const unsubscribe = engine.subscribe((markers) => {
      setMinimapMarkers(markers);
      isDirtyRef.current = true;
    });
    setMinimapMarkers(engine.getMarkers());
    return unsubscribe;
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
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const { position, euler } = activeState;
    if (!position || !euler) {
      return;
    }
    const rotation = euler.y;
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();
    
    if (!gradientCacheRef.current.background) {
      const gradient = ctx.createRadialGradient(
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        0,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
      );
      gradient.addColorStop(0, 'rgba(20, 30, 40, 0.9)');
      gradient.addColorStop(1, 'rgba(10, 20, 30, 0.95)');
      gradientCacheRef.current.background = gradient;
    }
    ctx.fillStyle = gradientCacheRef.current.background;
    ctx.fillRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);
    const displayRotation = (rotation * 180) / Math.PI;
    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((-displayRotation * Math.PI) / 180);
    ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < MINIMAP_SIZE_PX; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, MINIMAP_SIZE_PX);
      ctx.moveTo(0, i);
      ctx.lineTo(MINIMAP_SIZE_PX, i);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;

    const dirs = [
      { text: 'N', x: MINIMAP_SIZE_PX / 2, y: 25, color: '#ff6b6b' },
      { text: 'S', x: MINIMAP_SIZE_PX / 2, y: MINIMAP_SIZE_PX - 25, color: '#4ecdc4' },
      { text: 'E', x: MINIMAP_SIZE_PX - 25, y: MINIMAP_SIZE_PX / 2, color: '#45b7d1' },
      { text: 'W', x: 25, y: MINIMAP_SIZE_PX / 2, color: '#f9ca24' },
    ];

    dirs.forEach(({ text, x, y, color }) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.translate(x, y);
      ctx.rotate((displayRotation * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // Render tiles
    if (tileGroups && tileGroups.size > 0) {
      const tileGroupsArray = Array.from(tileGroups.values());
      tileGroupsArray.forEach((tileGroup) => {
        if (tileGroup && tileGroup.tiles && Array.isArray(tileGroup.tiles)) {
          tileGroup.tiles.forEach((tile) => {
            if (!tile || !tile.position) return;
            
            const posX = (tile.position.x - position.x) * scale;
            const posZ = (tile.position.z - position.z) * scale;
            const tileSize = (tile.size || 1) * 4 * scale;
            
            ctx.save();
            const x = MINIMAP_SIZE_PX / 2 - posX - tileSize / 2;
            const y = MINIMAP_SIZE_PX / 2 - posZ - tileSize / 2;
            
            if (tile.objectType === 'water') {
              ctx.fillStyle = 'rgba(0, 150, 255, 0.6)';
            } else if (tile.objectType === 'grass') {
              ctx.fillStyle = 'rgba(50, 200, 50, 0.4)';
            } else {
              ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
            }
            
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, tileSize, tileSize);
            ctx.restore();
          });
        }
      });
    }

    // Render scene objects
    sceneObjectsRef.current.forEach((obj, id) => {
      if (!obj?.position || !obj?.size) return;
      const posX = (obj.position.x - position.x) * scale;
      const posZ = (obj.position.z - position.z) * scale;
      const objWidth = obj.size.x * scale;
      const objHeight = obj.size.z * scale;
      ctx.save();
      const x = MINIMAP_SIZE_PX / 2 - posX - objWidth / 2;
      const y = MINIMAP_SIZE_PX / 2 - posZ - objHeight / 2;
      ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
      ctx.fillRect(x, y, objWidth, objHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, objWidth, objHeight);
      ctx.restore();
    });

    if (minimapMarkers.size > 0) {
      minimapMarkers.forEach((marker) => {
        if (!marker?.center || !marker?.size) return;
        const { center, size, text } = marker;
        const posX = (center.x - position.x) * scale;
        const posZ = (center.z - position.z) * scale;
        ctx.save();
        const width = size.x * scale;
        const height = size.z * scale;
        const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
        const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y, width, height);
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        if (text) {
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 2;
          ctx.translate(x + width / 2, y + height / 2);
          if (blockRotate || minimapOption?.control === 'normal') {
            ctx.rotate(Math.PI);
          } else {
            ctx.rotate((-displayRotation * Math.PI) / 180);
          }
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
        ctx.restore();
      });
    }
    ctx.save();
    if (!gradientCacheRef.current.avatar) {
      const avatarGradient = ctx.createRadialGradient(
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        0,
        MINIMAP_SIZE_PX / 2,
        MINIMAP_SIZE_PX / 2,
        12,
      );
      avatarGradient.addColorStop(0, '#01fff7');
      avatarGradient.addColorStop(0.7, '#01fff7');
      avatarGradient.addColorStop(1, 'transparent');
      gradientCacheRef.current.avatar = avatarGradient;
    }

    ctx.fillStyle = gradientCacheRef.current.avatar;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#01fff7';
    ctx.shadowColor = '0 0 10px rgba(1,255,247,0.7)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.lineTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2 - 12);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }, [activeState, minimapMarkers, minimapOption, scale, angle, blockRotate, tileGroups]);

  const checkForUpdates = useCallback(() => {
    if (!activeState.position || !activeState.euler) return;
    
    const { position, euler } = activeState;
    const rotation = euler.y;
    const lastPos = lastPositionRef.current;
    const lastRotation = lastRotationRef.current;

    if (!lastPos || lastRotation === null) {
      isDirtyRef.current = true;
      lastPositionRef.current = { x: position.x, z: position.z };
      lastRotationRef.current = rotation;
      return;
    }

    const positionChanged =
      Math.abs(position.x - lastPos.x) > UPDATE_THRESHOLD ||
      Math.abs(position.z - lastPos.z) > UPDATE_THRESHOLD;

    const rotationChanged = Math.abs(rotation - lastRotation) > ROTATION_THRESHOLD;

    if (positionChanged || rotationChanged) {
      isDirtyRef.current = true;
      lastPositionRef.current = { x: position.x, z: position.z };
      lastRotationRef.current = rotation;
    }
  }, [activeState]);

  useEffect(() => {
    if (!isReady) return;
    
    const renderLoop = () => {
      if (isDirtyRef.current) {
        updateCanvas();
        isDirtyRef.current = false;
      }
    };
    
    const interval = setInterval(() => {
      checkForUpdates();
      renderLoop();
    }, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [updateCanvas, checkForUpdates, updateInterval, isReady]);

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
