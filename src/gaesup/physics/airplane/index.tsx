import { calcPropType } from "../type";
import damping from "./damping";
import direction from "./direction";
import gravity from "./gravity";
import impulse from "./impulse";
import innerCalc from "./innerCalc";

export default function airplaneCalculation(calcProp: calcPropType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  gravity(calcProp);
  innerCalc(calcProp);
}
