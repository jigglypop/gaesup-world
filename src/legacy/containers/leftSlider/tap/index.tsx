"use client";

import useGltfList from "@store/gltfList";

import EditorFooter from "../footer";
import EditorHeader from "../header";
import NpcTap from "./npc";
import PortalTap from "./portal";
import * as S from "./styles.css";
import ThreeObjectTap from "./threeObject";
import TileTap from "./tile";
import WallTap from "./wall";

export default function Taps() {
  const { object_type } = useGltfList();

  return (
    <div className={S.outer}>
      <>
        <EditorHeader />
        {object_type === "wall" && <WallTap />}
        {object_type === "tile" && <TileTap />}
        {object_type === "npc" && <NpcTap />}
        {object_type === "normal" && <ThreeObjectTap />}
        {object_type === "portal" && <PortalTap />}
        <EditorFooter />
      </>
    </div>
  );
}
