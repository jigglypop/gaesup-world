"use client";

import { CameraControls, Environment, SoftShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { zoomAtom } from "@store/zoom/atom";
import { rotate } from "@styles/keyframes/keyframes.css";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useRef } from "react";
import { Group } from "three";

export const keyBoardMap = [
  { name: "space", keys: ["Space"], label: "점프" },
  { name: "keyD", keys: ["KeyD"], label: "인사" },
];
function Light() {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    if (ref.current && ref.current.rotation)
      easing.dampE(
        ref.current.rotation,
        [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
        0.2,
        delta
      );
  });
  return (
    <group ref={ref}>
      <directionalLight
        position={[50, 50, -150]}
        castShadow
        intensity={1.5}
        shadow-mapSize={4096}
        shadow-bias={-0.0001}>
        <orthographicCamera
          attach="shadow-camera"
          args={[-170, 170, 170, -170, 0.1, 400]}
        />
      </directionalLight>
    </group>
  );
}
export default function EnvironmentOuter() {
  const ref = useRef<CameraControls>(null);
  const [zooms] = useAtom(zoomAtom);
  useEffect(() => {
    if (ref.current) {
      ref.current.zoomTo(zooms.zoom, true);
      ref.current.maxDistance = 25;
    }
  }, [zooms, rotate]);

  return (
    <>
      <SoftShadows
        size={24}
        samples={8}
        focus={0.5}
      />
      <color
        attach="background"
        args={["#d0d0d0"]}
      />

      <Environment
        background
        files={["image/back.hdr"]}
        backgroundBlurriness={1}
        backgroundIntensity={0.1}
      />

      <EffectComposer multisampling={8}>
        <Bloom
          mipmapBlur
          radius={0.7}
          intensity={0.5}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.3}
        />
      </EffectComposer>
      <Light />
    </>
  );
}
