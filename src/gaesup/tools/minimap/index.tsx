import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { GaesupWorldContext } from '../../world/context';
import { minimapAtom, modeAtom } from '../../atoms';
import { MinimapProps } from './type';
import {
  baseStyles,
  MINIMAP_SIZE_PX,
  directionStyles,
  objectStyles,
  avatarStyles,
  textStyles,
} from './style.css';

const DEFAULT_SCALE = 0.5;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;
const UPDATE_THRESHOLD = 0.1; // 위치 변화 임계값
const ROTATION_THRESHOLD = 0.02; // 회전 변화 임계값 (라디안)

export function MiniMap({
  scale: initialScale = DEFAULT_SCALE,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
  blockScale = false,
  blockScaleControl = false,
  blockRotate = false,
  angle = 0,
  minimapStyle,
  minimapInnerStyle,
  textStyle,
  minimapObjectStyle,
  avatarStyle,
  scaleStyle,
  directionStyle,
  plusMinusStyle,
  imageStyle,
}: MinimapProps) {
  const { activeState } = useContext(GaesupWorldContext);
  const mode = useAtomValue(modeAtom);
  const [minimap] = useAtom(minimapAtom);
  const [scale, setScale] = React.useState(initialScale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 성능 최적화: 이전 위치/회전 추적
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastRotationRef = useRef(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const getRotation = useCallback(() => {
    if (blockRotate || mode.control === 'normal') return 180;
    return (activeState.euler.y * 180) / Math.PI + 180;
  }, [blockRotate, mode.control]);

  // 성능 최적화: Canvas 업데이트 함수
  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeState?.position || !minimap?.props) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and setup
    ctx.clearRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Apply circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, MINIMAP_SIZE_PX, MINIMAP_SIZE_PX);

    // Setup rotation
    const rotation = getRotation();
    ctx.translate(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-MINIMAP_SIZE_PX / 2, -MINIMAP_SIZE_PX / 2);

    // Draw direction markers
    const drawDirections = () => {
      ctx.save();
      ctx.fillStyle = directionStyle?.color || directionStyles.color;
      ctx.font = `${directionStyle?.fontSize || directionStyles.fontSize} sans-serif`;

      const dirs = [
        { text: 'N', x: MINIMAP_SIZE_PX / 2, y: 30 },
        { text: 'S', x: MINIMAP_SIZE_PX / 2, y: MINIMAP_SIZE_PX - 30 },
        { text: 'E', x: MINIMAP_SIZE_PX - 30, y: MINIMAP_SIZE_PX / 2 },
        { text: 'W', x: 30, y: MINIMAP_SIZE_PX / 2 },
      ];

      dirs.forEach(({ text, x, y }) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((-rotation * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });

      ctx.restore();
    };

    drawDirections();

    // Draw minimap objects
    Object.values(minimap.props).forEach((obj, index) => {
      const { center, size, text } = obj;

      // Calculate position
      const posX = (center.x - activeState.position.x) * (angle ? Math.sin(angle) : 1) * scale;
      const posZ = (center.z - activeState.position.z) * (angle ? -Math.cos(angle) : 1) * scale;

      // Draw object
      ctx.save();
      ctx.fillStyle = minimapObjectStyle?.background || objectStyles.background;
      const width = size.x * scale;
      const height = size.z * scale;
      const x = MINIMAP_SIZE_PX / 2 - posX - width / 2;
      const y = MINIMAP_SIZE_PX / 2 - posZ - height / 2;
      ctx.fillRect(x, y, width, height);

      // Draw text if present
      if (text) {
        ctx.save();
        ctx.fillStyle = textStyle?.color || textStyles.color;
        ctx.font = `${textStyle?.fontSize || textStyles.fontSize} sans-serif`;
        ctx.translate(x + width / 2, y + height / 2);
        if (blockRotate || mode.control === 'normal') {
          ctx.rotate(Math.PI);
        } else {
          ctx.rotate((-rotation * Math.PI) / 180);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    });

    // Draw avatar
    ctx.save();
    ctx.fillStyle = avatarStyle?.background || avatarStyles.background;
    ctx.shadowColor = avatarStyle?.boxShadow || avatarStyles.boxShadow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, [
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

  // 성능 최적화: 위치/회전 변화 감지 및 throttled 업데이트
  useEffect(() => {
    const checkForUpdates = () => {
      if (!activeState?.position) return;

      const currentPos = activeState.position;
      const currentRotation = activeState.euler.y;
      const lastPos = lastPositionRef.current;
      const lastRotation = lastRotationRef.current;

      // 위치 변화 확인
      const positionChanged = 
        Math.abs(currentPos.x - lastPos.x) > UPDATE_THRESHOLD ||
        Math.abs(currentPos.z - lastPos.z) > UPDATE_THRESHOLD;

      // 회전 변화 확인
      const rotationChanged = Math.abs(currentRotation - lastRotation) > ROTATION_THRESHOLD;

      if (positionChanged || rotationChanged) {
        // 이전 타임아웃 취소
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // 새로운 업데이트 스케줄 (16ms = ~60fps 제한)
        updateTimeoutRef.current = setTimeout(() => {
          updateCanvas();
          
          // 마지막 값 업데이트
          lastPositionRef.current = {
            x: currentPos.x,
            y: currentPos.y,
            z: currentPos.z,
          };
          lastRotationRef.current = currentRotation;
        }, 16);
      }
    };

    // 초기 렌더링
    updateCanvas();

    // 위치 변화 체크를 위한 interval (120fps에서 체크, 업데이트는 60fps로 제한)
    const intervalId = setInterval(checkForUpdates, 8);

    return () => {
      clearInterval(intervalId);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateCanvas]);

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
          ...minimapStyle,
        }}
        onWheel={handleWheel}
      />
      {!blockScaleControl && (
        <div
          style={{
            ...baseStyles.scale,
            ...scaleStyle,
          }}
        >
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              ...plusMinusStyle,
            }}
            onClick={downscale}
          >
            +
          </div>
          <span>SCALE 1:{Math.round(100 / scale)}</span>
          <div
            style={{
              ...baseStyles.plusMinus,
              cursor: blockScale ? 'default' : 'pointer',
              ...plusMinusStyle,
            }}
            onClick={upscale}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}
