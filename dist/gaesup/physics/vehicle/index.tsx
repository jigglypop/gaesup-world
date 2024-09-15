import { calcType } from "../type";
import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import landing from "./landing";

export default function vehicleCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}
