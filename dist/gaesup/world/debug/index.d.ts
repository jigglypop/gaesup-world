import { dispatchType } from "../../utils/type";
import { gaesupWorldContextType } from "../context/type";
export default function initDebug({ value, dispatch, }: {
    value: Partial<gaesupWorldContextType>;
    dispatch: dispatchType<gaesupWorldContextType>;
}): void;
