import NpcComponent from "@components/npcs";
import useNpc from "@store/npc";

export default function NpcUpdateContainer() {
  const { update, create } = useNpc();
  return (
    <NpcComponent
      npcs={Object.values({ ...update, ...create })}
      isUpdate={true}
    />
  );
}
