import { innerColliderPropType } from "../type";
import { airplane } from "./airplane";
import { character } from "./character";
import getGltf from "./gltf";
import { vehicle } from "./vehicle";

export default function initColider({
  value,
  dispatch,
}: innerColliderPropType) {
  const colliderProps: innerColliderPropType = {
    gltf: null,
    value,
    dispatch,
  };
  const gltf = getGltf(colliderProps);
  colliderProps.gltf = gltf;
  character(colliderProps);
  vehicle(colliderProps);
  airplane(colliderProps);
}
