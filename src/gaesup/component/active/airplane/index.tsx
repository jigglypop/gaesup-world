import { AirplaneInnerRef } from "../../inner/airplane";
import { activeAirplaneInnerType } from "./type";

export function AirplaneRef(props: activeAirplaneInnerType) {
  return (
    <AirplaneInnerRef
      name={"airplane"}
      isActive={true}
      currentAnimation={"idle"}
      componentType={"airplane"}
      {...props}
    >
      {props.children}
    </AirplaneInnerRef>
  );
}
