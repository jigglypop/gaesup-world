"use client";

import Pointer from "@common/pointer";
import EnvironmentOuter from "@components/environmemt";
import Player from "@components/player";
import { MAIN_POSITION } from "@constants/main";
import BoardContainer from "@containers/board";
import NpcContainer from "@containers/npc/npcContainer";
import ThreeObjectContainer from "@containers/threeObject/threeObjectContainer";
import TileParentContainer from "@containers/tileParent/tileParentContainer";
import WallParentContainer from "@containers/wallPrarent/wallParentContainer";
import { Clicker } from "gaesup-world";

export const keyBoardMap = [{ name: "keyD", keys: ["KeyD"], label: "인사" }];

export default function MainContainer() {
  return (
    <>
      <EnvironmentOuter />
      <Player />
      <group position={MAIN_POSITION}>
        <ThreeObjectContainer isUpdate={false} />
        <TileParentContainer isUpdate={false} />
        <WallParentContainer isUpdate={false} />
        <NpcContainer isUpdate={false} />
        <BoardContainer />
      </group>
      <Clicker
        onMarker={<Pointer color={"#ffffff"} />}
        runMarker={<></>}
      />
    </>
  );
}
