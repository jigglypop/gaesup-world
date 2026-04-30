import React, { FC, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getToonGradient, getDefaultToonMode } from '@core/rendering/toon';
import { weightFromDistance } from '@core/utils/sfe';

import type { PlacedObject } from '../../../types';

export interface BillboardProps {
  text?: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  scale?: number;
  color?: string;
  elevation?: number;
  intensity?: number;
  toon?: boolean;
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
const _billboardDummy = new THREE.Object3D();
const DEFAULT_BILLBOARD_HEIGHT = 1.5;
const MIN_BILLBOARD_WIDTH = 1.0;
const MAX_BILLBOARD_WIDTH = 4.0;

function getTextureAspect(texture: THREE.Texture | null | undefined): number | null {
  const image = texture?.image as { width?: number; height?: number } | undefined;
  if (!image?.width || !image?.height) return null;
  return image.width / image.height;
}

function getBillboardSize(
  width: number | undefined,
  height: number | undefined,
  aspect: number | null,
): { width: number; height: number } {
  const resolvedHeight = height ?? DEFAULT_BILLBOARD_HEIGHT;
  const resolvedWidth = width && width > 0
    ? width
    : THREE.MathUtils.clamp(resolvedHeight * (aspect ?? 4 / 3), MIN_BILLBOARD_WIDTH, MAX_BILLBOARD_WIDTH);
  return { width: resolvedWidth, height: resolvedHeight };
}

function BillboardWithImage({
  imageUrl,
  width,
  height,
  scale,
  color,
  elevation,
  intensity,
  toon,
}: BillboardProps & { imageUrl: string }) {
  const mainRef = useRef<THREE.Mesh>(null!);
  const mainMatRef = useRef<THREE.MeshStandardMaterial | THREE.MeshToonMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const useToon = toon ?? getDefaultToonMode();
  const gradient = useToon ? getToonGradient(3) : null;

  const texture = useTexture(imageUrl);
  const aspect = getTextureAspect(texture);
  const baseSize = getBillboardSize(width, height, aspect);
  const resolvedScale = scale ?? 1;
  const w = baseSize.width * resolvedScale;
  const h = baseSize.height * resolvedScale;
  const emissiveColor = useMemo(
    () => new THREE.Color(color || '#00ff88'),
    [color],
  );
  const yOffset = elevation ?? 1;
  const brightness = intensity ?? 2;

  const mainGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const panelGeo = useMemo(() => new THREE.BoxGeometry(w * 1.08, h * 1.12, 0.08), [w, h]);
  const glowGeo = useMemo(
    () => new THREE.PlaneGeometry(w * 1.15, h * 1.15),
    [w, h],
  );

  useFrame((state) => {
    mainRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);
    const sfe = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    mainMatRef.current.emissiveIntensity = brightness * sfe;
    glowMatRef.current.opacity =
      (0.14 + brightness * 0.055 + 0.05 * Math.sin(state.clock.elapsedTime * 2)) * sfe;
  });

  useEffect(
    () => () => {
      mainGeo.dispose();
      panelGeo.dispose();
      glowGeo.dispose();
    },
    [mainGeo, panelGeo, glowGeo],
  );

  return (
    <group position={[0, h / 2 + yOffset, 0]}>
      <mesh geometry={panelGeo} position={[0, 0, -0.045]} castShadow receiveShadow>
        <meshStandardMaterial color="#07090b" roughness={0.68} metalness={0.18} />
      </mesh>
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
      <mesh ref={mainRef} geometry={mainGeo} position={[0, 0, 0.012]}>
        {gradient ? (
          <meshToonMaterial
            ref={mainMatRef as React.RefObject<THREE.MeshToonMaterial>}
            map={texture}
            emissive={emissiveColor}
            emissiveIntensity={brightness}
            gradientMap={gradient}
            side={THREE.DoubleSide}
            transparent
          />
        ) : (
          <meshStandardMaterial
            ref={mainMatRef as React.RefObject<THREE.MeshStandardMaterial>}
            map={texture}
            emissive={emissiveColor}
            emissiveIntensity={brightness}
            side={THREE.DoubleSide}
            transparent
          />
        )}
      </mesh>
    </group>
  );
}

function BillboardWithText({ text, width, height, scale, color, elevation, intensity, toon }: BillboardProps) {
  const mainRef = useRef<THREE.Mesh>(null!);
  const mainMatRef = useRef<THREE.MeshStandardMaterial | THREE.MeshToonMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const useToon = toon ?? getDefaultToonMode();
  const gradient = useToon ? getToonGradient(3) : null;

  const resolvedScale = scale ?? 1;
  const w = (width ?? 2.0) * resolvedScale;
  const h = (height ?? 1.5) * resolvedScale;
  const col = color || '#00ff88';
  const yOffset = elevation ?? 1;
  const brightness = intensity ?? 2;

  const texture = useMemo(
    () => createTextTexture(text || 'HELLO', w, h, col),
    [text, w, h, col],
  );
  const emissiveColor = useMemo(() => new THREE.Color(col), [col]);

  const mainGeo = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const panelGeo = useMemo(() => new THREE.BoxGeometry(w * 1.08, h * 1.12, 0.08), [w, h]);
  const glowGeo = useMemo(
    () => new THREE.PlaneGeometry(w * 1.15, h * 1.15),
    [w, h],
  );

  useFrame((state) => {
    mainRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);
    const sfe = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    mainMatRef.current.emissiveIntensity = brightness * sfe;
    glowMatRef.current.opacity =
      (0.14 + brightness * 0.055 + 0.05 * Math.sin(state.clock.elapsedTime * 2)) * sfe;
  });

  useEffect(
    () => () => {
      mainGeo.dispose();
      panelGeo.dispose();
      glowGeo.dispose();
      texture.dispose();
    },
    [mainGeo, panelGeo, glowGeo, texture],
  );

  return (
    <group position={[0, h / 2 + yOffset, 0]}>
      <mesh geometry={panelGeo} position={[0, 0, -0.045]} castShadow receiveShadow>
        <meshStandardMaterial color="#07090b" roughness={0.68} metalness={0.18} />
      </mesh>
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
      <mesh ref={mainRef} geometry={mainGeo} position={[0, 0, 0.012]}>
        {gradient ? (
          <meshToonMaterial
            ref={mainMatRef as React.RefObject<THREE.MeshToonMaterial>}
            map={texture}
            emissive={emissiveColor}
            emissiveIntensity={brightness}
            gradientMap={gradient}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            ref={mainMatRef as React.RefObject<THREE.MeshStandardMaterial>}
            map={texture}
            emissive={emissiveColor}
            emissiveIntensity={brightness}
            side={THREE.DoubleSide}
          />
        )}
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

type BillboardEntry = {
  key: string;
  text: string;
  imageUrl: string;
  color: string;
  width: number;
  height: number;
  scale: number;
  elevation: number;
  intensity: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
};

function BillboardBatchGroup({
  entries,
  texture,
  color,
  width,
  height,
}: {
  entries: BillboardEntry[];
  texture: THREE.Texture;
  color: string;
  width: number;
  height: number;
}) {
  const panelRef = useRef<THREE.InstancedMesh | null>(null);
  const mainRef = useRef<THREE.InstancedMesh | null>(null);
  const glowRef = useRef<THREE.InstancedMesh | null>(null);
  const mainMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const frameAccumRef = useRef(0);
  const count = entries.length;
  const capacity = Math.max(1, count);
  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);
  const mainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height);
    geo.translate(0, 0, 0.052);
    return geo;
  }, [height, width]);
  const panelGeo = useMemo(() => new THREE.BoxGeometry(width * 1.08, height * 1.12, 0.08), [height, width]);
  const glowGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width * 1.18, height * 1.18);
    geo.translate(0, 0, 0.046);
    return geo;
  }, [height, width]);
  const glowOpacity = useMemo(
    () => Math.min(0.72, 0.14 + Math.max(...entries.map((entry) => entry.intensity)) * 0.055),
    [entries],
  );
  const panelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#07090b', roughness: 0.68, metalness: 0.18 }),
    [],
  );

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const main = mainRef.current;
    const glow = glowRef.current;
    if (!panel || !main || !glow) return;

    panel.count = count;
    main.count = count;
    glow.count = count;
    for (let i = 0; i < count; i += 1) {
      const entry = entries[i];
      if (!entry) continue;
      _billboardDummy.position.set(entry.x, entry.y + height / 2 + entry.elevation, entry.z);
      _billboardDummy.rotation.set(0, entry.rotation, 0);
      _billboardDummy.updateMatrix();
      panel.setMatrixAt(i, _billboardDummy.matrix);
      main.setMatrixAt(i, _billboardDummy.matrix);
      glow.setMatrixAt(i, _billboardDummy.matrix);
    }
    panel.instanceMatrix.needsUpdate = true;
    main.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
    panel.computeBoundingSphere();
    main.computeBoundingSphere();
    glow.computeBoundingSphere();
  }, [count, entries, height]);

  useFrame((state, delta) => {
    frameAccumRef.current += Math.max(0, delta);
    if (frameAccumRef.current < 1 / 20) return;
    frameAccumRef.current = 0;
    const pulse = glowOpacity + 0.05 * Math.sin(state.clock.elapsedTime * 2);
    if (glowMatRef.current) glowMatRef.current.opacity = pulse;
  });

  useEffect(() => () => {
    mainGeo.dispose();
    panelGeo.dispose();
    glowGeo.dispose();
    panelMat.dispose();
  }, [glowGeo, mainGeo, panelGeo, panelMat]);

  if (count === 0) return null;
  return (
    <>
      <instancedMesh
        ref={panelRef}
        args={[panelGeo, panelMat, capacity]}
        castShadow
        receiveShadow
        frustumCulled
      />
      <instancedMesh ref={glowRef} args={[glowGeo, undefined, capacity]} frustumCulled>
        <meshBasicMaterial
          ref={glowMatRef}
          color={emissiveColor}
          transparent
          opacity={glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={mainRef} args={[mainGeo, undefined, capacity]} frustumCulled>
        <meshBasicMaterial
          ref={mainMatRef}
          map={texture}
          color={emissiveColor}
          side={THREE.DoubleSide}
          transparent
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
}

function BillboardBatchImageGroup({ entries }: { entries: BillboardEntry[] }) {
  const first = entries[0];
  const texture = useTexture(first?.imageUrl ?? '');
  const size = getBillboardSize(first?.width, first?.height, getTextureAspect(texture));
  if (!first) return null;
  return (
    <BillboardBatchGroup
      entries={entries}
      texture={texture}
      color={first.color}
      width={size.width}
      height={size.height}
    />
  );
}

function BillboardBatchTextGroup({ entries }: { entries: BillboardEntry[] }) {
  const first = entries[0];
  const texture = useMemo(
    () => createTextTexture(first?.text ?? 'HELLO', first?.width ?? 2, first?.height ?? 1.5, first?.color ?? '#00ff88'),
    [first?.color, first?.height, first?.text, first?.width],
  );

  useEffect(() => () => { texture.dispose(); }, [texture]);

  if (!first) return null;
  return (
    <BillboardBatchGroup
      entries={entries}
      texture={texture}
      color={first.color}
      width={first.width}
      height={first.height}
    />
  );
}

export const BillboardBatch = React.memo(function BillboardBatch({ billboards }: { billboards: PlacedObject[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, BillboardEntry[]>();
    for (const obj of billboards) {
      const scale = obj.config?.billboardScale ?? 1;
      const height = (obj.config?.billboardHeight ?? 1.5) * scale;
      const configuredWidth = obj.config?.billboardWidth;
      const color = obj.config?.billboardColor ?? '#00ff88';
      const imageUrl = obj.config?.billboardImageUrl ?? '';
      const text = obj.config?.billboardText ?? 'HELLO';
      const width = configuredWidth ? configuredWidth * scale : (imageUrl ? 0 : 2 * scale);
      const elevation = obj.config?.billboardElevation ?? 1;
      const intensity = obj.config?.billboardIntensity ?? 2;
      const key = imageUrl
        ? `img:${imageUrl}:${color}:${width}:${height}:${intensity}`
        : `txt:${text}:${color}:${width}:${height}:${intensity}`;
      const entry: BillboardEntry = {
        key,
        text,
        imageUrl,
        color,
        width,
        height,
        scale,
        elevation,
        intensity,
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        rotation: obj.rotation ?? 0,
      };
      const list = map.get(key);
      if (list) list.push(entry);
      else map.set(key, [entry]);
    }
    return Array.from(map.entries());
  }, [billboards]);

  if (groups.length === 0) return null;
  return (
    <>
      {groups.map(([key, entries]) => {
        const first = entries[0];
        if (!first) return null;
        return first.imageUrl
          ? <BillboardBatchImageGroup key={key} entries={entries} />
          : <BillboardBatchTextGroup key={key} entries={entries} />;
      })}
    </>
  );
});

export default React.memo(Billboard);
