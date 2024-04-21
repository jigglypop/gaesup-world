import { AirplaneInnerRef } from "../../inner/airplane";
import { activeAirplaneInnerType } from "./type";

export function AirplaneRef({
  children,
  controllerOptions,
  enableRiding,
  isRiderOn,
  offset,
  refs,
  urls,
}: activeAirplaneInnerType) {
  return (
    <AirplaneInnerRef
      refs={refs}
      urls={urls}
      name={"airplane"}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
      {...refs}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"airplane"}
      controllerOptions={controllerOptions}
    >
      {children}
    </AirplaneInnerRef>
  );
}
