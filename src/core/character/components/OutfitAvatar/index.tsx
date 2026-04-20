import { useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useCharacterStore } from '../../stores/characterStore';
import type { HairStyle } from '../../types';

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
  const { position, rotation } = usePlayerPosition({ updateInterval: 16 });

  const hairShape = useHairShape(appearance.hair);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.set(position.x, position.y + headHeight, position.z);
    g.rotation.set(0, rotation.y, 0);
  });

  if (!enabled) return null;

  const hatEquipped = !!outfits.hat;
  const baseOpacity = THREE.MathUtils.clamp(opacity, 0, 1);

  return (
    <group ref={groupRef} dispose={null}>
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

      {hatEquipped && (
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

      {/*
        Face cue: a tiny cheek tint disc that floats just in front of the head
        so the player can see the chosen face style without needing a face rig.
        Kept intentionally subtle so it does not fight the underlying GLB.
      */}
      <FaceCue style={appearance.face} opacity={baseOpacity} />
    </group>
  );
}

function FaceCue({ style, opacity }: { style: string; opacity: number }) {
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
