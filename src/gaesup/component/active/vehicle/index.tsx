import { VehicleInnerRef } from "../../inner/vehicle";
import { activeVehicleInnerType } from "./type";

export function VehicleRef({
  children,
  controllerOptions,
  enableRiding,
  isRiderOn,
  offset,
  refs,
  urls,
}: activeVehicleInnerType) {
  return (
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      name={"vehicle"}
      controllerOptions={controllerOptions}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
      {...refs}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"vehicle"}
    >
      {children}
    </VehicleInnerRef>
  );
}
