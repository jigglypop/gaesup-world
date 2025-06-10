import { getThreeObjects } from "@api/threeObject";
import { min } from "@constants/time";
import { useQuery } from "@tanstack/react-query";

export function useThreeObjectQuery() {
  const { data, isSuccess } = useQuery({
    queryKey: ["three_object"],
    queryFn: getThreeObjects,
    staleTime: 10 * min,
  });

  return {
    threeObject: data,
    isThreeObjectSuccess: isSuccess,
  };
}
