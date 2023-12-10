import { Dispatch } from "react";
import { gaesupWorldPropType } from "../stores/context";

export type gaesupWorldInitType = {
  value: gaesupWorldPropType;
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>;
};
