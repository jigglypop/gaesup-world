import damping from "@physics/airplane/damping";
import direction from "@physics/airplane/direction";
import impulse from "@physics/airplane/impulse";
import { calcPropType } from "..";
import gravity from "./gravity";
import turn from "./turn";

export default function airplaneCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  impulse(calcProp);
  damping(calcProp);
  gravity(calcProp);
}
