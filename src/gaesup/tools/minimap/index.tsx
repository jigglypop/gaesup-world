import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GaesupWorldContext } from '../../world/context';
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
  onRotationChange,
}: MinimapProps) {
  const { minimap, activeState, mode } = useContext(GaesupWorldContext);
  const [scale, setScale] = React.useState(initialScale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

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
  }, [blockRotate, mode.control, activeState.euler.y]);

  // 클릭 후 회전 기능을 위한 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (blockRotate) return;
    setIsDragging(true);
  }, [blockRotate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || blockRotate) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // 마우스 위치와 중심점의 차이로 각도 계산
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      
      setRotationAngle(angle);
      
      // 회전 변경 콜백 호출
      if (onRotationChange) {
        onRotationChange(angle);
      }
    },
    [isDragging, blockRotate, onRotationChange],
  );

  useEffect(() => {
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

    // Setup rotation - 드래그 회전 값 적용
    let rotation = getRotation();
    if (isDragging) {
      rotation = (rotationAngle * 180) / Math.PI;
    }
    
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
      ctx.fillStyle = (minimapObjectStyle?.background as string) || objectStyles.background;
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
    ctx.fillStyle = (avatarStyle?.background as string) || avatarStyles.background;
    ctx.shadowColor = avatarStyle?.boxShadow || avatarStyles.boxShadow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE_PX / 2, MINIMAP_SIZE_PX / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, [
    minimap,
    activeState,
    scale,
    angle,
    blockRotate,
    mode.control,
    getRotation,
    minimapObjectStyle,
    textStyle,
    avatarStyle,
    directionStyle,
    isDragging,
    rotationAngle,
  ]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE_PX}
        height={MINIMAP_SIZE_PX}
        style={{
          ...baseStyles.minimap,
          ...minimapStyle,
          cursor: blockRotate ? 'default' : 'pointer',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
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
            onClick={upscale}
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
            onClick={downscale}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}
