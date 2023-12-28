import { calcPropType } from "../type";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";

export default function characterCalculation(calcProp: calcPropType) {
  direction(calcProp);
  impulse(calcProp);
  innerCalc(calcProp);
}
