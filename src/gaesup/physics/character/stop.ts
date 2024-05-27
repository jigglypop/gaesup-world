import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    worldContext: { control, clicker, mode },
  } = prop;
  const { keyS } = control;

  if (keyS && mode.controller === "clicker") {
    clicker.isOn = false;
    clicker.isRun = false;
  }
}
