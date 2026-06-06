import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useAssetStore, type AssetRecord } from '../../../assets';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { DEFAULT_CHARACTER_ATTACHMENT_SOCKETS } from '../../attachments';
import { useCharacterStore } from '../../stores/characterStore';
import type { FaceStyle, HairStyle, OutfitSlot } from '../../types';

export type OutfitAvatarProps = {
  /**
   * Vertical offset from the player's RigidBody origin to the top of the head.
   * Tuned for the default character glb (~1.7m tall).
   */
  headHeight?: number;
  /** When false, the overlay simply does not render. */
  enabled?: boolean;
  /** Optional opacity to tone the overlay down (e.g. for first person). */
  opacity?: number;
};

type HairShape = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  scale: [number, number, number];
};

const isRenderableOutfitAsset = (asset: AssetRecord | undefined): boolean => {
  if (!asset?.url) return false;
  if (asset.metadata?.['placeholder'] === true) return false;
  return asset.kind === 'characterPart' || asset.kind === 'weapon';
};

function useHairShape(hair: HairStyle): HairShape {
  return useMemo(() => {
    switch (hair) {
      case 'long':
        return {
          geometry: new THREE.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05],
        };
      case 'cap':
        return {
          geometry: new THREE.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1],
        };
      case 'bun':
        return {
          geometry: new THREE.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1],
        };
      case 'spiky':
        return {
          geometry: new THREE.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1],
        };
      case 'short':
      default:
        return {
          geometry: new THREE.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1],
        };
    }
  }, [hair]);
}

export function OutfitAvatar({
  headHeight = 1.55,
  enabled = true,
  opacity = 1,
}: OutfitAvatarProps = {}) {
  const groupRef = useRef<THREE.Group>(null);
  const appearance = useCharacterStore((s) => s.appearance);
  const outfits = useCharacterStore((s) => s.outfits);
  const assetRecords = useAssetStore((s) => s.records);
  const { position, rotation } = usePlayerPosition({ updateInterval: 16 });

  const hairShape = useHairShape(appearance.hair);

  useEffect(() => {
    const geometry = hairShape.geometry;
    return () => {
      geometry.dispose();
    };
  }, [hairShape.geometry]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.set(position.x, position.y + headHeight, position.z);
    g.rotation.set(0, rotation.y, 0);
  });

  if (!enabled) return null;

  const shouldRenderFallback = (slot: OutfitSlot) => {
    const assetId = outfits[slot];
    if (!assetId) return false;
    return !isRenderableOutfitAsset(assetRecords[assetId]);
  };

  const hatEquipped = !!outfits.hat;
  const hatFallback = shouldRenderFallback('hat');
  const topFallback = shouldRenderFallback('top');
  const bottomFallback = shouldRenderFallback('bottom');
  const shoesFallback = shouldRenderFallback('shoes');
  const glassesFallback = shouldRenderFallback('glasses');
  const weaponFallback = shouldRenderFallback('weapon');
  const accessoryFallback = shouldRenderFallback('accessory');
  const baseOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
  const weaponSocket = DEFAULT_CHARACTER_ATTACHMENT_SOCKETS.weapon;
  const accessorySocket = DEFAULT_CHARACTER_ATTACHMENT_SOCKETS.accessory;

  return (
    <group ref={groupRef}>
      {!hatEquipped && (
        <mesh position={hairShape.position} scale={hairShape.scale} castShadow>
          <primitive object={hairShape.geometry} attach="geometry" />
          <meshStandardMaterial
            color={appearance.colors.hair}
            roughness={0.85}
            metalness={0.05}
            transparent={baseOpacity < 1}
            opacity={baseOpacity}
          />
        </mesh>
      )}

      {hatFallback && (
        <group position={[0, 0.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 18]} />
            <meshStandardMaterial
              color={appearance.colors.hat}
              roughness={0.7}
              metalness={0.05}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.04, 24]} />
            <meshStandardMaterial
              color={appearance.colors.hat}
              roughness={0.7}
              metalness={0.05}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
        </group>
      )}

      {topFallback && (
        <mesh position={[0, -0.58, 0]} scale={[0.72, 0.18, 0.18]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={appearance.colors.top}
            roughness={0.8}
            metalness={0.05}
            transparent={baseOpacity < 1}
            opacity={baseOpacity}
          />
        </mesh>
      )}

      {bottomFallback && (
        <mesh position={[0, -0.82, 0]} scale={[0.48, 0.14, 0.16]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={appearance.colors.bottom}
            roughness={0.85}
            metalness={0.04}
            transparent={baseOpacity < 1}
            opacity={baseOpacity}
          />
        </mesh>
      )}

      {shoesFallback && (
        <group position={[0, -1.12, 0.04]}>
          <mesh position={[-0.13, 0, 0]} scale={[0.17, 0.07, 0.28]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={appearance.colors.shoes}
              roughness={0.9}
              metalness={0.03}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
          <mesh position={[0.13, 0, 0]} scale={[0.17, 0.07, 0.28]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={appearance.colors.shoes}
              roughness={0.9}
              metalness={0.03}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
        </group>
      )}

      {weaponFallback && (
        <group position={weaponSocket.position} {...(weaponSocket.rotation ? { rotation: weaponSocket.rotation } : {})}>
          <mesh position={[0, 0.18, 0]} scale={[0.045, 0.48, 0.045]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#d7dde8"
              roughness={0.45}
              metalness={0.45}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
          <mesh position={[0, -0.12, 0]} scale={[0.12, 0.08, 0.08]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#5c4635"
              roughness={0.7}
              metalness={0.08}
              transparent={baseOpacity < 1}
              opacity={baseOpacity}
            />
          </mesh>
        </group>
      )}

      {accessoryFallback && (
        <mesh
          position={accessorySocket.position}
          {...(accessorySocket.rotation ? { rotation: accessorySocket.rotation } : {})}
          castShadow
        >
          <torusGeometry args={[0.08, 0.015, 8, 18]} />
          <meshStandardMaterial
            color="#f3d35f"
            roughness={0.42}
            metalness={0.55}
            transparent={baseOpacity < 1}
            opacity={baseOpacity}
          />
        </mesh>
      )}

      {glassesFallback && (
        <group position={[0, -0.08, 0.33]}>
          <mesh position={[-0.11, 0, 0]} scale={[0.09, 0.045, 0.018]}>
            <torusGeometry args={[1, 0.12, 8, 18]} />
            <meshStandardMaterial color="#172033" roughness={0.35} metalness={0.18} />
          </mesh>
          <mesh position={[0.11, 0, 0]} scale={[0.09, 0.045, 0.018]}>
            <torusGeometry args={[1, 0.12, 8, 18]} />
            <meshStandardMaterial color="#172033" roughness={0.35} metalness={0.18} />
          </mesh>
          <mesh scale={[0.08, 0.012, 0.012]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#172033" roughness={0.35} metalness={0.18} />
          </mesh>
        </group>
      )}

      {/*
        Face cue: a tiny cheek tint disc that floats just in front of the head
        so the player can see the chosen face style without needing a face rig.
        Kept intentionally subtle so it does not fight the underlying GLB.
      */}
      <FaceCue style={appearance.face} opacity={baseOpacity} />
    </group>
  );
}

function FaceCue({ style, opacity }: { style: FaceStyle; opacity: number }) {
  const tint = useMemo(() => {
    switch (style) {
      case 'smile':    return '#ff8aa0';
      case 'wink':     return '#ffb04a';
      case 'sleepy':   return '#7d8ec8';
      case 'surprised':return '#ffe066';
      default:         return '#ffb6a8';
    }
  }, [style]);

  return (
    <group position={[0, -0.18, 0.32]}>
      <mesh position={[-0.13, 0, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={tint} transparent opacity={opacity * 0.6} />
      </mesh>
      <mesh position={[0.13, 0, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={tint} transparent opacity={opacity * 0.6} />
      </mesh>
    </group>
  );
}
