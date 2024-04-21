import { VehicleInnerRef } from "../../inner/vehicle";
import { activeVehicleInnerType } from "./type";

export function VehicleRef(props: activeVehicleInnerType) {
  return (
    <VehicleInnerRef
      name={"vehicle"}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"vehicle"}
      {...props}
    >
      {props.children}
    </VehicleInnerRef>
  );
}
