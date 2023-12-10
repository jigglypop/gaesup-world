import { euler, quat, vec3 } from "@react-three/rapier";
import { V3 } from "../../utils/vector";

export const activeStateDefault = {
  position: V3(0, 2, 5),
  impulse: vec3(),
  velocity: vec3(),
  acceleration: vec3(),
  quat: quat(),
  euler: euler(),
  dir: vec3(),
  direction: vec3(),
  axisX: V3(1, 0, 0),
  axisY: V3(0, 1, 0),
  axisZ: V3(0, 0, 1),
  yaw: 0,
  pitch: 0,
  roll: 0,
};
