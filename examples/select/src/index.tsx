"use client";

import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import {
  GaesupController,
  GaesupWorld,
  GameBoy,
  GamePad,
  JoyStick,
  MiniMap,
  Rideable,
  V3,
} from "../../../src";

import { Canvas } from "@react-three/fiber";
import { isMobile } from "react-device-detect";
import { KeyBoardToolTip } from "../../../src/gaesup/tools/keyBoardToolTip";
import Info from "../info";
import Passive from "../passive";
import Floor from "../platform/Floor";
import Stair from "../platform/Stair";
import Track from "../platform/Track";
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
  const CHARACTER_URL = S3 + "/orri.glb";
  const AIRPLANE_URL = S3 + "/gaebird.glb";
  const VEHICLE_URL = S3 + "/gorani.glb";
  const WHEEL_URL = S3 + "/wheel.glb";

  return (
    <GaesupWorld
      urls={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      mode={{
        type: "character",
        controller: isMobile ? "gameboy" : "keyboard",
        control: "orbit",
      }}
      debug={false}
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
        <Physics>
          <GaesupController
            urls={{
              characterUrl: CHARACTER_URL,
              vehicleUrl: VEHICLE_URL,
              airplaneUrl: AIRPLANE_URL,
            }}
            onAnimate={({ control, subscribe }) => {
              subscribe({
                tag: "greet",
                condition: () => control?.keyZ,
              });
            }}
          />
          <Passive />
          <Floor />
          <Stair />
          <Track />
          <Rideable
            objectkey="grani"
            objectType="vehicle"
            enableRiding={true}
            url={VEHICLE_URL}
            offset={V3(0, 2.1, -0.5)}
            position={V3(-200, 2, -100)}
          />

          <Rideable
            objectkey="grani2"
            objectType="vehicle"
            enableRiding={true}
            url={VEHICLE_URL}
            offset={V3(0, 2.1, -0.5)}
            position={V3(-20, 1, 10)}
          />
          <Rideable
            objectkey="grani3"
            objectType="vehicle"
            enableRiding={true}
            url={VEHICLE_URL}
            offset={V3(0, 2.1, -0.5)}
            position={V3(-20, 1, 20)}
          />
          <Rideable
            objectkey="4"
            objectType="airplane"
            enableRiding={true}
            url={AIRPLANE_URL}
            offset={V3(0, 1.5, 0)}
            position={V3(20, 1, -10)}
          />

          <Rideable
            objectkey="5"
            objectType="airplane"
            enableRiding={false}
            url={AIRPLANE_URL}
            position={V3(20, 1, -20)}
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
