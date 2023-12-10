import { Dispatch } from "react";
import { gaesupWorldPropType } from "../stores/context/gaesupworld/type";

export type gaesupWorldInitType = {
  value: gaesupWorldPropType;
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>;
};
