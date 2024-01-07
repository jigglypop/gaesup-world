import { calcPropType } from "../type";

export default function push(prop: calcPropType) {
  const {
    worldContext: { states, joystick, mode, control },
  } = prop;
  Object.keys(control).forEach((key) => {
    states.isPush[key] = control[key];
  });
}
