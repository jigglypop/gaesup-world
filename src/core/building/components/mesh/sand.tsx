import { useEffect, useMemo } from 'react';

import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const noise2D = createNoise2D();

type SandProps = {
  size?: number;
};

function hash01(value: number): number {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function getSandHeight(x: number, z: number, size: number): number {
  const safeSize = Math.max(size, 1);
  const duneA = noise2D(x / (safeSize * 0.8), z / (safeSize * 0.8)) * 0.07;
  const duneB = noise2D(x / (safeSize * 0.32) + 8.3, z / (safeSize * 0.42) - 5.4) * 0.025;
  const ripple = Math.sin(x * 1.35 + z * 0.42) * 0.01;
  const moundA = Math.exp(-(((x + safeSize * 0.18) * (x + safeSize * 0.18) + (z - safeSize * 0.08) * (z - safeSize * 0.08)) / Math.max(safeSize * safeSize * 0.55, 1))) * 0.09;
  const moundB = Math.exp(-(((x - safeSize * 0.24) * (x - safeSize * 0.24) + (z + safeSize * 0.16) * (z + safeSize * 0.16)) / Math.max(safeSize * safeSize * 0.7, 1))) * 0.05;
  return 0.025 + duneA + duneB + ripple + moundA + moundB;
}

export default function Sand({ size = 4 }: SandProps) {
  const [surfaceGeometry, grainGeometry] = useMemo(() => {
    const segments = Math.max(20, Math.round(size * 6));
    const surface = new THREE.PlaneGeometry(size, size, segments, segments);
    surface.rotateX(-Math.PI / 2);

    const positions = surface.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getSandHeight(x, z, size);
      const tint = 0.5 + 0.5 * noise2D(x * 0.22 + 5.1, z * 0.22 - 3.6);

      positions.setY(i, y);
      color.setRGB(0.72 + tint * 0.09, 0.61 + tint * 0.07, 0.40 + tint * 0.05);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surface.computeVertexNormals();

    const grainCount = Math.max(90, Math.min(240, Math.round(size * size * 10)));
    const grainPositions = new Float32Array(grainCount * 3);
    const grainColors = new Float32Array(grainCount * 3);

    for (let i = 0; i < grainCount; i++) {
      const x = hash01(i * 3.13 + 0.2) * size - size * 0.5;
      const z = hash01(i * 4.71 + 1.4) * size - size * 0.5;
      const lift = hash01(i * 5.93 + 2.8);
      const tint = hash01(i * 2.37 + 0.9);
      const y = getSandHeight(x, z, size) + 0.01 + lift * 0.015;

      grainPositions[i * 3] = x;
      grainPositions[i * 3 + 1] = y;
      grainPositions[i * 3 + 2] = z;

      color.setRGB(0.76 + tint * 0.08, 0.68 + tint * 0.05, 0.48 + tint * 0.04);
      grainColors[i * 3] = color.r;
      grainColors[i * 3 + 1] = color.g;
      grainColors[i * 3 + 2] = color.b;
    }

    const grains = new THREE.BufferGeometry();
    grains.setAttribute('position', new THREE.Float32BufferAttribute(grainPositions, 3));
    grains.setAttribute('color', new THREE.Float32BufferAttribute(grainColors, 3));

    return [surface, grains];
  }, [size]);

  useEffect(() => {
    return () => {
      surfaceGeometry.dispose();
      grainGeometry.dispose();
    };
  }, [grainGeometry, surfaceGeometry]);

  return (
    <group position={[0, 0.04, 0]}>
      <mesh geometry={surfaceGeometry} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} metalness={0.02} />
      </mesh>
      <points geometry={grainGeometry} frustumCulled={false}>
        <pointsMaterial
          size={Math.max(0.02, size * 0.008)}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
