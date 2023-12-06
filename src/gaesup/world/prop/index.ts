import { gaesupWorldPropType } from "@/gaesup/stores/context";
import { Dispatch } from "react";
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
