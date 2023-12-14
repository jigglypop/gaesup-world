import { Dispatch } from "react";
import { gaesupWorldPropType } from "./context/type";
export type gaesupWorldInitType = {
    value: gaesupWorldPropType;
    dispatch: Dispatch<{
        type: string;
        payload?: Partial<gaesupWorldPropType>;
    }>;
};
