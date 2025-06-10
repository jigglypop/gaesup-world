import NpcObject from "@common/npc";
import { npcType } from "@store/npc/type";

export default function NpcComponent({
  npcs,
  isUpdate = false,
}: {
  npcs: npcType[];
  isUpdate?: boolean;
}) {
  return (
    <>
      {npcs?.map((npc) => (
        <NpcObject
          key={npc.npc_id}
          {...npc}
          isUpdate={isUpdate}
        />
      ))}
    </>
  );
}
