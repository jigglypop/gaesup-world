"use client";

import { Environment } from "@react-three/drei";
import { Physics, euler } from "@react-three/rapier";

import { Canvas } from "@react-three/fiber";

import { FaMapMarkerAlt } from "react-icons/fa";
import {
  GaesupController,
  GaesupWorld,
  // GameBoy,
  // GamePad,
  // JoyStick,
  // KeyBoardToolTip,
  // MiniMap,
  PassiveCharacter,
  V3,
} from "../../src";
import { Clicker } from "../../src/gaesup/tools/clicker";
import { InnerHtml } from "../../src/gaesup/utils/innerHtml";
import Passive from "../passive";
import Floor from "./Floor";
// import * as style from "./style.css";

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
  const CHARACTER_URL = S3 + "/orri.glb";
  const AIRPLANE_URL = S3 + "/gaebird.glb";
  const VEHICLE_URL = S3 + "/gorani.glb";

  return (
    <GaesupWorld
      urls={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      mode={{
        type: "character",
        // controller: isMobile ? "gameboy" : "clicker",
        controller: "clicker",
        control: "normal",
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
        <Physics debug>
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
          {/* <Second /> */}
          <Floor />
          <Passive />
          {/* <Rideable
            objectkey="gorani"
            url={S3 + "/gorani.glb"}
            objectType={"vehicle"}
            enableRiding={true}
            offset={V3(0, 2, 0)}
            position={V3(-20, 0, 0)}
          /> */}
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

          <PassiveCharacter
            position={V3(0, 0, 0)}
            euler={euler()}
            urls={{
              characterUrl: CHARACTER_URL,
            }}
            currentAnimation="jump"
            type={"fixed"}
          ></PassiveCharacter>
        </Physics>
      </Canvas>

      {/* <div className={style.footer}>
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
      </div> */}
    </GaesupWorld>
  );
}
