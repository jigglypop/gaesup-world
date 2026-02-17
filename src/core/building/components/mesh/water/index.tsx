import { useEffect, useMemo, useRef } from "react";

import { useTexture } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";

import { weightFromDistance } from "@core/utils/sfe";

extend({ Water });

type WaterProps = {
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  center?: [number, number, number];
};

export default function Ocean({ lod, center }: WaterProps) {
  const waterRef = useRef<Water | null>(null);
  const waterNormals = useTexture("/resources/waternormals.jpeg");
  const centerRef = useRef(new THREE.Vector3());
  const lastVisibleRef = useRef<boolean>(true);
  const lodCheckAccumRef = useRef<number>(0);
  
  useEffect(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
      waterNormals.repeat.set(4, 4);
    }
  }, [waterNormals]);

  useEffect(() => {
    if (center) {
      centerRef.current.set(center[0], center[1], center[2]);
    }
  }, [center]);
  
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0.1, 0.7, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }),
    [waterNormals]
  );
  
  const geom = useMemo(() => new THREE.PlaneGeometry(16, 16), []);
  useEffect(() => {
    return () => {
      geom.dispose();
      const water = waterRef.current as unknown as {
        material?: THREE.Material;
        dispose?: () => void;
      } | null;
      // Water (three-stdlib) may own internal GPU resources; clean up defensively.
      water?.material?.dispose?.();
      if (typeof water?.dispose === 'function') {
        water.dispose();
      }
    };
  }, [geom]);
  
  useFrame((state, delta) => {
    const water = waterRef.current;
    if (!water) return;

    if (lod) {
      lodCheckAccumRef.current += Math.max(0, delta);
      const checkInterval = lastVisibleRef.current ? 0.2 : 0.5;
      if (lodCheckAccumRef.current >= checkInterval) {
        lodCheckAccumRef.current = 0;

        const near = lod.near ?? 30;
        const far = lod.far ?? 180;
        const strength = lod.strength ?? 4;
        const dist = state.camera.position.distanceTo(centerRef.current);
        const w = weightFromDistance(dist, near, far, strength);
        const visible = w > 0;
        if (visible !== lastVisibleRef.current) {
          lastVisibleRef.current = visible;
          water.visible = visible;
        }
      }

      if (!lastVisibleRef.current) return;

    }

    const time = water.material.uniforms?.["time"];
    if (time) time.value += delta * 0.3;
  });

  return (
    <water
      ref={waterRef}
      args={[geom, config]}
      rotation-x={-Math.PI / 2}
      position={[0, 0.1, 0]}
    />
  );
}
