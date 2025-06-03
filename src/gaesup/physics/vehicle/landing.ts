import { calcType } from '../type';

export default function landing(prop: calcType) {
  const {
    worldContext: { states },
  } = prop;
  const { isRiding } = states;
  if (isRiding) {
    states.isRiding = false;
    states.enableRiding = false;
  }
}
