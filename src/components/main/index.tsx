"use client";

import Controller from "@gaesup/index";
import GaeSupTools from "@gaesup/tools";
import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import { S3 } from "@/gaesup/utils/constant";
import Floor from "@components/platform/Floor";
import { optionsAtom } from "@gaesup/stores/options";
import { useAtom } from "jotai";
import FloatMove from "../platform/FloatMove";
import RigidObjects from "../platform/RigidObjects";
import RoughPlane from "../platform/RoughPlane";
import * as style from "./style.css";

export const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "space", keys: ["Space"] },
  { name: "shift", keys: ["Shift"] },
  { name: "keyZ", keys: ["KeyZ"] },
  { name: "control", keys: ["ControlLeft", "ControlRight"] },
];

export default function Main() {
  const CHARACTER_URL = "./gaesupyee.glb";
  const AIRPLANE_URL = "./airplane.glb";
  const KART_URL = S3 + "/kart2.glb";

  const [options, setOptions] = useAtom(optionsAtom);

  return (
    <>
      <div className={style.mainButtonContainer}>
        <button
          className={style.button}
          onClick={() =>
            setOptions((options) => ({
              ...options,
              mode: options.mode === "normal" ? "vehicle" : "normal",
            }))
          }
        >
          {options.mode}
        </button>
        <button
          className={style.button}
          onClick={() =>
            setOptions((options) => ({
              ...options,
              camera: {
                type: "perspective",
                control: "normal",
              },
            }))
          }
        >
          NORMAL
        </button>
        <button
          className={style.button}
          onClick={() =>
            setOptions((options) => ({
              ...options,
              camera: {
                type: "perspective",
                control: "orbit",
              },
            }))
          }
        >
          ORBIT
        </button>
        <button
          className={style.button}
          onClick={() => {
            setOptions((options) => ({
              ...options,
              camera: {
                type: "orthographic",
                control: "normal",
              },
            }));
          }}
        >
          MAP
        </button>
        <button
          className={style.button}
          onClick={() => {
            setOptions((options) => ({
              ...options,
              controllerType: "keyboard",
            }));
          }}
        >
          키보드
        </button>
        <button
          className={style.button}
          onClick={() => {
            setOptions((options) => ({
              ...options,
              controllerType: "joystick",
            }));
          }}
        >
          조이스틱
        </button>
        <button
          className={style.button}
          onClick={() => {
            setOptions((options) => ({
              ...options,
              controllerType: "gameboy",
            }));
          }}
        >
          게임보이
        </button>
      </div>
      <Canvas shadows dpr={[1, 2]} style={{ width: "100vw", height: "100vh" }}>
        <Environment background preset="sunset" blur={0.8} />
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
        <ambientLight intensity={0.5} />
        <Physics debug>
          <KeyboardControls map={keyboardMap}>
            <Controller
              url={CHARACTER_URL}
              characterUrl={CHARACTER_URL}
              kartUrl={KART_URL}
              airplaneUrl={AIRPLANE_URL}
              options={{
                debug: false,
                controllerType: "keyboard",
                mode: "airplane",
                kartUrl: KART_URL,
                characterUrl: CHARACTER_URL,
                airplaneUrl: AIRPLANE_URL,
                camera: {
                  type: "perspective",
                  control: "orbit",
                },
                orthographicCamera: {
                  zoom: 80,
                },
              }}
              character={{
                rotation: [0, Math.PI, 0],
              }}
              onAnimate={({ keyControl, states, playAnimation }) => {
                const { greet } = keyControl;
                if (greet) {
                  states.isAnimationOuter = true;
                  playAnimation("greet");
                } else {
                  states.isAnimationOuter = false;
                }
              }}
            />
          </KeyboardControls>
          <RoughPlane />
          <RigidObjects />
          <FloatMove />
          <Floor />
        </Physics>
      </Canvas>
      <GaeSupTools keyboardMap={keyboardMap} />
    </>
  );
}
