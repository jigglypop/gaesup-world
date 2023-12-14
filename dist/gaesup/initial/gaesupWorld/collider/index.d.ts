import { Dispatch } from "react";
import { gaesupWorldPropType } from "../../../world/context/type";
export default function initColider(value: gaesupWorldPropType, dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
}>): void;
