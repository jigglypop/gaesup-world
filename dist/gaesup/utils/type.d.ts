import { Dispatch } from "react";
export type dispatchType<T> = Dispatch<{
    type: string;
    payload?: Partial<T>;
}>;
