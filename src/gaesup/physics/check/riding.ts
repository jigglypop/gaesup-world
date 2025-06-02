import { calcType } from "../type";

export default function riding(prop: calcType) {
  const {
    worldContext: { states, control },
  } = prop;

  const { isRiderOn } = states;
  if (isRiderOn && control.keyR) {
    states.isRiding = true;
  }
}
