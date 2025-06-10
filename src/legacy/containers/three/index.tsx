"use client";

import MiniMap from "@components/minimap";
import { START_POSITION } from "@constants/index";
import Foooter from "@containers/footer";
import Header from "@containers/header";
import Moving from "@containers/moving";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { initBlockOption, initClickerOption } from "@store/options";
import { rotationAtom } from "@store/rotation/atom";
import { zoomAtom } from "@store/zoom/atom";
import { ZoomCamera } from "@store/zoom/zoomCamera";
import { GaesupWorld } from "gaesup-world";
import { useAtom } from "jotai";
import { ReactNode, useMemo } from "react";
import { useLocation } from "react-router-dom";
import * as S from "./styles.css";

export const keyBoardMap = [{ name: "keyD", keys: ["KeyD"], label: "인사" }];

export default function ThreeContainer({
  children,
  isUpdate = false,
}: {
  children: ReactNode;
  isUpdate: boolean;
}) {
  const [{ zoom }] = useAtom(zoomAtom);
  const [rotate] = useAtom(rotationAtom);
  const location = useLocation();

  const HeaderMemo = useMemo(() => <Header />, [location, location.pathname]);
  const FoooterMemo = useMemo(() => <Foooter />, [location, location.pathname]);

  const { clickerOption } = initClickerOption();
  const { blockOption } = initBlockOption();
  const cameraOption = useMemo(() => {
    return {
      YDistance: rotate.y,
      ZDistance: rotate.z * Math.cos(rotate.angle + Math.PI / 4),
      XDistance: rotate.x * Math.sin(rotate.angle + Math.PI / 4),
    };
  }, [rotate]);

  return (
    <GaesupWorld
      urls={{
        characterUrl: "gltf/ally_body.glb",
      }}
      mode={{
        type: "character",
        controller: "clicker",
        control: "normal",
        isButton: true,
      }}
      debug={false}
      cameraOption={cameraOption}
      startPosition={START_POSITION}
      clickerOption={clickerOption}
      block={blockOption}>
      {HeaderMemo}
      {FoooterMemo}
      {location.pathname === "/aggjack/" && <MiniMap />}

      {isUpdate && <Moving />}
      <Canvas
        flat
        shadows
        frameloop={"demand"}
        camera={{
          fov: 50,
          zoom: zoom,
        }}
        className={S.canvas}>
        <ZoomCamera />
        <Physics updateLoop="independent">{children}</Physics>
      </Canvas>
    </GaesupWorld>
  );
}
