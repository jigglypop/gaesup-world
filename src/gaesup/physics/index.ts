import { propType, refsType } from "@gaesup/type";

import accelaration from "./accelaration";
import stabilizing from "./stabilizing";
import turn from "./turn";

export default function calculation(prop: propType, refs: refsType) {
  turn(prop);
  stabilizing(prop);
  accelaration(prop);
  // initCamera(prop);
  // vehicleCamera(prop);
  // vehicleDirection(prop);
  // vehicleImpulse(prop, refs);
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
