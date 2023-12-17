"use client";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import { GaesupController, GaesupWorld } from "../../../src";
import { GameBoy } from "../../../src/gaesup/tools/gameboy";
import { GamePad } from "../../../src/gaesup/tools/gamepad";
import { JoyStick } from "../../../src/gaesup/tools/joystick";
import { KeyBoardToolTip } from "../../../src/gaesup/tools/keyBoardToolTip";
import { MiniMap } from "../../../src/gaesup/tools/minimap";
import FloatMove from "../platform/FloatMove";
import Floor from "../platform/Floor";
import RigidObjects from "../platform/RigidObjects";
import RoughPlane from "../platform/RoughPlane";
import * as style from "./style.css";

export const S3 = "https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf";
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
  const CHARACTER_URL = S3 + "/gaesupyee.glb";
  const AIRPLANE_URL = S3 + "/air.glb";
  const VEHICLE_URL = S3 + "/gaesupkart.glb";
  const WHEEL_URL = S3 + "/wheel.glb";

  return (
    <GaesupWorld
      debug={true}
      url={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
        wheelUrl: WHEEL_URL,
      }}
      mode={{
        type: "character",
      }}
    >
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
          {/* <Passive /> */}

          <KeyboardControls map={keyboardMap}>
            <GaesupController
              cameraMode={{
                controlType: "normal",
              }}
              orthographicCamera={{
                zoom: 80,
              }}
              groupProps={{
                rotation: [0, Math.PI, 0],
              }}
              onAnimate={({ playAnimation }) => {
                playAnimation("greet", "keyZ");
              }}
            />
          </KeyboardControls>
          <RoughPlane />
          <RigidObjects />
          <FloatMove />
          <Floor />
          {/* <TreeA /> */}
          {/* <Slopes /> */}
        </Physics>
      </Canvas>
      <div className={style.footer}>
        <div className={style.footerUpper}>
          <GamePad
            label={{
              keyZ: "GREET",
              shift: "SPLINT",
              space: "JUMP",
            }}
          />
        </div>
        <div className={style.footerLower}>
          <div className={style.joyStickOuter}>
            <JoyStick />
          </div>
          <div className={style.gameBoyOuter}>
            <GameBoy />
          </div>
          <div className={style.keyBoardToolTipOuter}>
            <KeyBoardToolTip keyBoardMap={keyboardMap} />
          </div>
          <div className={style.minimapOuter}>
            <MiniMap />
          </div>
        </div>
      </div>
    </GaesupWorld>
  );
}
