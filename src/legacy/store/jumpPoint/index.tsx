import { vec3 } from "@react-three/rapier";
import { updateWorld } from "@utils/getWorld";
import { V3 } from "gaesup-world";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import * as THREE from "three";
import { jumpPointAtom } from "./atom";
import { useCalcJumpPointEffectType } from "./type";

export default function useCalcJumpPointEffect({
  groupRef,
  object_type,
  object_name,
  start_position_delta,
  calcJumpPoint,
}: useCalcJumpPointEffectType) {
  useEffect(() => {
    if (groupRef.current && object_type && object_type === "room") {
      const obj = updateWorld({ ref: groupRef });
      if (!obj) return;
      if (start_position_delta)
        obj.position.add(vec3().set(...start_position_delta));
      calcJumpPoint(obj.position, object_name);
    }
  }, []);
}

export const useJumpPoint = () => {
  const [jumpPoint, setJumpPoint] = useAtom(jumpPointAtom);
  const setDegree = useCallback(
    (degree: number) => {
      setJumpPoint((_jumpPoint) => ({
        ..._jumpPoint,
        degree,
      }));
    },
    [setJumpPoint]
  );

  const calcJumpPoint = useCallback(
    (point: THREE.Vector3, object_name?: string) => {
      if (!object_name) return;
      setJumpPoint((_jumpPoint) => ({
        ..._jumpPoint,
        points: {
          ..._jumpPoint.points,
          [object_name]: {
            tag: object_name,
            position: V3(point.x, 5, point.z),
            degree: _jumpPoint.degree,
          },
        },
      }));
    },
    [setJumpPoint, V3]
  );

  const toggleJumpPoints = useCallback(() => {
    setJumpPoint((_jumpPoint) => ({
      ..._jumpPoint,
      on: !_jumpPoint.on,
    }));
  }, [setJumpPoint]);

  const closeJumpPoints = useCallback(() => {
    setJumpPoint((_jumpPoint) => ({
      ..._jumpPoint,
      on: false,
    }));
  }, [setJumpPoint, jumpPoint]);

  const openJumpPoints = useCallback(() => {
    setJumpPoint((_jumpPoint) => ({
      ..._jumpPoint,
      on: true,
    }));
  }, [setJumpPoint]);

  return {
    jumpPoint,
    setDegree,
    setJumpPoint,
    calcJumpPoint,
    toggleJumpPoints,
    closeJumpPoints,
    openJumpPoints,
  };
};
