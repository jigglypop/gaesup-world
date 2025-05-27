import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    worldContext: { control, clicker, mode },
    dispatch,
  } = prop;
  const { keyS } = control;

  if (keyS && mode.controller === "clicker") {
    dispatch({
      type: "update",
      payload: {
        clicker: {
          ...clicker,
          isOn: false,
          isRun: false,
        },
      },
    });
  }
}
