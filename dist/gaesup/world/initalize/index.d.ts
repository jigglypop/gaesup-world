/// <reference types="react" />
import { gaesupWorldPropsType } from "../type";
export default function initGaesupWorld(props: gaesupWorldPropsType): {
    gaesupProps: {
        value: any;
        dispatch: import("react").DispatchWithoutAction;
    };
};
