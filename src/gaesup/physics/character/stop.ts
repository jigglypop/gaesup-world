import { vec3 } from "@react-three/rapier";
import { calcNorm } from "../../utils";
import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { control, clicker, mode, clickerOption },
  } = prop;
  const { keyS } = control;

  if (keyS && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }

  const u = vec3(rigidBodyRef.current?.translation());
  let norm = calcNorm(u, clicker.point, false);
  if (clickerOption.autoStart) {
    clicker.isOn = true;
    norm = calcNorm(u, clickerOption.queue[0], false);
    const v = vec3(clickerOption.queue[0]);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    clicker.angle = newAngle;
  }
  if (norm < 1 && mode.controller === "clicker") {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      clicker.point = clickerOption.queue.shift();
      const v = vec3(clicker.point);
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      clicker.angle = newAngle;
      if (clickerOption.loop) {
        clickerOption.queue.push(clicker.point);
      }
    } else {
      clicker.isOn = false;
      clicker.isRun = false;
    }
  }
}
