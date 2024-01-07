import { useContext } from "react";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { WrapperRef } from "../common/WrapperRef";
import { VehicleCollider } from "./collider";
import { Wheels } from "./wheels";

export function VehicleRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { url, vehicleGltf } = useContext(GaesupWorldContext);

  return (
    <WrapperRef
      props={props}
      refs={refs}
      gltf={vehicleGltf}
      outerChildren={url.wheelUrl ? <Wheels props={props} /> : <></>}
    >
      <VehicleCollider />
    </WrapperRef>
  );
}
