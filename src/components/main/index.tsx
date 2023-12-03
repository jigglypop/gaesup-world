"use client";

import Controller from "@gaesup/index";
import GaeSupTools from "@gaesup/tools";
import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import Floor from "@components/platform/Floor";
import { optionsAtom } from "@gaesup/stores/options";
import { useSetAtom } from "jotai";
import FloatMove from "../platform/FloatMove";
import RigidObjects from "../platform/RigidObjects";
import RoughPlane from "../platform/RoughPlane";
import { vehicleKeyboardMap } from "./keyboardMap/vehicle";
import * as style from "./style.css";

export const S3 = "https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf";

// const keyMap = () => {
//   const options = useAtomValue(optionsAtom);
//   if (options.mode === "normal") {
//     return characterKeyboardMap;
//   } else if (options.mode === "vehicle") {
//     return vehicleKeyboardMap;
//   }
// };

export default function Main() {
  const CHARACTER_URL = S3 + "/gaesup.glb";
  const KART_URL = S3 + "/kart2.glb";

  const setOptions = useSetAtom(optionsAtom);

  return (
    <>
      <div className={style.mainButtonContainer}>
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
          <KeyboardControls map={vehicleKeyboardMap}>
            <Controller
              url={CHARACTER_URL}
              characterUrl={CHARACTER_URL}
              kartUrl={KART_URL}
              options={{
                debug: false,
                controllerType: "keyboard",
                mode: "vehicle",
                kartUrl: KART_URL,
                characterUrl: CHARACTER_URL,
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
      <GaeSupTools keyboardMap={vehicleKeyboardMap} />
    </>
  );
}
