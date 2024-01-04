import { useContext } from "react";
import initCallback from "../../../controller/initialize/callback";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { CharacterCapsuleCollider } from "./collider";

import playCharacterActions from "../../../animation/actions";
import { WrapperRef } from "../common/WrapperRef";

export function CharacterRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  initCallback(props);

  const { characterGltf } = useContext(GaesupWorldContext);
  const { ref } = playCharacterActions({
    groundRay: props.groundRay,
  });
  return (
    <WrapperRef
      props={props}
      refs={refs}
      gltf={characterGltf}
      animationRef={ref}
      name={"character"}
    >
      <CharacterCapsuleCollider props={props} ref={refs.capsuleColliderRef} />
    </WrapperRef>
  );
}
