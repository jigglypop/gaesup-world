"use client";

import { ANIMATION_MAP } from "@constants/main";
import {
  AccumulativeShadows,
  Environment,
  RandomizedLight,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useGraph } from "@react-three/fiber";
import { buttonRecipe } from "@styles/recipe/button.css";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import * as S from "./styles.css";

export function ObjectModalCanvas({
  setMotions,
  animation,
  gltf_url,
}: {
  setMotions: (motions: string[]) => void;
  animation: string;
  gltf_url: string;
  props?: any | null;
}) {
  const { scene, animations } = useGLTF(gltf_url);
  const { actions, ref } = useAnimations(animations);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const objectNode = Object.values(nodes).find(
    (node) => node.type === "Object3D"
  );
  const [_, setCurrentAnimation] = useState<string>("Idle");

  useEffect(() => {
    setCurrentAnimation(animation);
  }, [animation]);

  useEffect(() => {
    setMotions(
      Object.keys(ANIMATION_MAP).filter((key) =>
        Object.keys(actions).includes(key)
      )
    );
  }, [actions]);

  useEffect(() => {
    const action = actions[animation]?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [animation]);

  const outerRef = useRef<THREE.Group<THREE.Object3DEventMap>>(null);
  return (
    <>
      <AccumulativeShadows
        temporal
        frames={200}
        color="purple"
        colorBlend={0.5}
        opacity={1}
        scale={10}
        alphaTest={0.85}>
        <RandomizedLight
          amount={8}
          radius={5}
          ambient={0.5}
          position={[5, 3, 2]}
          bias={0.001}
        />
      </AccumulativeShadows>

      <Environment
        background
        files={["image/back.hdr"]}
        backgroundBlurriness={1}
        backgroundIntensity={1}
      />
      <spotLight
        penumbra={1}
        angle={1}
        castShadow
        position={[10, 60, -5]}
        intensity={8}
        shadow-mapSize={[512, 512]}
      />
      <hemisphereLight intensity={0.2} />
      <ambientLight intensity={0.5} />
      <group
        ref={outerRef}
        receiveShadow
        castShadow
        userData={{ intangible: true }}>
        {objectNode && ref && (
          <primitive
            object={objectNode}
            visible={false}
            receiveShadow
            castShadow
            ref={ref}
          />
        )}
      </group>
    </>
  );
}

export default function ObjectModal({
  username,
  gltf_url,
  props,
}: {
  username: string;
  gltf_url: string;
  props?: any | null;
}) {
  const [motions, setMotions] = useState<string[]>([]);
  const [animation, setAnimation] = useState<string>("idle");

  const objectMemo = useMemo(() => {
    return (
      <ObjectModalCanvas
        setMotions={setMotions}
        animation={animation}
        gltf_url={gltf_url}
        props={props}
      />
    );
  }, [gltf_url, animation, setMotions]);
  return (
    <div className={S.modalOuter}>
      <div className={S.modalInner}>
        <div className={S.modalTitle}>{username}</div>
        <div className={S.modalButtons}>
          {motions.map((motion, key) => (
            <div
              key={key}
              style={{
                width: "6rem",
                height: "4rem",
                fontSize: "1.4rem",
                margin: "0.5rem",
                opacity: animation === motion ? 1 : 0.8,
              }}
              className={buttonRecipe({
                color: animation === motion ? "mint" : "gray",
              })}
              onClick={() => {
                setAnimation(motion);
              }}>
              {ANIMATION_MAP[motion as keyof typeof ANIMATION_MAP]}
            </div>
          ))}
        </div>

        <Canvas
          shadows
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            margin: 0,
          }}
          camera={{
            position: [-15, 15, 15],
            fov: 22,
          }}>
          {objectMemo}
        </Canvas>
      </div>
    </div>
  );
}
