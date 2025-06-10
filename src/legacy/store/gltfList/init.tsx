import { getGltfList } from "@api/gltf";
import { min } from "@constants/time";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { gltfListAtom } from "./atom";

export function initGltfEffect() {
  const { data, isSuccess } = useQuery({
    queryKey: ["gltfList"],
    queryFn: getGltfList,
    staleTime: 10 * min,
  });

  const [_, setGltfs] = useAtom(gltfListAtom);

  useEffect(() => {
    if (isSuccess && data) {
      setGltfs((gltfList) => ({ ...gltfList, ...data }));
    }
  }, [isSuccess]);
}
