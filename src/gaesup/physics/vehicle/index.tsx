import { calcPropType } from "../type";
import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";

export default function vehicleCalculation(calcProp: calcPropType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  innerCalc(calcProp);
}
