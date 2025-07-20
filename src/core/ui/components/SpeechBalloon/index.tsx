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

// 성능 최적화된 배경 생성 함수
function createSimpleBackground(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  backgroundColor: string,
  borderWidth: number = 8,
  borderColor: string = '#000000'
) {
  // 간단한 흰색 배경
  context.fillStyle = backgroundColor;
  createRoundedRect(context, x, y, width, height, radius);
  context.fill();
  
  // 설정 가능한 테두리
  context.strokeStyle = borderColor;
  context.lineWidth = borderWidth;
  const halfBorder = borderWidth / 2;
  createRoundedRect(context, x + halfBorder, y + halfBorder, width - borderWidth, height - borderWidth, radius);
  context.stroke();
}

function createTextTexture({
  text,
  backgroundColor,
  textColor,
  fontSize,
  padding,
  borderRadius,
  borderWidth,
  borderColor,
  maxWidth,
}: {
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  padding: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
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
    const safeFontSize = Math.max(Math.floor(fontSize ?? 120), 40);
    const safePadding = Math.max(Math.floor(padding ?? 30), 15);
    
    // 성능 최적화를 위한 적당한 크기 캔버스
    const canvasWidth = 512;  // 2^9
    const canvasHeight = 256; // 2^8
    
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
    
    // 간단한 배경 영역 - 최적화된 크기
    const boxWidth = canvasWidth - 60;
    const boxHeight = canvasHeight - 60;
    const boxX = 30;
    const boxY = 30;
    
    // 간단한 흰색 배경 그리기
    createSimpleBackground(
      context, 
      boxX, 
      boxY, 
      boxWidth, 
      boxHeight, 
      borderRadius ?? 80, 
      backgroundColor ?? 'rgba(255, 255, 255, 0.95)',
      borderWidth ?? 12,
      borderColor ?? '#000000'
    );
    
    // 텍스트 설정 - 기본 폰트 사용
    const fontFamily = 'Arial Black, Arial, sans-serif';
    
    context.fillStyle = textColor ?? '#000000';
    context.font = `bold ${safeFontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 성능 최적화: 그림자 제거, 단순 텍스트만 렌더링
    context.fillText(safeText, canvasWidth / 2, canvasHeight / 2);
    
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
  borderWidth,
  borderColor,
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
      backgroundColor: backgroundColor ?? config.backgroundColor,
      textColor: textColor ?? config.textColor,
      fontSize: fontSize ?? config.fontSize,
      padding: padding ?? config.padding,
      borderRadius: borderRadius ?? config.borderRadius,
      borderWidth: borderWidth ?? config.borderWidth,
      borderColor: borderColor ?? config.borderColor,
      maxWidth: maxWidth ?? config.maxWidth,
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
  }, [
    text, 
    backgroundColor ?? config.backgroundColor, 
    textColor ?? config.textColor, 
    fontSize ?? config.fontSize, 
    padding ?? config.padding, 
    borderRadius ?? config.borderRadius, 
    borderWidth ?? config.borderWidth,
    borderColor ?? config.borderColor,
    maxWidth ?? config.maxWidth, 
    visible, 
    config.enabled
  ]);

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

  // Set initial scale - config 변경 시 즉시 반영
  React.useEffect(() => {
    if (spriteRef.current && textureData) {
      const baseScale = config.scaleMultiplier;
      // 새로운 캔버스 비율로 설정 (512/256 = 2.0)
      const aspectRatio = 2.0;
      spriteRef.current.scale.set(baseScale * aspectRatio, baseScale, 1);
      
      // 이전 거리값 초기화하여 새 스케일이 즉시 적용되도록
      prevDistanceRef.current = 0;
    }
  }, [textureData, config.scaleMultiplier]);

    // Delta 기반 안정적인 스케일링 (미세진동 완전 제거)
  useFrame((state, delta) => {
    if (!spriteRef.current || !textureData || !visible) return;
    
    frameCountRef.current++;
    if (frameCountRef.current % 30 !== 0) return; // 30프레임마다 체크 (약 0.5초)
    
    try {
      const currentPosition = spriteRef.current.position;
      const distance = camera.position.distanceTo(currentPosition);
      
      // 매우 큰 거리 변화에만 반응 (미세진동 완전 방지)
      if (Math.abs(distance - prevDistanceRef.current) > 5.0) {
        const baseScale = config.scaleMultiplier;
        // 고정 스케일로 안정성 확보
        const scale = baseScale;
        
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