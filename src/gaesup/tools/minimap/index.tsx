import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { minimapAtom, modeAtom } from '../../atoms';
import { GaesupWorldContext } from '../../world/context';
import {
  avatarStyles,
  baseStyles,
  directionStyles,
  MINIMAP_SIZE_PX,
  objectStyles,
  textStyles,
} from './style.css';
import { MinimapProps } from './type';

const DEFAULT_SCALE = 0.5;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;
const UPDATE_THRESHOLD = 0.15;
const ROTATION_THRESHOLD = 0.03;
const UPDATE_INTERVAL = 50;

export function MiniMap({
  scale: initialScale = DEFAULT_SCALE,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
  blockScale = false,
  blockScaleControl = false,
  blockRotate = false,
  angle = 0,
  minimapStyle,
  textStyle,
  minimapObjectStyle,
  avatarStyle,
  scaleStyle,
  directionStyle,
  plusMinusStyle,
}: MinimapProps) {
  const { activeState } = useContext(GaesupWorldContext);
  const mode = useAtomValue(modeAtom);
  const [minimap] = useAtom(minimapAtom);
  const [scale, setScale] = React.useState(initialScale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastRotationRef = useRef(0);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      if (e.deltaY < 0) upscale();
      else downscale();
    },
    [blockScale, upscale, downscale],
  );
  useEffect(() => {
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
  const getCurrentState = useCallback(() => {
    if (!activeState?.position) return null;

    return {
      position: activeState.position,
      rotation: activeState.euler.y,
    };
  }, [activeState]);

  const getRotation = useCallback(
    (rotation: number) => {
      if (blockRotate || mode.control === 'normal') return 180;
      return (rotation * 180) / Math.PI + 180;
    },
    [blockRotate, mode.control],
  );

  // 성능 최적화: Canvas 업데이트 함수
  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const currentState = getCurrentState();

    if (!canvas || !currentState || !minimap?.props) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { position, rotation } = currentState;

    // Clear and setup
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Apply circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw background with gradient
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

    // Setup rotation
    const displayRotation = getRotation(rotation);
    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((displayRotation * Math.PI) / 180);
    ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);

    // Draw grid lines (optional enhancement)
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

    // Draw direction markers
    const drawDirections = () => {
      ctx.save();
      ctx.fillStyle = directionStyle?.color || directionStyles.color;
      ctx.font = `bold ${directionStyle?.fontSize || directionStyles.fontSize} sans-serif`;
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
    };

    drawDirections();

    // Draw minimap objects with enhanced styling
    if (minimap?.props && typeof minimap.props === 'object') {
      Object.values(minimap.props).forEach((obj: any, index) => {
        if (!obj || typeof obj !== 'object' || !obj.center || !obj.size) return;

        const { center, size, text } = obj;

        // Calculate position
        const posX = (center.x - position.x) * (angle ? Math.sin(angle) : 1) * scale;
        const posZ = (center.z - position.z) * (angle ? -Math.cos(angle) : 1) * scale;

        // Draw object with border and shadow
        ctx.save();

        const width = size.x * scale;
        const height = size.z * scale;
        const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
        const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Object background
        ctx.fillStyle = minimapObjectStyle?.background || objectStyles.background;
        ctx.fillRect(x, y, width, height);

        // Object border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Draw text if present
        if (text) {
          ctx.save();
          ctx.fillStyle = textStyle?.color || textStyles.color;
          ctx.font = `bold ${textStyle?.fontSize || textStyles.fontSize} sans-serif`;
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

    // Draw enhanced avatar
    ctx.save();

    // Avatar glow effect
    const avatarGradient = ctx.createRadialGradient(
      MINIMAP_SIZE_PX / 2,
      MINIMAP_SIZE_PX / 2,
      0,
      MINIMAP_SIZE_PX / 2,
      MINIMAP_SIZE_PX / 2,
      12,
    );
    avatarGradient.addColorStop(0, avatarStyle?.background || avatarStyles.background);
    avatarGradient.addColorStop(0.7, avatarStyle?.background || avatarStyles.background);
    avatarGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = avatarGradient;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Avatar main circle
    ctx.fillStyle = avatarStyle?.background || avatarStyles.background;
    ctx.shadowColor = avatarStyle?.boxShadow || avatarStyles.boxShadow;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Avatar direction indicator
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.lineTo(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2 - 12);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }, [
    getCurrentState,
    minimap,
    scale,
    angle,
    blockRotate,
    mode.control,
    getRotation,
    minimapObjectStyle,
    textStyle,
    avatarStyle,
    directionStyle,
  ]);

  // 성능 최적화: ref 기반 위치/회전 변화 감지
  useEffect(() => {
    const checkForUpdates = () => {
      const currentState = getCurrentState();
      if (!currentState) return;

      const { position, rotation } = currentState;
      const lastPos = lastPositionRef.current;
      const lastRotation = lastRotationRef.current;

      // 위치 변화 확인
      const positionChanged =
        Math.abs(position.x - lastPos.x) > UPDATE_THRESHOLD ||
        Math.abs(position.z - lastPos.z) > UPDATE_THRESHOLD;

      // 회전 변화 확인
      const rotationChanged = Math.abs(rotation - lastRotation) > ROTATION_THRESHOLD;

      if (positionChanged || rotationChanged) {
        // 이전 타임아웃 취소
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // 새로운 업데이트 스케줄 (33ms = ~30fps 제한으로 성능 개선)
        updateTimeoutRef.current = setTimeout(() => {
          updateCanvas();

          // 마지막 값 업데이트
          lastPositionRef.current = {
            x: position.x,
            y: position.y,
            z: position.z,
          };
          lastRotationRef.current = rotation;
        }, 33);
      }
    };

    // 초기 렌더링
    updateCanvas();

    // 위치 변화 체크를 위한 interval (20fps로 최적화)
    intervalRef.current = setInterval(checkForUpdates, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateCanvas, getCurrentState]);

  // 스케일 변화시에만 즉시 업데이트
  useEffect(() => {
    updateCanvas();
  }, [scale, updateCanvas]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        style={{
          ...baseStyles.minimap,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          ...minimapStyle,
        }}
        onWheel={handleWheel}
      />
      {!blockScaleControl && (
        <div
          style={{
            ...baseStyles.scale,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '15px',
            padding: '8px 12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            ...scaleStyle,
          }}
        >
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...plusMinusStyle,
            }}
            onClick={upscale}
          >
            +
          </div>
          <span
            style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}
          >
            1:{Math.round(100 / scale)}
          </span>
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...plusMinusStyle,
            }}
            onClick={downscale}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}

// 자동 등록 컴포넌트들도 함께 export
export { MinimapMarker, MinimapObject, MinimapPlatform } from './MinimapMarker';
