import { useAtom } from "jotai";
import { cameraOptionAtom } from "../../atoms/cameraOptionAtom";

export function useZoom() {
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);

  const zoom = (zoom: number) => {
    setCameraOption(prev => ({
      ...prev,
      zoom,
    }));
  };

  return {
    zoom,
  };
}
