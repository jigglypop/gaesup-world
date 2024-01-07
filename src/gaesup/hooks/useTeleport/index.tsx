import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";

export function useTeleport() {
  const { refs } = useContext(GaesupWorldContext);

  const Teleport = (position: THREE.Vector3) => {
    refs.rigidBodyRef?.current?.setTranslation(position, true);
  };

  return {
    Teleport,
  };
}
