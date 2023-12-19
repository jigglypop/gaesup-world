import { useContext } from "react";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "../common/InnerGroupRef";
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
  const { url, characterGltf, vehicleGltf } = useContext(GaesupWorldContext);
  return (
    <WrapperRef
      props={props}
      refs={refs}
      gltf={vehicleGltf}
      outerChildren={url.wheelUrl ? <Wheels props={props} /> : <></>}
    >
      {props.isRider && (
        <InnerGroupRef
          props={props}
          gltf={characterGltf}
          ref={refs.characterInnerRef}
        />
      )}
      <VehicleCollider />
    </WrapperRef>
  );
}
