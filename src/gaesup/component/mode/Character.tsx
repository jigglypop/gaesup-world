import { controllerInnerType, refsType } from "../../controller/type";
import calculation from "../../physics";
import { CharacterRef } from "../ref/character";

export function Character({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  calculation(props);
  return <CharacterRef props={props} refs={refs} isPassive={false} />;
}
