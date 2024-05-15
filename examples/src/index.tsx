"use client";

import { Environment, Trail } from "@react-three/drei";
import { Physics, euler } from "@react-three/rapier";

import { Canvas, useFrame } from "@react-three/fiber";

import { useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import * as THREE from "three";
import {
  GaesupController,
  GaesupWorld,
  GameBoy,
  GamePad,
  JoyStick,
  KeyBoardToolTip,
  MiniMap,
  V3,
} from "../../src";
import { Clicker } from "../../src/gaesup/tools/clicker";
import { InnerHtml } from "../../src/gaesup/utils/innerHtml";
import Info from "../info";
import Floor from "./Floor";
import * as style from "./style.css";

function Electron({ radius = 2.75, speed = 6, ...props }) {
  const ref = useRef<THREE.Mesh>();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (!ref.current) return;
    ref.current.position.set(
      Math.sin(t) * radius,
      (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25,
      0
    );
  });
  return (
    <group {...props}>
      <Trail
        local
        width={5}
        length={6}
        color={new THREE.Color(2, 1, 10)}
        attenuation={(t) => t * t}
      >
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
}

export const S3 = "https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf";
export const keyBoardMap = [
  { name: "forward", keys: ["ArrowUp"] },
  { name: "backward", keys: ["ArrowDown"] },
  { name: "leftward", keys: ["ArrowLeft"] },
  { name: "rightward", keys: ["ArrowRight"] },
  { name: "space", keys: ["Space"], label: "JUMP" },
  { name: "shift", keys: ["Shift"], label: "SPLINT" },
  { name: "keyZ", keys: ["KeyZ"], label: "GREET" },
  { name: "keyR", keys: ["KeyR"], label: "RIDE" },
  { name: "keyS", keys: ["KeyS"], label: "STOP" },
];

export default function MainComponent() {
  const CHARACTER_URL = "gltf/ally_body.glb";
  const AIRPLANE_URL = S3 + "/gaebird.glb";
  const VEHICLE_URL = S3 + "/gorani.glb";

  const stopCB = () => {
    console.log("stop");
  };

  return (
    <GaesupWorld
      urls={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      mode={{
        type: "character",
        controller: "clicker",
        control: "normal",
      }}
      debug={false}
      keyBoardMap={keyBoardMap}
      cameraOption={{
        XDistance: 20,
        YDistance: 20,
        ZDistance: 20,
      }}
      clickerOption={{
        autoStart: true,
        track: true,
        loop: true,
        queue: [
          V3(10, 0, 0),
          V3(30, 0, 30),
          V3(10, 0, 30),
          V3(30, 0, 10),
          stopCB,
        ],
        line: true,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 10, 20],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ width: "100vw", height: "100vh", position: "fixed" }}
        frameloop="demand"
      >
        <Environment background preset="sunset" backgroundBlurriness={1} />
        <directionalLight
          castShadow
          shadow-normalBias={0.06}
          position={[20, 30, 10]}
          intensity={0.5}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-top={50}
          shadow-camera-right={50}
          shadow-camera-bottom={-50}
          shadow-camera-left={-50}
        />
        <directionalLight
          castShadow
          shadow-normalBias={0.06}
          position={[-200, 30, -100]}
          intensity={0.7}
          shadow-mapSize={[5000, 5000]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-top={50}
          shadow-camera-right={50}
          shadow-camera-bottom={-50}
          shadow-camera-left={-50}
        />
        <Physics debug interpolate={true}>
          <GaesupController
            onAnimate={({ control, subscribe }) => {
              subscribe({
                tag: "greet",
                condition: () => control?.keyZ,
              });
            }}
            controllerOptions={{
              lerp: {
                cameraTurn: 0.1,
                cameraPosition: 1,
              },
            }}
            rigidBodyProps={{}}
            parts={["gltf/ally_cloth_rabbit.glb"]}
          ></GaesupController>
          <Floor />
          {/* <Rideables />
          <Passive /> */}
          <Electron />
          <Clicker
            onMarker={
              <group rotation={euler({ x: 0, y: Math.PI / 2, z: 0 })}>
                <InnerHtml position={V3(0, 1, 0)}>
                  <FaMapMarkerAlt
                    style={{ color: "#f4ffd4", fontSize: "5rem" }}
                  />
                </InnerHtml>
              </group>
            }
            runMarker={
              <InnerHtml position={V3(0, 1, 0)}>
                <FaMapMarkerAlt
                  style={{ color: "#ffac8e", fontSize: "5rem" }}
                />
              </InnerHtml>
            }
          ></Clicker>
        </Physics>
      </Canvas>
      <Info />

      <div className={style.footerUpper}>
        <div className={style.gamePad}>
          <GamePad
            label={{
              keyZ: "GREET",
              shift: "SPLINT",
              space: "JUMP",
            }}
          />
        </div>
      </div>
      <div className={style.footerLower}>
        <div className={style.joystickOuter}>
          <JoyStick />
          <GameBoy />
          <MiniMap />
        </div>
      </div>
      <div className={style.keyBoardToolTipOuter}>
        <KeyBoardToolTip keyBoardMap={keyBoardMap} />
      </div>
    </GaesupWorld>
  );
}
