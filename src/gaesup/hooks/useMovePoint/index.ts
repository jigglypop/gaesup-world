import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { useSetAtom } from "jotai";
import * as THREE from "three";
import { V3 } from "../../utils";
import { GaesupContext } from "../../context";
import { pointerInputAtom } from "../../atoms/unifiedInputAtom";
import { MoveToType } from './type';

export function useMovePoint() {
  const { activeState } = useContext(GaesupContext);
  const setMouseInput = useSetAtom(pointerInputAtom);

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
