"use client";

import { Environment } from "@react-three/drei";
import { Physics, euler } from "@react-three/rapier";

import {
  GaesupController,
  GaesupWorld,
  GameBoy,
  GamePad,
  JoyStick,
  MiniMap,
} from "../../../src";

import { Canvas } from "@react-three/fiber";
import { KeyBoardToolTip } from "../../../src/gaesup/tools/keyBoardToolTip";
import { Rideable } from "../../../src/gaesup/tools/rideable";
import { V3 } from "../../../src/gaesup/utils";
import Info from "../info";
import Passive from "../passive";
import Direction from "../platform/Direction";
import Floor from "../platform/Floor";
import Stair from "../platform/Stair";
import * as style from "./style.css";

export const S3 = "https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf";
export const keyBoardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "space", keys: ["Space"], label: "JUMP" },
  { name: "shift", keys: ["Shift"], label: "SPLINT" },
  { name: "keyZ", keys: ["KeyZ"], label: "GREET" },
  { name: "keyR", keys: ["KeyR"], label: "RIDE" },
];

export default function Selected() {
  const CHARACTER_URL =
    "https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf/gaesupyee.glb";
  const AIRPLANE_URL = S3 + "/air.glb";
  const VEHICLE_URL = S3 + "/kart.glb";
  const WHEEL_URL = S3 + "/wheel.glb";

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        wheelUrl: WHEEL_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      mode={{
        type: "character",
        controller: "keyboard",
        control: "normal",
      }}
      debug={true}
      keyBoardMap={keyBoardMap}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ width: "100vw", height: "100vh", position: "fixed" }}
        frameloop="demand"
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
        <Physics>
          <GaesupController
            onAnimate={({ control, subscribe }) => {
              subscribe({
                tag: "greet",
                condition: () => control?.keyZ,
              });
            }}
          />
          <Passive />
          <Floor />
          <Direction />
          <Stair />
          <Rideable
            objectkey="1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 1, 10)}
          />

          <Rideable
            objectkey="3"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(15, 1, 15)}
            rotation={euler().set(0, Math.PI / 2, 0)}
          />
        </Physics>
      </Canvas>

      <div className={style.footer}>
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
        <Info />
        <div className={style.footerLower}>
          <div className={style.joyStickOuter}>
            <JoyStick />
            <GameBoy />
          </div>
          <div className={style.keyBoardToolTipOuter}>
            <KeyBoardToolTip keyBoardMap={keyBoardMap} />
          </div>
          <div className={style.minimapOuter}>
            <MiniMap />
          </div>
        </div>
      </div>
    </GaesupWorld>
  );
}
