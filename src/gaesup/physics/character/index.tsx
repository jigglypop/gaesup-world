import { calcPropType } from "../type";
import accelaration from "./accelaration";
import currentSetting from "./currentSetting";
import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import jump from "./jump";
import stabilizing from "./stabilizing";
import turn from "./turn";

export default function characterCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  jump(calcProp);
  accelaration(calcProp);
  impulse(calcProp);
  damping(calcProp);
  stabilizing(calcProp);
  currentSetting(calcProp);
}
