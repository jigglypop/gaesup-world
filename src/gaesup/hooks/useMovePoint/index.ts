import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { useSetAtom } from "jotai";
import * as THREE from "three";
import { V3 } from "../../utils";
import { GaesupWorldContext } from "../../world/context";
import { mouseInputAtom } from "../../atoms/inputSystemAtom";

export function useMovePoint() {
  const { activeState } = useContext(GaesupWorldContext);
  const setMouseInput = useSetAtom(mouseInputAtom);

  const move = (position: THREE.Vector3, isRun: boolean) => {
    const u = activeState.position;
    const v = vec3(position);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    
    setMouseInput({
      target: V3(position.x, 0, position.z),
      angle: newAngle,
      isActive: true,
      shouldRun: isRun,
    });
  };

  return {
    move,
  };
}
