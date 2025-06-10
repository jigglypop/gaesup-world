"use client";
import NameTag from "@common/spriteTag";
import { useFrame } from "@react-three/fiber";
import useModal from "@store/modal";
import { speechBalloonAtom } from "@store/speechBallon/atom";
import { GaesupController, V3, useGaesupController } from "gaesup-world";
import { useAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

function CircleSelector({ radius = 2, color = "white", segments = 64 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const scale = 0.9 + Math.sin(t * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
      if (
        meshRef.current.material &&
        meshRef.current.material instanceof THREE.Material
      ) {
        meshRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.1;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, segments]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Player() {
  const MemorizedController = useMemo(() => <PlayController />, []);
  return <>{MemorizedController}</>;
}

export function PlayController() {
  const { state } = useGaesupController();
  const [speechBalloon, setspeechBalloon] = useAtom(speechBalloonAtom);
  const { isOpen } = useModal();

  const setGreetCallback = useCallback(() => {
    setspeechBalloon(" 안녕? 🖐");
  }, []);
  const setJumpCallback = useCallback(() => {
    setspeechBalloon(" 점프 👣");
  }, []);

  const tagsMemo = useMemo(() => {
    return (
      <group position={state.position.clone().add(V3(0, 1, 0))}>
        <group position={[2, 6, 2]}>
          <NameTag
            text={speechBalloon}
            fontSize={0.8}
            color={"rgba(0, 0, 0, 0.8)"}
            background={"rgba(188, 255, 255, 0.945)"}></NameTag>
        </group>
        <group position={[0, -0.5, 0]}>
          <CircleSelector
            radius={1.5}
            color="rgba(188, 255, 255, 0.945)"
          />
        </group>
      </group>
    );
  }, [state.position]);

  return (
    <>
      <GaesupController
        character={{
          walkSpeed: 15,
          runSpeed: 20,
        }}
        parts={[
          { url: "gltf/ally_cloth_rabbit.glb" },
          { url: "gltf/super_glass.glb" },
        ]}
        controllerOptions={{
          lerp: {
            cameraTurn: 0.1,
            cameraPosition: 1,
          },
        }}
        rigidBodyProps={{
          type: isOpen ? "fixed" : "dynamic",
        }}
        onFrame={({ states }) => {
          if (states.isJumping) {
            setJumpCallback();
          }
        }}
        onAnimate={async ({ control, subscribe }) => {
          subscribe({
            tag: "greet",
            condition: () => control?.keyD,
            action: () => {
              setGreetCallback();
            },
          });
        }}></GaesupController>
      {tagsMemo}
    </>
  );
}
