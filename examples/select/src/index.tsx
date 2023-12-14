"use client";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import GaesupController from "../../../src/gaesup/controller";

import {
  orthographicCameraType,
  perspectiveCameraType,
} from "../../../src/gaesup/controller/context/type";
import GaeSupTools from "../../../src/gaesup/tools";
import { S3 } from "../../../src/gaesup/utils/constant";
import GaesupWorld from "../../../src/gaesup/world";
import { modeType } from "../../../src/gaesup/world/context/type";
import FloatMove from "../platform/FloatMove";
import Floor from "../platform/Floor";
import RigidObjects from "../platform/RigidObjects";
import RoughPlane from "../platform/RoughPlane";
import * as style from "./style.css";
import { button } from "./style.css";

export const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "space", keys: ["Space"] },
  { name: "shift", keys: ["Shift"] },
  { name: "keyZ", keys: ["KeyZ"] },
];

export default function Selected() {
  const CHARACTER_URL = "./gaesupyee.glb";
  const AIRPLANE_URL = "./airplane.glb";
  const VEHICLE_URL = S3 + "/kart2.glb";

  const [mode, changeMode] = useState<modeType>({
    type: "character",
    controller: isMobile ? "joystick" : "joystick",
  });

  const [camera, changeCamera] = useState<
    perspectiveCameraType | orthographicCameraType
  >({
    cameraType: "perspective",
    controlType: "orbit",
  });

  return (
    <GaesupWorld
      debug={true}
      mode={{ ...mode }}
      url={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
    >
      <GaeSupTools />
      <div className={style.mainButtonContainer}>
        <button
          className={button({
            selected: mode.type === "character",
          })}
          onClick={() =>
            changeMode((mode) => ({
              type: "character",
              controller: mode.controller,
            }))
          }
        >
          CHARACTER
        </button>
        <button
          className={button({
            selected: mode.type === "vehicle",
          })}
          onClick={() =>
            changeMode((mode) => ({
              type: "vehicle",
              controller: mode.controller,
            }))
          }
        >
          VEHICLE
        </button>
        <button
          className={button({
            selected: mode.type === "airplane",
          })}
          onClick={() =>
            changeMode((mode) => ({
              type: "airplane",
              controller: mode.controller,
            }))
          }
        >
          AIRPLANE
        </button>
        <button
          className={button({
            selected: camera.controlType === "normal",
          })}
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
          className={button({
            selected:
              camera.controlType === "orbit" &&
              camera.cameraType === "perspective",
          })}
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
          className={button({
            selected: camera.cameraType === "orthographic",
          })}
          onClick={() => {
            changeCamera(() => ({
              cameraType: "orthographic",
              controlType: "orbit",
            }));
          }}
        >
          MAP
        </button>
        {!isMobile && (
          <button
            className={button({
              selected: mode.controller === "keyboard",
            })}
            onClick={() => {
              changeMode((mode) => ({
                type: mode.type,
                controller: "keyboard",
              }));
            }}
          >
            키보드
          </button>
        )}
        <button
          className={button({
            selected: mode.controller === "joystick",
          })}
          onClick={() => {
            changeMode((mode) => ({
              type: mode.type,
              controller: "joystick",
            }));
          }}
        >
          조이스틱
        </button>
        <button
          className={button({
            selected: mode.controller === "gameboy",
          })}
          onClick={() => {
            changeMode((mode) => ({
              type: mode.type,
              controller: "gameboy",
            }));
          }}
        >
          게임보이
        </button>
      </div>
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ width: "100dvw", height: "100dvh" }}
      >
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
              isRider={mode.type === "vehicle" ? true : false}
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
      <GaeSupTools
        keyboardToolTip={{
          keyBoardMap: keyboardMap,
          keyBoardLabel: {
            keyZ: "GREET",
            space: "JUMP",
          },
        }}
      />
    </GaesupWorld>
  );
}
