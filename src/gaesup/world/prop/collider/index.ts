import { Dispatch } from "react";
import { gaesupWorldPropType } from "../../../stores/context";
import { airplane } from "./airplane";
import { character } from "./character";
import getGltf from "./gltf";
import { vehicle } from "./vehicle";

export default function initColider(
  value: gaesupWorldPropType,
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>
) {
  const gltf = getGltf(value, dispatch);
  character(gltf, value, dispatch);
  vehicle(gltf, value, dispatch);
  airplane(gltf, value, dispatch);
}
