import { ReactNode } from "react";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
import { passiveRefsType } from "../../type";
export declare function PassiveWrapperRef({ children, outerChildren, props, refs, url, }: {
    children: ReactNode;
    outerChildren?: ReactNode;
    props: gaesupPassivePropsType;
    refs: passiveRefsType;
    url: string;
}): import("react/jsx-runtime").JSX.Element;
