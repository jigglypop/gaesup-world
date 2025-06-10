"use client";

import Pointer from "@common/pointer";
import Player from "@components/player";
import { MAIN_POSITION } from "@constants/main";
import NpcContainer from "@containers/npc/npcContainer";
import ThreeObjectContainer from "@containers/threeObject/threeObjectContainer";
import TileParentContainer from "@containers/tileParent/tileParentContainer";
import WallParentContainer from "@containers/wallPrarent/wallParentContainer";
import { Clicker } from "gaesup-world";
import { memo } from "react";

function Main() {
  return (
    <>
      <Player />
      <group position={MAIN_POSITION}>
        <ThreeObjectContainer isUpdate={false} />
        <TileParentContainer isUpdate={false} />
        <WallParentContainer isUpdate={false} />
        <NpcContainer isUpdate={false} />
      </group>
      <Clicker
        onMarker={<Pointer color={"#ffffff"} />}
        runMarker={<></>}
      />
    </>
  );
}

export default memo(Main);
