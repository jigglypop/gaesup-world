import { propType } from "@gaesup/type";

import accelaration from "./accelaration";
import stabilizing from "./stabilizing";
import turn from "./turn";
import vehicleCamera from "./vehicle/vehicleCamera";
import vehicleDirection from "./vehicle/vehicleDirection";
import vehicleImpulse from "./vehicle/vehicleImpulse";

export default function calculation(prop: propType) {
  turn(prop);
  stabilizing(prop);
  accelaration(prop);
  vehicleCamera(prop);
  vehicleDirection(prop);
  vehicleImpulse(prop);
  // jump(prop);
  // if (prop.options.mode === "normal") {
  //   impulse(prop);
  //   characterDirection(prop);
  // } else if (prop.options.mode === "airplane") {
  //   airplaneImpluse(prop);
  //   airplaneDirection(prop);
  // } else if (prop.options.mode === "vehicle") {
  //   vehicleCamera(prop);
  //   vehicleDirection(prop);
  //   vehicleImpulse(prop);
  // }
}
