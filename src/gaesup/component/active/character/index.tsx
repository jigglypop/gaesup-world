import { controllerInnerType, refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
import { CharacterInnerRef } from "../../inner/character";

export function CharacterRef({
  props,
  refs,
  urls,
}: {
  props: controllerInnerType;
  refs: refsType;
  urls: urlsType;
}) {
  return (
    <CharacterInnerRef
      refs={refs}
      urls={urls}
      outerGroupRef={refs.outerGroupRef}
      innerGroupRef={refs.innerGroupRef}
      rigidBodyRef={refs.rigidBodyRef}
      colliderRef={refs.colliderRef}
      isActive={true}
      componentType="character"
    >
      {props.children}
    </CharacterInnerRef>
  );
}
