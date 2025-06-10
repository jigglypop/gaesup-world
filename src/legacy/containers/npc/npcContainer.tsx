import NpcComponent from "@components/npcs";
import useNpcQuery from "@store/npc/query";

export default function NpcContainer({
  isUpdate = false,
}: {
  isUpdate: boolean;
}) {
  const { npcs } = useNpcQuery();
  return (
    <NpcComponent
      npcs={npcs}
      isUpdate={isUpdate}
    />
  );
}
