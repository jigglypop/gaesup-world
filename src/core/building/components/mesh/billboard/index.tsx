import React, { FC, useEffect, useMemo, useRef } from 'react';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { weightFromDistance } from '@core/utils/sfe';

export interface BillboardProps {
  text?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  color?: string;
}

function createTextTexture(
  text: string,
  w: number,
  h: number,
  color: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const pxW = 512;
  const pxH = Math.round(pxW * (h / w));
  canvas.width = pxW;
  canvas.height = pxH;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, pxW, pxH);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, pxW - 4, pxH - 4);

  ctx.fillStyle = color;
  const fontSize = Math.floor(pxH * 0.25);
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;
  const startY = pxH / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, pxW / 2, startY + i * lineHeight, pxW - 20);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// SFE near/far for emissive attenuation
const SFE_NEAR = 20;
const SFE_FAR = 100;
const SFE_STRENGTH = 3;

function BillboardWithImage({
  imageUrl,
  width,
  height,
  color,
}: BillboardProps & { imageUrl: string }) {
  const mainRef = useRef<THREE.Mesh>(null!);
  const mainMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const texture = useTexture(imageUrl);
  const w = width ?? 2.0;
  const h = height ?? 1.5;
  const emissiveColor = useMemo(
    () => new THREE.Color(color || '#00ff88'),
    [color],
  );

  const mainGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const glowGeo = useMemo(
    () => new THREE.PlaneGeometry(w * 1.15, h * 1.15),
    [w, h],
  );

  useFrame((state) => {
    mainRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);
    const sfe = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    mainMatRef.current.emissiveIntensity = 2.0 * sfe;
    glowMatRef.current.opacity =
      (0.2 + 0.05 * Math.sin(state.clock.elapsedTime * 2)) * sfe;
  });

  useEffect(
    () => () => {
      mainGeo.dispose();
      glowGeo.dispose();
    },
    [mainGeo, glowGeo],
  );

  return (
    <group position={[0, h / 2 + 1, 0]}>
      <mesh geometry={glowGeo} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          ref={glowMatRef}
          color={emissiveColor}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={mainRef} geometry={mainGeo}>
        <meshStandardMaterial
          ref={mainMatRef}
          map={texture}
          emissive={emissiveColor}
          emissiveIntensity={2.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function BillboardWithText({ text, width, height, color }: BillboardProps) {
  const mainRef = useRef<THREE.Mesh>(null!);
  const mainMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const w = width ?? 2.0;
  const h = height ?? 1.5;
  const col = color || '#00ff88';

  const texture = useMemo(
    () => createTextTexture(text || 'HELLO', w, h, col),
    [text, w, h, col],
  );
  const emissiveColor = useMemo(() => new THREE.Color(col), [col]);

  const mainGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const glowGeo = useMemo(
    () => new THREE.PlaneGeometry(w * 1.15, h * 1.15),
    [w, h],
  );

  useFrame((state) => {
    mainRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);
    const sfe = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    mainMatRef.current.emissiveIntensity = 2.0 * sfe;
    glowMatRef.current.opacity =
      (0.2 + 0.05 * Math.sin(state.clock.elapsedTime * 2)) * sfe;
  });

  useEffect(
    () => () => {
      mainGeo.dispose();
      glowGeo.dispose();
      texture.dispose();
    },
    [mainGeo, glowGeo, texture],
  );

  return (
    <group position={[0, h / 2 + 1, 0]}>
      <mesh geometry={glowGeo} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          ref={glowMatRef}
          color={emissiveColor}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={mainRef} geometry={mainGeo}>
        <meshStandardMaterial
          ref={mainMatRef}
          map={texture}
          emissive={emissiveColor}
          emissiveIntensity={2.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

const Billboard: FC<BillboardProps> = (props) => {
  if (props.imageUrl) {
    return <BillboardWithImage {...props} imageUrl={props.imageUrl} />;
  }
  return <BillboardWithText {...props} />;
};

export default React.memo(Billboard);
