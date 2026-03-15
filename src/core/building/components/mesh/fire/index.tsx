import React, { FC, useEffect, useMemo, useRef } from 'react';

import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import fragmentShader from './frag.glsl';
import vertexShader from './vert.glsl';

const FireMaterial = shaderMaterial(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1 },
  vertexShader,
  fragmentShader,
);

extend({ FireMaterial });

type FireUniforms = {
  time: number;
  intensity: number;
  seed: number;
  lean: number;
  flare: number;
};

interface FireProps {
  intensity?: number;
  width?: number;
  height?: number;
}

const Fire: FC<FireProps> = ({ intensity = 1.5, width = 1.0, height = 1.5 }) => {
  const mainMaterialRef = useRef<THREE.Material>(null!);
  const leftMaterialRef = useRef<THREE.Material>(null!);
  const rightMaterialRef = useRef<THREE.Material>(null!);
  const backMaterialRef = useRef<THREE.Material>(null!);
  const mainGeometry = useMemo(
    () => new THREE.PlaneGeometry(width * 0.72, height),
    [width, height],
  );
  const leftGeometry = useMemo(
    () => new THREE.PlaneGeometry(width * 0.5, height * 0.82),
    [width, height],
  );
  const rightGeometry = useMemo(
    () => new THREE.PlaneGeometry(width * 0.38, height * 0.66),
    [width, height],
  );
  const backGeometry = useMemo(
    () => new THREE.PlaneGeometry(width * 0.62, height * 0.9),
    [width, height],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const updateLayer = (
      material: THREE.Material | null,
      time: number,
      layerIntensity: number,
      seed: number,
      lean: number,
      flare: number,
    ) => {
      if (!material) return;
      const u = material as unknown as FireUniforms;
      u.time = time;
      u.intensity = layerIntensity;
      u.seed = seed;
      u.lean = lean;
      u.flare = flare;
    };

    updateLayer(mainMaterialRef.current, t * 1.45, intensity, 0.17, 0.08, 1.0);
    updateLayer(leftMaterialRef.current, t * 1.95 + 1.7, intensity * 0.8, 1.31, -0.24, 0.82);
    updateLayer(rightMaterialRef.current, t * 2.25 + 3.4, intensity * 0.7, 2.63, 0.19, 0.72);
    updateLayer(backMaterialRef.current, t * 1.62 + 0.9, intensity * 0.62, 3.97, 0.04, 1.16);
  });

  useEffect(() => {
    return () => {
      mainGeometry.dispose();
      leftGeometry.dispose();
      rightGeometry.dispose();
      backGeometry.dispose();
      mainMaterialRef.current?.dispose();
      leftMaterialRef.current?.dispose();
      rightMaterialRef.current?.dispose();
      backMaterialRef.current?.dispose();
    };
  }, [backGeometry, leftGeometry, mainGeometry, rightGeometry]);

  return (
    <group>
      <mesh geometry={backGeometry} position={[0.03, height * 0.46, -0.08]}>
        <fireMaterial
          ref={backMaterialRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh geometry={mainGeometry} position={[0, height * 0.5, 0]}>
        <fireMaterial
          ref={mainMaterialRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh geometry={leftGeometry} position={[-width * 0.14, height * 0.42, -0.03]}>
        <fireMaterial
          ref={leftMaterialRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh geometry={rightGeometry} position={[width * 0.16, height * 0.35, 0.05]}>
        <fireMaterial
          ref={rightMaterialRef}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, height * 0.1, 0]} scale={[width * 0.16, height * 0.08, width * 0.16]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ff8a2a" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, height * 0.08, 0]} scale={[width * 0.24, height * 0.06, width * 0.24]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#ffcf7a" transparent opacity={0.22} />
      </mesh>
    </group>
  );
};

export default React.memo(Fire);
