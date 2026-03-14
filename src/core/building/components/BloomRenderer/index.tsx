import React, { useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { weightFromDistance } from '@core/utils/sfe';
import { BloomConfig } from '../../types';

let _bloomTex: THREE.Texture | null = null;
function getBloomTexture(): THREE.Texture {
  if (_bloomTex) return _bloomTex;
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  _bloomTex = new THREE.CanvasTexture(c);
  _bloomTex.needsUpdate = true;
  return _bloomTex;
}

const SFE_NEAR = 20;
const SFE_FAR = 140;
const SFE_STRENGTH = 3;

function BloomOrb({
  intensity = 2.5,
  color = '#00aaff',
}: {
  intensity?: number;
  color?: string;
}) {
  const orbRef = useRef<THREE.Mesh>(null!);
  const orbMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const glowMatRef = useRef<THREE.SpriteMaterial>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    orbRef.current.getWorldPosition(worldPos);
    const dist = state.camera.position.distanceTo(worldPos);
    const sfe = weightFromDistance(dist, SFE_NEAR, SFE_FAR, SFE_STRENGTH);
    const pulse = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 3.0);
    orbMatRef.current.emissiveIntensity = intensity * sfe;
    glowMatRef.current.opacity = Math.min(0.8, (0.28 * pulse) * sfe);
  });

  return (
    <group position={[0, 0.6, 0]}>
      <sprite scale={[1.6, 1.6, 1]}>
        <spriteMaterial
          ref={glowMatRef}
          map={getBloomTexture()}
          color={emissiveColor}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <mesh ref={orbRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          ref={orbMatRef}
          color="#111111"
          emissive={emissiveColor}
          emissiveIntensity={intensity}
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

interface Props {
  blooms: BloomConfig[];
  isEditMode: boolean;
  onClick?: (id: string) => void;
}

export const BloomRenderer = React.memo(function BloomRenderer({
  blooms,
  isEditMode,
  onClick,
}: Props) {
  if (blooms.length === 0) return null;

  return (
    <group name="bloom-system">
      {blooms.map((b) => (
        <group
          key={b.id}
          position={[b.position.x, b.position.y, b.position.z]}
          {...(isEditMode && onClick ? { onClick: (e: any) => { e.stopPropagation(); onClick(b.id); } } : {})}
        >
          <BloomOrb intensity={b.intensity ?? 2.5} color={b.color ?? '#00aaff'} />
        </group>
      ))}
    </group>
  );
});
