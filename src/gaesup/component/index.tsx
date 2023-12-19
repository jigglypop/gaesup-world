import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
import { gaesupPassivePropsType } from "../hooks/useGaesupController";
import calculation from "../physics";
import { GaesupWorldContext } from "../world/context";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";
import { PassiveAirplane } from "./passive/airplane";
import { PassiveCharacter } from "./passive/character";
import { PassiveVehicle } from "./passive/vehicle";

export function GaesupPassiveComponent(props: gaesupPassivePropsType) {
  const { mode } = props;
  return (
    <>
      {mode.type === "character" && <PassiveCharacter props={props} />}
      {mode.type === "vehicle" && <PassiveVehicle props={props} />}
      {mode.type === "airplane" && <PassiveAirplane props={props} />}
    </>
  );
}

export function GaesupComponent({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { mode } = useContext(GaesupWorldContext);
  calculation(props);

  return (
    <>
      {mode.type === "character" && <CharacterRef props={props} refs={refs} />}
      {mode.type === "vehicle" && <VehicleRef props={props} refs={refs} />}
      {mode.type === "airplane" && <AirplaneRef props={props} refs={refs} />}
    </>
  );
}
