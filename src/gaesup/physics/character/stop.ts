import { vec3 } from "@react-three/rapier";
import { calcNorm } from "../../utils";
import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { control, clicker, mode },
  } = prop;
  const { keyS } = control;
  if (keyS && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }
  // 목적지 도착
  const u = vec3(rigidBodyRef.current?.translation());
  const norm = calcNorm(u, clicker.point, false);
  if (norm < 1 && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }
}
