import { Dispatch } from "react";
import { gaesupWorldPropType } from "../../stores/context";
import initColider from "./collider";

export default function initProp(
  value: gaesupWorldPropType,
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>
) {
  initColider(value, dispatch);
}
