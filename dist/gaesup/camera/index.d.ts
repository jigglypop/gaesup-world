import { propType, refsType } from "../controller/type";
export default function Camera({ refs, prop, control, }: {
    refs: refsType;
    prop: propType;
    control: {
        [key: string]: boolean;
    };
}): import("react/jsx-runtime").JSX.Element;
