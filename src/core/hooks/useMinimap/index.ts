import { useCallback, useEffect, useRef, useState } from 'react';
import { useGaesupContext } from '../../stores/gaesupStore';
import { MinimapProps } from '../../component/minimap/types';

const DEFAULT_SCALE = 5;
const MIN_SCALE = 0.5;
const MAX_SCALE = 20;
const UPDATE_THRESHOLD = 0.1;
const ROTATION_THRESHOLD = 0.01;
const MINIMAP_SIZE_PX = 200;

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

export const useMinimap = (props: MinimapProps) => {
  const { mode, activeState } = useGaesupContext();

  const {
    size = 200,
    scale: initialScale = DEFAULT_SCALE,
    zoom = 2,
    blockRotate = false,
    angle = 0,
    updateInterval = 33,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(initialScale);
  const lastPositionRef = useRef(activeState?.position);
  const lastRotationRef = useRef(activeState?.euler.y);

  const isReady = !!(activeState?.position && props);

  const upscale = useCallback(() => {
    if (blockRotate) return;
    setScale((prev) => Math.min(MAX_SCALE, prev + 0.1));
  }, [blockRotate]);

  const downscale = useCallback(() => {
    if (blockRotate) return;
    setScale((prev) => Math.max(MIN_SCALE, prev - 0.1));
  }, [blockRotate]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (blockRotate) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [blockRotate, upscale, downscale],
  );

  const setupWheelListener = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (blockRotate) return;
      e.preventDefault();
      if (e.deltaY < 0) upscale();
      else downscale();
    };
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [blockRotate, upscale, downscale]);

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeState || !props) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { position, euler } = activeState;
    const rotation = euler.y;
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();
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
    const displayRotation =
      blockRotate || mode.control === 'normal' ? 180 : (rotation * 180) / Math.PI + 180;
    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((displayRotation * Math.PI) / 180);
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
    if (props && typeof props === 'object') {
      Object.values(props).forEach((obj: any) => {
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
  }, [activeState, props, mode, scale, angle, blockRotate]);

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
      updateCanvas();
      lastPositionRef.current = { x: position.x, y: position.y, z: position.z };
      lastRotationRef.current = rotation;
    }
  }, [activeState, updateCanvas]);

  // Setup update intervals
  useEffect(() => {
    updateCanvas();
    const interval = setInterval(checkForUpdates, updateInterval);

    return () => {
      clearInterval(interval);
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
};
