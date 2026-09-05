import React, { useLayoutEffect, useMemo, useRef } from 'react';

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

const BLOOM_GLOW_VERT = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldCenter = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec2 p = position.xy;
  vec3 worldPos = worldCenter.xyz + right * p.x + up * p.y;
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}
`;

const BLOOM_GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float d = dot(p, p);
  float glow = smoothstep(1.0, 0.0, d);
  glow *= glow;
  if (glow < 0.01) discard;
  gl_FragColor = vec4(uColor, glow * uOpacity);
}
`;

type BloomBatchGroupEntry = {
  x: number;
  y: number;
  z: number;
  intensity: number;
};

function BloomBatchGroup({ entries, color }: { entries: BloomBatchGroupEntry[]; color: string }) {
  const glowRef = useRef<THREE.InstancedMesh | null>(null);
  const coreRef = useRef<THREE.InstancedMesh | null>(null);
  const count = entries.length;
  const capacity = Math.max(1, count);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const coreMat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
    }),
    [color],
  );
  const glowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BLOOM_GLOW_VERT,
        fragmentShader: BLOOM_GLOW_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: 0.58 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color],
  );

  useLayoutEffect(() => {
    const glow = glowRef.current;
    const core = coreRef.current;
    if (!glow || !core) return;
    glow.count = count;
    core.count = count;
    for (let i = 0; i < count; i += 1) {
      const entry = entries[i];
      if (!entry) continue;
      const glowScale = 1.1 + entry.intensity * 0.18;
      dummy.position.set(entry.x, entry.y + 0.6, entry.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(glowScale, glowScale, 1);
      dummy.updateMatrix();
      glow.setMatrixAt(i, dummy.matrix);

      const coreScale = 0.14 + entry.intensity * 0.025;
      dummy.scale.set(coreScale, coreScale, coreScale);
      dummy.updateMatrix();
      core.setMatrixAt(i, dummy.matrix);
    }
    glow.instanceMatrix.needsUpdate = true;
    core.instanceMatrix.needsUpdate = true;
    glow.computeBoundingSphere();
    core.computeBoundingSphere();
  }, [count, dummy, entries]);

  useLayoutEffect(() => () => {
    glowGeo.dispose();
    coreGeo.dispose();
    glowMat.dispose();
    coreMat.dispose();
  }, [coreGeo, coreMat, glowGeo, glowMat]);

  if (count === 0) return null;
  return (
    <>
      <instancedMesh ref={glowRef} args={[glowGeo, glowMat, capacity]} frustumCulled />
      <instancedMesh ref={coreRef} args={[coreGeo, coreMat, capacity]} frustumCulled />
    </>
  );
}

function BloomBatch({ blooms }: { blooms: BloomConfig[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, BloomBatchGroupEntry[]>();
    for (const bloom of blooms) {
      const color = bloom.color ?? '#00aaff';
      const list = map.get(color);
      const entry = {
        x: bloom.position.x,
        y: bloom.position.y,
        z: bloom.position.z,
        intensity: bloom.intensity ?? 2.5,
      };
      if (list) list.push(entry);
      else map.set(color, [entry]);
    }
    return Array.from(map.entries());
  }, [blooms]);

  return (
    <>
      {groups.map(([color, entries]) => (
        <BloomBatchGroup key={color} color={color} entries={entries} />
      ))}
    </>
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

  if (!isEditMode) {
    return (
      <group name="bloom-system">
        <BloomBatch blooms={blooms} />
      </group>
    );
  }

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
