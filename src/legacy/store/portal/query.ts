import { getPortals } from "@api/portal";
import { minute } from "@constants/time";
import { useQuery } from "@tanstack/react-query";

export function usePortalQuery() {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["portals"],
    queryFn: getPortals,
    staleTime: 10 * minute,
  });

  return {
    portals: data,
    isPortalSuccess: isSuccess,
    isPortalLoading: isLoading,
  };
}
