import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
import { GaesupWorldContext } from "../world/context";
import { urlsType } from "../world/context/type";
import { AirplaneRef } from "./active/airplane";
import { CharacterRef } from "./active/character";
import { VehicleRef } from "./active/vehicle";

export function GaesupComponent({
  props,
  refs,
  urls,
}: {
  props: controllerInnerType;
  refs: refsType;
  urls: urlsType;
}) {
  const { mode, states, rideable } = useContext(GaesupWorldContext);
  const { enableRiding, isRiderOn, rideableId } = states;

  return (
    <>
      {mode.type === "character" && (
        <CharacterRef props={props} refs={refs} urls={urls} />
      )}
      {mode.type === "vehicle" && (
        <VehicleRef
          controllerOptions={props.controllerOptions}
          refs={refs}
          urls={urls}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          offset={
            rideableId && rideable[rideableId]
              ? rideable[rideableId].offset
              : vec3()
          }
        >
          {props.children}
        </VehicleRef>
      )}
      {mode.type === "airplane" && (
        <AirplaneRef
          controllerOptions={props.controllerOptions}
          refs={refs}
          urls={urls}
          enableRiding={enableRiding}
          isRiderOn={isRiderOn}
          offset={
            rideableId && rideable[rideableId]
              ? rideable[rideableId].offset
              : vec3()
          }
        >
          {props.children}
        </AirplaneRef>
      )}
    </>
  );
}
