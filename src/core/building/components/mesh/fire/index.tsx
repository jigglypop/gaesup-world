import React, { FC, useEffect, useMemo, useRef } from 'react';

import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import fragmentShader from './frag.glsl';
import vertexShader from './vert.glsl';

const FireMaterial = shaderMaterial(
  { time: 0, intensity: 1.5 },
  vertexShader,
  fragmentShader,
);

extend({ FireMaterial });

type FireUniforms = { time: number; intensity: number };

interface FireProps {
  intensity?: number;
  width?: number;
  height?: number;
}

const Fire: FC<FireProps> = ({ intensity = 1.5, width = 1.0, height = 1.5 }) => {
  const materialRef = useRef<THREE.Material>(null!);
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(width, height),
    [width, height],
  );

  useFrame((state) => {
    const u = materialRef.current as unknown as FireUniforms;
    u.time = state.clock.elapsedTime * 1.5;
    u.intensity = intensity;
  });

  useEffect(() => () => { geometry.dispose(); }, [geometry]);

  return (
    <mesh geometry={geometry} position={[0, height / 2, 0]}>
      <fireMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default React.memo(Fire);
