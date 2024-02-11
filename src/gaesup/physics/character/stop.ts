import { calcPropType } from "../type";

export default function stop(prop: calcPropType) {
  const {
    worldContext: { control, clicker, mode },
  } = prop;
  const { keyS } = control;
  if (keyS && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }
}
