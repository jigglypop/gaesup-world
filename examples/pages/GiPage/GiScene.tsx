import { useEffect, useMemo } from 'react';

import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { MeshStandardNodeMaterial } from 'three/webgpu';

import { GiVolume, hexToLinearRgb, useGi, type GiEnvironment } from 'gaesup-world';

import { FINE_BOUNDS, createGiSceneItems, toVoxelBoxes } from './scene';
import type { GiBinderProps, GiSceneItem, GiSceneProps } from './types';

const SUN_COLOR = '#fff2d9';
const SUN_INTENSITY = 3;
const SUN_DISTANCE = 40;
const SHADOW_EXTENT = 22;
const SHADOW_MAP_SIZE = 2048;
const AMBIENT_WITHOUT_GI = 0.5;
const CAMERA_TARGET: [number, number, number] = [0, 3, 0];
const DEG_TO_RAD = Math.PI / 180;

function materialKey(item: GiSceneItem): string {
  return `${item.color}|${item.emissive?.join(',') ?? ''}`;
}

function sunVector(azimuth: number, elevation: number): [number, number, number] {
  const a = azimuth * DEG_TO_RAD;
  const e = elevation * DEG_TO_RAD;
  return [Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)];
}

function GiBinder({ lit, enabled, strength }: GiBinderProps) {
  const gi = useGi();
  useEffect(() => {
    if (!gi) return;
    lit.forEach((material) => gi.applyToMaterial(material));
  }, [gi, lit]);
  useEffect(() => {
    gi?.setIntensity(enabled ? strength : 0);
  }, [gi, enabled, strength]);
  return null;
}

export function GiScene({ controls }: GiSceneProps) {
  const { giEnabled, giStrength, azimuth, elevation, roof } = controls;
  const items = useMemo(() => createGiSceneItems(roof), [roof]);
  const boxes = useMemo(() => toVoxelBoxes(items), [items]);
  const sun = useMemo(() => sunVector(azimuth, elevation), [azimuth, elevation]);
  const environment = useMemo<GiEnvironment>(() => {
    const [r, g, b] = hexToLinearRgb(SUN_COLOR);
    return {
      sunDirection: { x: sun[0], y: sun[1], z: sun[2] },
      sunIrradiance: [r * SUN_INTENSITY, g * SUN_INTENSITY, b * SUN_INTENSITY],
      skyZenith: [0.35, 0.55, 0.95],
      skyHorizon: [0.75, 0.8, 0.85],
      skyGround: [0.18, 0.16, 0.14],
    };
  }, [sun]);

  const { materials, lit } = useMemo(() => {
    const map = new Map<string, MeshStandardNodeMaterial>();
    const shaded: MeshStandardNodeMaterial[] = [];
    for (const item of items) {
      const key = materialKey(item);
      if (map.has(key)) continue;
      const material = new MeshStandardNodeMaterial({
        color: item.color,
        roughness: 0.92,
        metalness: 0,
      });
      if (item.emissive) {
        const peak = Math.max(...item.emissive);
        const [r, g, b] = item.emissive;
        material.emissive = new THREE.Color(r / peak, g / peak, b / peak);
        material.emissiveIntensity = peak;
      } else {
        shaded.push(material);
      }
      map.set(key, material);
    }
    return { materials: map, lit: shaded };
  }, [items]);
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  return (
    <>
      <color attach="background" args={['#a9c9ec']} />
      <ambientLight intensity={giEnabled ? 0 : AMBIENT_WITHOUT_GI} />
      <directionalLight
        color={SUN_COLOR}
        intensity={SUN_INTENSITY}
        position={[sun[0] * SUN_DISTANCE, sun[1] * SUN_DISTANCE, sun[2] * SUN_DISTANCE]}
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={SUN_DISTANCE * 2}
      />
      <GiVolume boxes={boxes} environment={environment} fineBounds={FINE_BOUNDS}>
        <GiBinder lit={lit} enabled={giEnabled} strength={giStrength} />
        {items.map((item, index) => {
          const size = item.max.map((value, axis) => value - (item.min[axis] ?? 0));
          const center = item.max.map((value, axis) => (value + (item.min[axis] ?? 0)) / 2);
          const material = materials.get(materialKey(item));
          return (
            <mesh
              key={index}
              position={center as [number, number, number]}
              {...(material ? { material } : {})}
              castShadow
              receiveShadow
            >
              <boxGeometry args={size as [number, number, number]} />
            </mesh>
          );
        })}
      </GiVolume>
      <OrbitControls target={CAMERA_TARGET} />
    </>
  );
}
