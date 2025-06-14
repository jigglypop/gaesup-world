import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useGaesupContext } from '../../atoms';
import { useGaesupStore } from '../../stores/gaesupStore';

const DEFAULT_SCALE = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 20;
const UPDATE_THRESHOLD = 0.1;
const ROTATION_THRESHOLD = 0.01;
const UPDATE_INTERVAL = 100;
const MINIMAP_SIZE_PX = 200;

interface MinimapOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  blockScale?: boolean;
  blockScaleControl?: boolean;
  blockRotate?: boolean;
  angle?: number;
  updateInterval?: number;
}

export interface MinimapResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: number;
  upscale: () => void;
  downscale: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  setupWheelListener: () => (() => void) | undefined;
  updateCanvas: () => void;
  isReady: boolean;
}

export function useMinimap(options: MinimapOptions = {}): MinimapResult {
  const {
    initialScale = DEFAULT_SCALE,
    minScale = MIN_SCALE,
    maxScale = MAX_SCALE,
    blockScale = false,
    blockRotate = false,
    angle = 0,
    updateInterval = UPDATE_INTERVAL,
  } = options;
  const { activeState } = useGaesupContext();
  const mode = useGaesupStore((state) => state.mode);
  const minimap = useGaesupStore((state) => state.minimap);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(initialScale);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastRotationRef = useRef(0);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isReady = Boolean(activeState?.position && minimap?.props);

  const upscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.min(maxScale, prev + 0.1));
  }, [blockScale, maxScale]);

  const downscale = useCallback(() => {
    if (blockScale) return;
    setScale((prev) => Math.max(minScale, prev - 0.1));
  }, [blockScale, minScale]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (blockScale) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [blockScale, upscale, downscale],
  );

  const setupWheelListener = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (blockScale) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [blockScale, upscale, downscale]);

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeState || !minimap?.props) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { position, euler } = activeState;
    const rotation = euler.y;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Set clipping to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();

    // Background gradient
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
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Apply rotation
    const displayRotation =
      blockRotate || mode.control === 'normal' ? 180 : (rotation * 180) / Math.PI + 180;

    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((displayRotation * Math.PI) / 180);
    ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);

    // Draw grid
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

    // Draw compass
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
      ctx.rotate((-displayRotation * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // Draw objects
    if (minimap?.props && typeof minimap.props === 'object') {
      Object.values(minimap.props).forEach((obj: any) => {
        if (!obj?.center || !obj?.size) return;

        const { center, size, text } = obj;
        const posX = (center.x - position.x) * scale;
        const posZ = (center.z - position.z) * scale;

        ctx.save();
        const width = size.x * scale;
        const height = size.z * scale;
        const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
        const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;

        // Object shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Object background
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y, width, height);

        // Object border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Object text
        if (text) {
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 2;
          ctx.translate(x + width / 2, y + height / 2);
          if (blockRotate || mode.control === 'normal') {
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

    // Draw player avatar
    ctx.save();
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

    ctx.fillStyle = avatarGradient;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#01fff7';
    ctx.shadowColor = '0 0 10px rgba(1,255,247,0.7)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.lineTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2 - 12);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }, [activeState, minimap, mode, scale, angle, blockRotate]);

  // Update tracking and intervals
  const checkForUpdates = useCallback(() => {
    if (!activeState?.position) return;

    const { position, euler } = activeState;
    const rotation = euler.y;
    const lastPos = lastPositionRef.current;
    const lastRotation = lastRotationRef.current;

    const positionChanged =
      Math.abs(position.x - lastPos.x) > UPDATE_THRESHOLD ||
      Math.abs(position.z - lastPos.z) > UPDATE_THRESHOLD;

    const rotationChanged = Math.abs(rotation - lastRotation) > ROTATION_THRESHOLD;

    if (positionChanged || rotationChanged) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        updateCanvas();
        lastPositionRef.current = { x: position.x, y: position.y, z: position.z };
        lastRotationRef.current = rotation;
      }, 33);
    }
  }, [activeState, updateCanvas]);

  // Setup update intervals
  useEffect(() => {
    updateCanvas();
    intervalRef.current = setInterval(checkForUpdates, updateInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [updateCanvas, checkForUpdates, updateInterval]);

  // Update on scale change
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
}
