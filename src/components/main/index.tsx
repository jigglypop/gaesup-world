"use client";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import { useState } from "react";
import GaesupController from "../../gaesup/controller";
import {
  airplaneOptionType,
  characterOptionType,
  gaesupControllerPropType,
  vehicleOptionType,
} from "../../gaesup/stores/context";

import {
  orthographicCameraType,
  perspectiveCameraType,
} from "../../gaesup/stores/context/controller";
import GaeSupTools from "../../gaesup/tools";
import { S3 } from "../../gaesup/utils/constant";
import GaesupWorld from "../../gaesup/world";
import FloatMove from "../platform/FloatMove";
import Floor from "../platform/Floor";
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
  const VEHICLE_URL = S3 + "/kart2.glb";

  const [mode, changeMode] = useState<
    characterOptionType | vehicleOptionType | airplaneOptionType
  >({
    type: "airplane",
    controller: "keyboard",
  });

  const [camera, changeCamera] = useState<
    perspectiveCameraType | orthographicCameraType
  >({
    cameraType: "perspective",
    controlType: "orbit",
  });

  return (
    <GaesupWorld
      mode={{ ...mode }}
      url={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      minimap={{
        on: true,
        ratio: 0.3,
        minimapStyle: {
          background: "rgba(0,0,0,0.5)",
        },
        objectStyle: {
          background: "rgba(255,255,255,0.5)",
          boxShadow: "0 0 5px rgba(0,0,0,0.5)",
          border: "1px solid rgba(0,0,0,0.5)",
        },
      }}
    >
      <div className={style.mainButtonContainer}>
        <button
          className={style.button}
          onClick={() =>
            changeMode((mode: characterOptionType) => ({
              type: "character",
              controller: mode.controller,
            }))
          }
        >
          CHARACTER
        </button>
        <button
          className={style.button}
          onClick={() =>
            changeMode((mode: vehicleOptionType) => ({
              type: "vehicle",
              controller: mode.controller,
            }))
          }
        >
          VEHICLE
        </button>
        <button
          className={style.button}
          onClick={() =>
            changeMode((mode: airplaneOptionType) => ({
              type: "airplane",
              controller: mode.controller,
            }))
          }
        >
          AIRPLANE
        </button>
        <button
          className={style.button}
          onClick={() =>
            changeCamera(() => ({
              cameraType: "perspective",
              controlType: "normal",
            }))
          }
        >
          NORMAL
        </button>
        <button
          className={style.button}
          onClick={() =>
            changeCamera(() => ({
              cameraType: "perspective",
              controlType: "orbit",
            }))
          }
        >
          ORBIT
        </button>
        <button
          className={style.button}
          onClick={() => {
            changeCamera(() => ({
              cameraType: "orthographic",
              controlType: "orbit",
            }));
          }}
        >
          MAP
        </button>
        <button
          className={style.button}
          onClick={() => {
            changeMode((mode: gaesupControllerPropType) => ({
              type: mode.type,
              controller: "keyboard",
            }));
          }}
        >
          키보드
        </button>
        <button
          className={style.button}
          onClick={() => {
            changeMode((mode: gaesupControllerPropType) => ({
              type: mode.type,
              controller: "joystick",
            }));
          }}
        >
          조이스틱
        </button>
        {/* <button
          className={style.button}
          onClick={() => {
            changeMode((mode: gaesupControllerPropType) => ({
              type: mode.type,
              controller: "gameboy",
            }));
          }}
        >
          게임보이
        </button> */}
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
            <GaesupController
              cameraMode={{ ...camera }}
              orthographicCamera={{
                zoom: 80,
              }}
              groupProps={{
                rotation: [0, Math.PI, 0],
              }}
              onAnimate={({ control, states, playAnimation }) => {
                const { keyZ } = control;
                if (keyZ) {
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
          {/* <Slopes /> */}
        </Physics>
      </Canvas>
      <GaeSupTools keyboardMap={keyboardMap} />
    </GaesupWorld>
  );
}
