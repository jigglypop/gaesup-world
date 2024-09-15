import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
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
  const { mode, states, rideable, urls } = useContext(GaesupWorldContext);
  const { enableRiding, isRiderOn, rideableId } = states;

  return (
    <>
      {mode.type === "character" && (
        <CharacterRef props={props} refs={refs} urls={urls}>
          {props.children}
        </CharacterRef>
      )}
      {mode.type === "vehicle" && (
        <VehicleRef
          controllerOptions={props.controllerOptions}
          url={urls.vehicleUrl}
          wheelUrl={urls.wheelUrl}
          ridingUrl={urls.ridingUrl}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          groundRay={props.groundRay}
          offset={
            rideableId && rideable[rideableId]
              ? rideable[rideableId].offset
              : vec3()
          }
          {...refs}
        >
          {props.children}
        </VehicleRef>
      )}
      {mode.type === "airplane" && (
        <AirplaneRef
          controllerOptions={props.controllerOptions}
          url={urls.airplaneUrl}
          ridingUrl={urls.ridingUrl}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          groundRay={props.groundRay}
          offset={
            rideableId && rideable[rideableId]
              ? rideable[rideableId].offset
              : vec3()
          }
          {...refs}
        >
          {props.children}
        </AirplaneRef>
      )}
    </>
  );
}
