import { useContext } from "react";
import { controllerInnerType, refsType } from "../controller/type";
import { GaesupWorldContext } from "../world/context";
import { urlsType } from "../world/context/type";
import { CharacterRef } from "./active/character";

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
  // useEffect(() => {
  //   calculation(props);
  // }, []);

  return (
    <>
      {mode.type === "character" && (
        <CharacterRef props={props} refs={refs} urls={urls} />
      )}
      {/* {mode.type === "vehicle" && (
        <VehicleRef
          props={props}
          groundRay={props.groundRay}
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
          props={props}
          groundRay={props.groundRay}
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
      )} */}
    </>
  );
}
