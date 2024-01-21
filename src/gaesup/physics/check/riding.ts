import { calcPropType } from "../type";

export default function riding(prop: calcPropType) {
  const {
    worldContext: { states },
  } = prop;

  const { isRiderOn } = states;
  if (isRiderOn && states.isPush["keyR"]) {
    states.isLanding = true;
  }
}
