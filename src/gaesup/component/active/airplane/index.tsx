import { useContext } from "react";
import { controllerInnerType, refsType } from "../../../controller/type";

import { GaesupWorldContext } from "../../../world/context";
import { WrapperRef } from "../common/WrapperRef";
import { AirplaneCollider } from "./collider";

export function AirplaneRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { airplaneGltf } = useContext(GaesupWorldContext);
  return (
    <WrapperRef props={props} refs={refs} gltf={airplaneGltf}>
      <AirplaneCollider props={props} />
    </WrapperRef>
  );
}
