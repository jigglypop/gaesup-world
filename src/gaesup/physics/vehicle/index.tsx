import damping from "@physics/vehicle/damping";
import direction from "@physics/vehicle/direction";
import impulse from "@physics/vehicle/impulse";

import { calcPropType } from "..";
import turn from "./turn";

export default function vehicleCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  impulse(calcProp);
  damping(calcProp);
}
