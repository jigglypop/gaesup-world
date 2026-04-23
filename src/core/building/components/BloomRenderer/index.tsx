import React, { useMemo } from 'react';

import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

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

function BloomOrb({
  intensity = 2.5,
  color = '#00aaff',
}: {
  intensity?: number;
  color?: string;
}) {
  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);
  const glowOpacity = Math.min(0.55, 0.18 + intensity * 0.08);
  const glowScale = 1.1 + intensity * 0.18;
  const coreScale = 0.14 + intensity * 0.025;

  return (
    <group position={[0, 0.6, 0]}>
      <sprite scale={[glowScale, glowScale, 1]}>
        <spriteMaterial
          map={getBloomTexture()}
          color={emissiveColor}
          transparent
          opacity={glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <mesh scale={coreScale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={emissiveColor}
          transparent
          opacity={0.92}
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
          {...(isEditMode && onClick
            ? {
                onClick: (event: ThreeEvent<MouseEvent>) => {
                  event.stopPropagation();
                  onClick(b.id);
                },
              }
            : {})}
        >
          <BloomOrb intensity={b.intensity ?? 2.5} color={b.color ?? '#00aaff'} />
        </group>
      ))}
    </group>
  );
});
