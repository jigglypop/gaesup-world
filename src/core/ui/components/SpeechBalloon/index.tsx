import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { SpeechBalloonProps } from './types';
import { useUIConfigStore } from '../../stores/UIConfigStore';
import { useSpeechBalloonPosition } from '../../hooks/useSpeechBalloonPosition';
import './styles.css';

function createRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 간단한 흰 배경 생성 함수
function createSimpleBackground(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  backgroundColor: string
) {
  // 간단한 흰색 배경
  context.fillStyle = backgroundColor;
  createRoundedRect(context, x, y, width, height, radius);
  context.fill();
  
  // 굵은 검정색 테두리
  context.strokeStyle = '#000000';
  context.lineWidth = 12;
  createRoundedRect(context, x + 6, y + 6, width - 12, height - 12, radius);
  context.stroke();
}

function createTextTexture({
  text,
  backgroundColor,
  textColor,
  fontSize,
  padding,
  borderRadius,
  maxWidth,
}: {
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  padding: number;
  borderRadius: number;
  maxWidth: number;
}): {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
  cleanup: () => void;
} | null {
  try {
    // 매우 안전한 기본값 설정
    const safeText = String(text || "안녕");
    const safeFontSize = Math.max(Math.floor(fontSize || 120), 40);
    const safePadding = Math.max(Math.floor(padding || 30), 15);
    
    // 더 큰 캔버스로 고해상도 - 큰 글씨에 맞춰 조정
    const canvasWidth = 1024;  // 2^10
    const canvasHeight = 512; // 2^9
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      console.error('Cannot get 2D context');
      return null;
    }
    
    // 캔버스 완전 초기화
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 간단한 배경 영역 - 큰 캔버스에 맞춰 조정
    const boxWidth = canvasWidth - 120;
    const boxHeight = canvasHeight - 120;
    const boxX = 60;
    const boxY = 60;
    
    // 간단한 흰색 배경 그리기
    createSimpleBackground(context, boxX, boxY, boxWidth, boxHeight, borderRadius || 80, backgroundColor || 'rgba(255, 255, 255, 0.95)');
    
    // 텍스트 설정 - 기본 폰트 사용
    const fontFamily = 'Arial Black, Arial, sans-serif';
    
    context.fillStyle = textColor || '#000000';
    context.font = `bold ${safeFontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 텍스트 그림자 효과 - 가독성을 위한 약간의 그림자
    context.shadowColor = 'rgba(128, 128, 128, 0.3)';
    context.shadowBlur = 2;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    
    // 텍스트를 캔버스 중앙에 그리기
    context.fillText(safeText, canvasWidth / 2, canvasHeight / 2);
    
    // 그림자 리셋
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    
    // 텍스처 생성 - 뒤집힘 문제 해결
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.flipY = true; // 텍스트 뒤집힘 방지
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    const cleanup = () => {
      try {
        texture.dispose();
      } catch (e) {
        console.warn('Error disposing texture:', e);
      }
    };
    
    return {
      texture,
      width: canvasWidth,
      height: canvasHeight,
      cleanup
    };
  } catch (error) {
    console.error('Error creating text texture:', error);
    return null;
  }
}

export function SpeechBalloon({
  text,
  position = new THREE.Vector3(0, 2, 0),
  offset,
  backgroundColor,
  textColor,
  fontSize,
  padding,
  borderRadius,
  maxWidth,
  visible = true,
  opacity = 1,
  children,
}: SpeechBalloonProps) {
  const { camera } = useThree();
  const prevDistanceRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const config = useUIConfigStore((state) => state.config.speechBalloon);
  
  // Use config values with prop overrides
  const finalOffset = offset || new THREE.Vector3(config.defaultOffset.x, config.defaultOffset.y, config.defaultOffset.z);
  
  // Use separated position hook
  const spriteRef = useSpeechBalloonPosition({ 
    playerPosition: position, 
    offset: finalOffset 
  });

  const [textureData, setTextureData] = React.useState<{
    texture: THREE.CanvasTexture;
    width: number;
    height: number;
    cleanup: () => void;
  } | null>(null);

  const textureRef = useRef<{ cleanup: () => void } | null>(null);

  // 텍스처 동기 생성
  React.useEffect(() => {
    // 이전 텍스처 정리
    if (textureRef.current?.cleanup) {
      textureRef.current.cleanup();
      textureRef.current = null;
    }
    
    if (!visible || !config.enabled) {
      setTextureData(null);
      return;
    }
    
    const safeText = text && text.trim().length > 0 ? text.trim() : "안녕";
    
    const result = createTextTexture({
      text: safeText,
      backgroundColor: backgroundColor || config.backgroundColor,
      textColor: textColor || config.textColor,
      fontSize: fontSize || config.fontSize,
      padding: padding || config.padding,
      borderRadius: borderRadius || config.borderRadius,
      maxWidth: maxWidth || config.maxWidth,
    });
    
    if (result) {
      textureRef.current = result;
      setTextureData(result);
    }
    
    // cleanup on unmount
    return () => {
      if (textureRef.current?.cleanup) {
        textureRef.current.cleanup();
        textureRef.current = null;
      }
    };
  }, [text, backgroundColor, textColor, fontSize, padding, borderRadius, maxWidth, visible, config]);

  const spriteMaterial = useMemo(() => {
    if (!textureData?.texture) return null;
    
    const material = new THREE.SpriteMaterial({
      map: textureData.texture,
      transparent: true,
      opacity: Math.max(0, Math.min(1, opacity || 1)),
      depthTest: false,  // 항상 보이도록
      depthWrite: false,
      alphaTest: 0.1,
    });
    
    return material;
  }, [textureData, opacity]);

  // Set initial scale once
  React.useEffect(() => {
    if (spriteRef.current && textureData) {
      const baseScale = config.scaleMultiplier || 1.5;
      // 새로운 캔버스 비율로 설정 (1024/512 = 2.0)
      const aspectRatio = 2.0;
      spriteRef.current.scale.set(baseScale * aspectRatio, baseScale, 1);
    }
  }, [textureData, config.scaleMultiplier]);

  // 간단한 거리 기반 스케일링
  useFrame(() => {
    if (!spriteRef.current || !textureData || !visible) return;
    
    frameCountRef.current++;
    if (frameCountRef.current % 10 !== 0) return; // 더 적은 업데이트
    
    try {
      const currentPosition = spriteRef.current.position;
      const distance = camera.position.distanceTo(currentPosition);
      
      if (Math.abs(distance - prevDistanceRef.current) > 1.0) {
        const baseScale = config.scaleMultiplier || 1.5;
        const distanceScale = Math.max(0.8, Math.min(1.5, 1 + distance * 0.01));
        const scale = baseScale * distanceScale;
        
        // 새로운 캔버스 비율 사용
        const aspectRatio = 2.0;
        spriteRef.current.scale.set(scale * aspectRatio, scale, 1);
        
        prevDistanceRef.current = distance;
      }
    } catch (error) {
      console.warn('Error in sprite scaling:', error);
    }
  });

  useEffect(() => {
    return () => {
      if (spriteMaterial) {
        spriteMaterial.dispose();
      }
    };
  }, [spriteMaterial]);

  // 안전한 렌더링 조건
  if (!visible || !textureData?.texture || !spriteMaterial) {
    return null;
  }

  return (
    <group>
      <sprite
        ref={spriteRef}
        material={spriteMaterial}
        renderOrder={1000}
        frustumCulled={false}
      >
        {/* 빈 geometry로 안전성 보장 */}
      </sprite>
      {children}
    </group>
  );
}

export default SpeechBalloon; 