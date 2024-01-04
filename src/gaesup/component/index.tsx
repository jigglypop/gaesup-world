import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
import calculation from "../physics";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";

export function GaesupComponent({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { mode, activeState } = useContext(GaesupWorldContext);

  calculation(props);
  return (
    <>
      {mode.type === "character" && <CharacterRef props={props} refs={refs} />}
      {mode.type === "vehicle" && <VehicleRef props={props} refs={refs} />}
      {mode.type === "airplane" && <AirplaneRef props={props} refs={refs} />}
    </>
  );
}
