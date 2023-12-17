import { controllerInnerType, refsType } from "../../controller/type";
import calculation from "../../physics";
import { AirplaneRef } from "../ref/airplane";

export function Airplane({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  calculation(props);
  return <AirplaneRef props={props} refs={refs} />;
}
