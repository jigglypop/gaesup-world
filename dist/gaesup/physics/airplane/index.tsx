import { calcType } from "../type";
import damping from "./damping";
import direction from "./direction";
import gravity from "./gravity";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import landing from "./landing";

export default function airplaneCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  gravity(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}
