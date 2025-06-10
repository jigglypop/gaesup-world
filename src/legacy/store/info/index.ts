import { getInfos } from "@api/info";
import { minute } from "@constants/time";
import { useQuery } from "@tanstack/react-query";

export default function useInfo() {
  const { data: infos } = useQuery({
    queryKey: ["infos"],
    queryFn: getInfos,
    staleTime: 10 * minute,
  });

  return {
    infos,
  };
}
