import direction from "@physics/airplane/direction";
import { calcPropType } from "..";
import gravity from "./gravity";
import impulse from "./impulse";
import turn from "./turn";

export default function airplaneCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  impulse(calcProp);
  // damping(calcProp);
  gravity(calcProp);
}
