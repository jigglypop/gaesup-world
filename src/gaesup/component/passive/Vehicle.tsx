import { controllerInnerType, refsType } from "../../controller/type";
import calculation from "../../physics";
import { VehicleRef } from "../ref/vehicle";

export function Vehicle({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  calculation(props);
  return <VehicleRef props={props} refs={refs} />;
}
