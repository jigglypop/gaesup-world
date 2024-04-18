import { calcType } from "../type";

export default function riding(prop: calcType) {
  const {
    worldContext: { states },
  } = prop;

  const { isRiderOn } = states;
  if (isRiderOn && states.isPush["keyR"]) {
    states.isLanding = true;
  }
}
