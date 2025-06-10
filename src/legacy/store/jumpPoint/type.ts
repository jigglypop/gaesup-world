import { RefObject } from "react";
import * as THREE from "three";

// 개별 점프포인트 타입
export type jumpPointType = {
  tag: string;
  position: THREE.Vector3;
  degree: number;
};

export type jumpPointAtomType = {
  degree: number;
  points: {
    [key in string]: jumpPointType;
  };
  on: boolean;
};

export type useCalcJumpPointEffectType = {
  groupRef: RefObject<THREE.Group | undefined>;
  object_type?: string;
  object_name?: string;
  start_position_delta?: [number, number, number];
  calcJumpPoint: (position: THREE.Vector3, object_name?: string) => void;
};
