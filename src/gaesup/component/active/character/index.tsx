import { vec3 } from "@react-three/rapier";
import playActions, { subscribeActions } from "../../../animation/actions";
import initCallback from "../../../controller/initialize/callback";
import { controllerInnerType, refsType } from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlsType } from "../../../world/context/type";
import {
  CharacterInnerRef,
  calcCharacterColliderProps,
} from "../../inner/character";
import { setGroundRay } from "../../inner/common/setGroundRay";

export function CharacterRef({
  props,
  refs,
  urls,
}: {
  props: controllerInnerType;
  refs: refsType;
  urls: urlsType;
}) {
  const { colliderRef } = refs;
  const { size, gltf } = useGltfAndSize({ url: urls.characterUrl });
  const collider = calcCharacterColliderProps(size);
  props.groundRay.offset = vec3({
    x: 0,
    y: collider?.halfHeight ? -collider?.halfHeight : -1,
    z: 0,
  });

  setGroundRay({
    groundRay: props.groundRay,
    length: (collider?.height || 0) + 2,
    // length: collider?.radius || 0 + 2,
    colliderRef,
  });
  const { animationResult } = subscribeActions({
    type: "character",
    groundRay: props.groundRay,
    animations: gltf.animations,
  });
  const { animationRef, currentAnimation } = playActions({
    type: "character",
    animationResult,
  });
  // callback
  initCallback({
    props,
    animationResult,
    type: "character",
  });

  return (
    <CharacterInnerRef
      animationRef={animationRef}
      refs={refs}
      urls={urls}
      currentAnimation={currentAnimation}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
