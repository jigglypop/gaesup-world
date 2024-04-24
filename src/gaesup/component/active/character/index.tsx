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
      url={urls.characterUrl}
      isActive={true}
      componentType="character"
      rigidbodyType={"dynamic"}
      controllerOptions={props.controllerOptions}
      groundRay={props.groundRay}
      onAnimate={props.onAnimate}
      onFrame={props.onFrame}
      onReady={props.onReady}
      onDestory={props.onDestory}
      {...refs}
    >
      {props.children}
    </CharacterInnerRef>
  );
}
