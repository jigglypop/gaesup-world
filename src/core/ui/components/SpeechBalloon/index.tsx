import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { SpeechBalloonProps } from './types';
import './styles.css';

const DEFAULT_FONT_SIZE = 48;
const DEFAULT_PADDING = 20;
const DEFAULT_BORDER_RADIUS = 15;
const DEFAULT_MAX_WIDTH = 300;

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

function createTextTexture({
  text,
  backgroundColor = 'rgba(0, 0, 0, 0.8)',
  textColor = 'white',
  fontSize = DEFAULT_FONT_SIZE,
  padding = DEFAULT_PADDING,
  borderRadius = DEFAULT_BORDER_RADIUS,
  maxWidth = DEFAULT_MAX_WIDTH,
}: {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  borderRadius?: number;
  maxWidth?: number;
}) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = context.measureText(testLine);
    
    if (metrics.width > maxWidth - padding * 2 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = fontSize * 1.2;
  const textHeight = lines.length * lineHeight;
  
  let maxLineWidth = 0;
  lines.forEach(line => {
    const metrics = context.measureText(line);
    maxLineWidth = Math.max(maxLineWidth, metrics.width);
  });

  canvas.width = maxLineWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  context.fillStyle = backgroundColor;
  createRoundedRect(context, 0, 0, canvas.width, canvas.height, borderRadius);
  context.fill();

  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  lines.forEach((line, index) => {
    const y = padding + (index + 0.5) * lineHeight;
    context.fillText(line, canvas.width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return {
    texture,
    width: canvas.width,
    height: canvas.height,
  };
}

export function SpeechBalloon({
  text,
  position = new THREE.Vector3(0, 2, 0),
  offset = new THREE.Vector3(0, 1, 0),
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
  const spriteRef = useRef<THREE.Sprite>(null);
  const { camera } = useThree();

  const textureData = useMemo(() => {
    if (!text) return null;
    return createTextTexture({
      text,
      backgroundColor,
      textColor,
      fontSize,
      padding,
      borderRadius,
      maxWidth,
    });
  }, [text, backgroundColor, textColor, fontSize, padding, borderRadius, maxWidth]);

  const spriteMaterial = useMemo(() => {
    if (!textureData) return null;
    return new THREE.SpriteMaterial({
      map: textureData.texture,
      transparent: true,
      opacity,
      depthTest: false,
      depthWrite: false,
    });
  }, [textureData, opacity]);

  useEffect(() => {
    if (spriteRef.current && textureData) {
      const distance = camera.position.distanceTo(position);
      const scale = distance * 0.01;
      const aspectRatio = textureData.width / textureData.height;
      spriteRef.current.scale.set(scale * aspectRatio, scale, 1);
    }
  });

  useEffect(() => {
    return () => {
      textureData?.texture.dispose();
      spriteMaterial?.dispose();
    };
  }, [textureData, spriteMaterial]);

  if (!visible || !textureData || !spriteMaterial) return null;

  const finalPosition = position.clone().add(offset);

  return (
    <group className="speech-balloon">
      <sprite
        ref={spriteRef}
        position={finalPosition}
        material={spriteMaterial}
        renderOrder={999}
      />
      {children}
    </group>
  );
}

export default SpeechBalloon; 