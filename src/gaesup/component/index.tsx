import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
import { GaesupWorldContext } from "../world/context";
import { Airplane } from "./mode/Airplane";
import { Character } from "./mode/Character";
import { Vehicle } from "./mode/Vehicle";

export function GaesupComponent({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { mode } = useContext(GaesupWorldContext);
  return (
    <>
      {mode.type === "character" && <Character props={props} refs={refs} />}
      {mode.type === "vehicle" && <Vehicle props={props} refs={refs} />}
      {mode.type === "airplane" && <Airplane props={props} refs={refs} />}
    </>
  );
}
