import React, { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

// 미니맵 컴포넌트에 전달되는 props 타입 정의
interface DirectMiniMapProps {
  onRotate?: (angle: number) => void;
  currentAngle?: number;
  style?: React.CSSProperties;
}

export default function DirectMiniMap({ onRotate, currentAngle: externalAngle, style }: DirectMiniMapProps) {
  // 미니맵 크기와 타일 관련 상수
  const MINIMAP_SIZE = 200;
  
  // 캔버스 ref와 회전 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localAngle, setLocalAngle] = useState(Math.PI * 1.5); // 초기값: 북쪽
  
  // 실제 사용할 각도 (외부 제공 또는 로컬)
  const currentAngle = externalAngle !== undefined ? externalAngle : localAngle;

  // 미니맵 그리기
  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // 원형 클리핑 경로 생성
    ctx.save();
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    // 배경 채우기
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // 회전 적용
    ctx.translate(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2);
    ctx.rotate(currentAngle);
    ctx.translate(-MINIMAP_SIZE / 2, -MINIMAP_SIZE / 2);

    // 방향 표시
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    const dirs = [
      { text: 'N', x: MINIMAP_SIZE / 2, y: 20 },
      { text: 'S', x: MINIMAP_SIZE / 2, y: MINIMAP_SIZE - 20 },
      { text: 'E', x: MINIMAP_SIZE - 20, y: MINIMAP_SIZE / 2 },
      { text: 'W', x: 20, y: MINIMAP_SIZE / 2 },
    ];

    dirs.forEach(({ text, x, y }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-currentAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#01fff7';
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, MINIMAP_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [currentAngle]);

  const updateRotation = useCallback((angle: number) => {
    setLocalAngle(angle);
    if (onRotate) {
      onRotate(angle);
    }
  }, [onRotate]);

  const calcAngle = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx) + Math.PI / 2; // 90도 조정 (북쪽이 위를 향하게)
    updateRotation(angle);
  }, [isDragging, updateRotation]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    calcAngle(e.clientX, e.clientY);
  }, [calcAngle]);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback(() => setIsDragging(true), []);
  const handleTouchEnd = useCallback(() => setIsDragging(false), []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // 스크롤 방지
    const touch = e.touches[0];
    if (touch) {
      calcAngle(touch.clientX, touch.clientY);
    }
  }, [calcAngle]);

  // 미니맵 그리기 효과
  useEffect(() => {
    drawMiniMap();
  }, [drawMiniMap]);

  // 외부 각도가 변경되면 반영
  useEffect(() => {
    if (externalAngle !== undefined) {
      setLocalAngle(externalAngle);
    }
  }, [externalAngle]);

  useEffect(() => {
    if (externalAngle === undefined) {
      updateRotation(Math.PI * 1.5);
    }
    window.miniMapControl = {
      rotate: updateRotation,
      getAngle: () => currentAngle
    };
  }, [updateRotation, currentAngle, externalAngle]);

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_SIZE}
      height={MINIMAP_SIZE}
      style={{
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        display: 'block',
        width: `${MINIMAP_SIZE}px`,
        height: `${MINIMAP_SIZE}px`,
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    />
  );
} 