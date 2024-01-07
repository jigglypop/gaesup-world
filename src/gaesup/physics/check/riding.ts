import { calcPropType } from "../type";

export default function riding(prop: calcPropType) {
  const {
    worldContext: { states, rideable, mode },
  } = prop;

  const { isRiding } = states;
  if (isRiding && states.isPush["keyR"]) {
    states.isLanding = true;
  }
}
