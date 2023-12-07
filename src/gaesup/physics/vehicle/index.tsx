import { calcPropType } from "..";
import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import turn from "./turn";

export default function vehicleCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  impulse(calcProp);
  damping(calcProp);
}
