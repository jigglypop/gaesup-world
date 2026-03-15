import { useEffect, useMemo } from 'react';

import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const noise2D = createNoise2D();

type SnowfieldProps = {
  size?: number;
};

function hash01(value: number): number {
  const x = Math.sin(value * 91.7 + 173.3) * 43758.5453123;
  return x - Math.floor(x);
}

function getSnowHeight(x: number, z: number, size: number): number {
  const safeSize = Math.max(size, 1);
  const driftA = Math.exp(-(((x + safeSize * 0.2) * (x + safeSize * 0.2) + (z - safeSize * 0.14) * (z - safeSize * 0.14)) / Math.max(safeSize * safeSize * 0.48, 1))) * 0.12;
  const driftB = Math.exp(-(((x - safeSize * 0.18) * (x - safeSize * 0.18) + (z + safeSize * 0.12) * (z + safeSize * 0.12)) / Math.max(safeSize * safeSize * 0.65, 1))) * 0.08;
  const baseNoise = noise2D(x / (safeSize * 0.7), z / (safeSize * 0.7)) * 0.06;
  const detailNoise = noise2D(x / (safeSize * 0.24) + 6.1, z / (safeSize * 0.24) - 3.7) * 0.018;
  return 0.05 + driftA + driftB + baseNoise + detailNoise;
}

export default function Snowfield({ size = 4 }: SnowfieldProps) {
  const [surfaceGeometry, sparkleGeometry] = useMemo(() => {
    const segments = Math.max(22, Math.round(size * 7));
    const surface = new THREE.PlaneGeometry(size, size, segments, segments);
    surface.rotateX(-Math.PI / 2);

    const positions = surface.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getSnowHeight(x, z, size);
      const tint = 0.5 + 0.5 * noise2D(x * 0.16 - 2.4, z * 0.16 + 7.2);

      positions.setY(i, y);
      color.setRGB(0.87 + tint * 0.06, 0.90 + tint * 0.05, 0.94 + tint * 0.04);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surface.computeVertexNormals();

    const sparkleCount = Math.max(28, Math.min(96, Math.round(size * size * 3)));
    const sparklePositions = new Float32Array(sparkleCount * 3);
    const sparkleColors = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      const x = hash01(i * 2.71 + 0.4) * size - size * 0.5;
      const z = hash01(i * 3.97 + 1.9) * size - size * 0.5;
      const lift = hash01(i * 5.41 + 2.2);
      const tint = hash01(i * 7.13 + 3.1);
      const y = getSnowHeight(x, z, size) + 0.016 + lift * 0.02;

      sparklePositions[i * 3] = x;
      sparklePositions[i * 3 + 1] = y;
      sparklePositions[i * 3 + 2] = z;

      color.setRGB(0.9 + tint * 0.08, 0.94 + tint * 0.05, 1.0);
      sparkleColors[i * 3] = color.r;
      sparkleColors[i * 3 + 1] = color.g;
      sparkleColors[i * 3 + 2] = color.b;
    }

    const sparkles = new THREE.BufferGeometry();
    sparkles.setAttribute('position', new THREE.Float32BufferAttribute(sparklePositions, 3));
    sparkles.setAttribute('color', new THREE.Float32BufferAttribute(sparkleColors, 3));

    return [surface, sparkles];
  }, [size]);

  useEffect(() => {
    return () => {
      surfaceGeometry.dispose();
      sparkleGeometry.dispose();
    };
  }, [sparkleGeometry, surfaceGeometry]);

  return (
    <group position={[0, 0.045, 0]}>
      <mesh geometry={surfaceGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.88}
          metalness={0.0}
          clearcoat={0.12}
          clearcoatRoughness={0.75}
        />
      </mesh>
      <points geometry={sparkleGeometry} frustumCulled={false}>
        <pointsMaterial
          size={Math.max(0.03, size * 0.01)}
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
