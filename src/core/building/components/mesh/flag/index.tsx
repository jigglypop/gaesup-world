import { FC, useEffect, useRef } from "react";

import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

export const FlagMesh: FC<FlagMeshProps> = ({ geometry, pamplet_url, ...meshProps }) => {
  const materialRef = useRef<any>(null);

  const texture = useTexture(
    pamplet_url || `./image/main/aggjack.webp`,
    (loadedTexture) => {
      loadedTexture.flipY = false;
    }
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime * 5;
    }
  });

  // 컴포넌트 언마운트 시 리소스 해제
  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
      if (materialRef.current) materialRef.current.dispose();
    };
  }, [texture]);

  return (
    <mesh geometry={geometry} {...meshProps}>
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
