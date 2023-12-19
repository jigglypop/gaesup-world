import { useContext } from "react";
import { controllerInnerType, refsType } from "../../../controller/type";

import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { WrapperRef } from "../common/WrapperRef";
import { AirplaneCollider } from "./collider";

export function AirplaneRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { characterGltf, airplaneGltf } = useContext(GaesupWorldContext);
  return (
    <WrapperRef props={props} refs={refs} gltf={airplaneGltf}>
      {props.isRider && (
        <InnerGroupRef
          props={props}
          gltf={characterGltf}
          ref={refs.characterInnerRef}
        />
      )}
      <AirplaneCollider props={props} />
    </WrapperRef>
  );
}
