import { FC, useEffect, useRef } from "react";

import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { weightFromDistance } from "@core/utils/sfe";

import fragmentShader from "./frag.glsl";
import { FlagMeshProps } from "./type";
import vertexShader from "./vert.glsl";

const FlagMaterial = shaderMaterial(
  {
    map: null as THREE.Texture | null,
    time: 0,
    transmission: 0.99,
    roughness: 0.8,
    envMapIntensity: 1,
  },
  vertexShader,
  fragmentShader
);

extend({ FlagMaterial });

export const FlagMesh: FC<FlagMeshProps> = ({ geometry, pamplet_url, lod, center, ...meshProps }) => {
  const materialRef = useRef<THREE.Material>(null!);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const centerRef = useRef(new THREE.Vector3());
  const lastVisibleRef = useRef<boolean>(true);
  const lodCheckAccumRef = useRef<number>(0);

  const texture = useTexture(
    pamplet_url || `./image/main/aggjack.webp`,
    (loadedTexture) => {
      loadedTexture.flipY = false;
    }
  );

  useEffect(() => {
    if (center) {
      centerRef.current.set(center[0], center[1], center[2]);
    }
  }, [center]);

  useFrame((state, delta) => {
    if (lod) {
      const near = lod.near ?? 30;
      const far = lod.far ?? 180;
      const strength = lod.strength ?? 4;

      lodCheckAccumRef.current += Math.max(0, delta);
      const checkInterval = lastVisibleRef.current ? 0.2 : 0.5;
      if (lodCheckAccumRef.current >= checkInterval) {
        lodCheckAccumRef.current = 0;

        if (!center && meshRef.current) {
          meshRef.current.getWorldPosition(centerRef.current);
        }

        const dist = state.camera.position.distanceTo(centerRef.current);
        const w = weightFromDistance(dist, near, far, strength);
        const visible = w > 0;
        if (visible !== lastVisibleRef.current) {
          lastVisibleRef.current = visible;
          if (meshRef.current) meshRef.current.visible = visible;
        }
      }

      if (!lastVisibleRef.current) return;
    }

    const material = materialRef.current as unknown as { time: number };
    material.time = state.clock.elapsedTime * 5;
  });

  // 컴포넌트 언마운트 시 리소스 해제
  useEffect(() => {
    return () => {
      if (materialRef.current) materialRef.current.dispose();
    };
  }, [texture]);

  return (
    <mesh ref={meshRef} geometry={geometry} {...meshProps}>
      <flagMaterial
        ref={materialRef}
        map={texture}
        transmission={0.1}
        roughness={0.8}
        envMapIntensity={1}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
};
