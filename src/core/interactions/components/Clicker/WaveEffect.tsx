import React, { memo, useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaveEffectProps {
  active?: boolean;
  color?: string;
  intensity?: number;
}

export const WaveEffect = memo(({ 
  active = true, 
  color = "#00ff88", 
  intensity = 0.5 
}: WaveEffectProps) => {
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const materialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  // Fixed ring pool: avoid per-render mesh/material/geometry churn.
  const waveStartsRef = useRef<number[]>([]);
  const lastWaveTime = useRef<number>(0);
  const nextWaveIndex = useRef<number>(0);
  
  // 파동 생성 간격 (초)
  const WAVE_INTERVAL = 0.8;
  // 파동 지속 시간 (초)
  const WAVE_DURATION = 2.0;
  // 최대 파동 개수
  const MAX_WAVES = 3;
  
  if (meshRefs.current.length !== MAX_WAVES) {
    meshRefs.current = Array.from({ length: MAX_WAVES }, () => null);
  }
  if (materialRefs.current.length !== MAX_WAVES) {
    materialRefs.current = Array.from({ length: MAX_WAVES }, () => null);
  }
  if (waveStartsRef.current.length !== MAX_WAVES) {
    waveStartsRef.current = Array.from({ length: MAX_WAVES }, () => Number.NEGATIVE_INFINITY);
  }

  const ringGeometry = useMemo(() => new THREE.RingGeometry(0.8, 1.0, 32), []);
  useEffect(() => {
    return () => {
      ringGeometry.dispose();
    };
  }, [ringGeometry]);

  // Update base material colors when props change.
  useEffect(() => {
    for (let i = 0; i < MAX_WAVES; i++) {
      const mat = materialRefs.current[i];
      if (!mat) continue;
      mat.color.set(color);
      mat.emissive.set(color);
      mat.needsUpdate = true;
    }
  }, [color]);

  // When disabled, hide all pooled waves.
  useEffect(() => {
    if (active) return;
    lastWaveTime.current = 0;
    nextWaveIndex.current = 0;
    waveStartsRef.current.fill(Number.NEGATIVE_INFINITY);
    for (let i = 0; i < MAX_WAVES; i++) {
      const mesh = meshRefs.current[i];
      if (mesh) mesh.visible = false;
    }
  }, [active]);

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime;

    if (active) {
      // Create a new wave at a fixed cadence.
      if (currentTime - lastWaveTime.current >= WAVE_INTERVAL) {
        const idx = nextWaveIndex.current;
        waveStartsRef.current[idx] = currentTime;
        nextWaveIndex.current = (idx + 1) % MAX_WAVES;
        lastWaveTime.current = currentTime;
      }
    }

    // Update pooled meshes in-place.
    for (let i = 0; i < MAX_WAVES; i++) {
      const mesh = meshRefs.current[i];
      const mat = materialRefs.current[i];
      if (!mesh || !mat) continue;

      const start = waveStartsRef.current[i];
      if (start === undefined) {
        mesh.visible = false;
        continue;
      }
      const elapsed = currentTime - start;
      if (!active || !Number.isFinite(start) || elapsed >= WAVE_DURATION || elapsed < 0) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;

      const progress = elapsed / WAVE_DURATION;
      const scale = progress * 2;
      const opacity = Math.max(0, 1 - progress);

      mesh.scale.set(scale, scale, 1);
      mat.opacity = opacity * 0.6;
      mat.emissiveIntensity = intensity * opacity;
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_WAVES }, (_, index) => (
        <mesh
          // Stable pool keys; wave lifecycle is driven in the frame loop.
          key={`wave-${index}`}
          ref={(el) => {
            meshRefs.current[index] = el;
          }}
          geometry={ringGeometry}
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <meshStandardMaterial
            ref={(mat) => {
              materialRefs.current[index] = mat;
            }}
            color={color}
            emissive={color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
});

WaveEffect.displayName = 'WaveEffect';