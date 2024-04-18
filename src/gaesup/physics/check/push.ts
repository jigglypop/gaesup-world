import { calcType } from "../type";

export default function push(prop: calcType) {
  const {
    worldContext: { states, control },
  } = prop;
  Object.keys(control).forEach((key) => {
    states.isPush[key] = control[key];
  });
}
