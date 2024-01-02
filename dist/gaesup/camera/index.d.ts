import { controllerInnerType, refsType } from "../controller/type";
export default function Camera({ refs, prop, control, }: {
    refs: refsType;
    prop: controllerInnerType;
    control: {
        [key: string]: boolean;
    };
}): import("react/jsx-runtime").JSX.Element;
