import { getNpcs } from "@api/npc";
import { minute } from "@constants/time";
import { useQuery } from "@tanstack/react-query";
import useNpc from ".";

export default function useNpcQuery() {
  const { data } = useQuery({
    queryKey: ["npcs"],
    queryFn: getNpcs,
    staleTime: 10 * minute,
  });
  const { processNpc } = useNpc();
  const npcs = processNpc(data);

  return {
    data,
    npcs,
  };
}
