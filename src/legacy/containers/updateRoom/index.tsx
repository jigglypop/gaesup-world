"use client";

import { MapControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo } from "react";

import HoverTiles from "@components/hoverTile";
import Preview from "@components/preview";
import UpdateEnvironmentOuter from "@components/updateEnvironment";
import NpcContainer from "@containers/npc/npcContainer";
import NpcUpdateContainer from "@containers/npc/npcUpdateContainer";
import PortalContainer from "@containers/portal/PortalContainer";
import ThreeObjectContainer from "@containers/threeObject/threeObjectContainer";
import ThreeObjectUpdateContainer from "@containers/threeObject/threeObjectUpdateContainer";
import TileParentContainer from "@containers/tileParent/tileParentContainer";
import TileParentUpdateContainer from "@containers/tileParent/tileParentUpdateContainer";
import WallParentContainer from "@containers/wallPrarent/wallParentContainer";
import WallParentUpdateContainer from "@containers/wallPrarent/wallParentUpdateContainer";
import { initGltfEffect } from "@store/gltfList/init";
import useUpdateRoom from "@store/update";

export default function UpdateRoom() {
  const { updateRoom } = useUpdateRoom();

  initGltfEffect();

  const cameraMemo = useMemo(() => {
    return (
      <>
        <PerspectiveCamera
          makeDefault
          position={[20, 25, 20]}></PerspectiveCamera>
        <MapControls
          makeDefault
          minDistance={10} // 최소 줌 거리 설정
          maxDistance={50} // 최대 줌 거리 설정
          enabled={!updateRoom.option.turn || !updateRoom.current}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}></MapControls>
      </>
    );
  }, [updateRoom.option.turn, updateRoom.current]);

  return (
    <>
      <UpdateEnvironmentOuter />
      {cameraMemo}
      <TileParentContainer isUpdate={true} />
      <TileParentUpdateContainer />
      <WallParentContainer isUpdate={true} />
      <WallParentUpdateContainer />
      <ThreeObjectContainer isUpdate={true} />
      <ThreeObjectUpdateContainer />
      <NpcContainer isUpdate={true} />
      <NpcUpdateContainer />
      <PortalContainer />
      <Preview />
      <HoverTiles />
    </>
  );
}
