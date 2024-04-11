import { useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext } from "../../world/context";

export function useTeleport() {
  const { refs } = useContext(GaesupWorldContext);

  const Teleport = (position: THREE.Vector3) => {
    if (refs && refs.rigidBodyRef && refs.rigidBodyRef.current)
      refs.rigidBodyRef?.current?.setTranslation(position, true);
  };

  return {
    Teleport,
  };
}
