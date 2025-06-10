import useUpdateRoom from "@store/update";
import { useMemo } from "react";
import NpcEditor from "./npc";
import PortalEditor from "./portal";
import ThreeObjectPreview from "./threeObject";
import TileEditor from "./tile";
import WallEditor from "./wall";

export default function Preview() {
  const { updateRoom } = useUpdateRoom();

  const editorMemo = useMemo(() => {
    return (
      <>
        {updateRoom.object_type === "wall" && <WallEditor />}
        {updateRoom.object_type === "tile" && <TileEditor />}
        {updateRoom.object_type === "normal" && <ThreeObjectPreview />}
        {updateRoom.object_type === "npc" && <NpcEditor />}
        {updateRoom.object_type === "portal" && <PortalEditor />}
      </>
    );
  }, [updateRoom.object_type]);

  return <>{editorMemo}</>;
}
