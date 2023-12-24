import { passiveRefsType } from "../component/type";
import { gaesupPassivePropsType } from "../hooks/useGaesupController";
export default function mutation({ props, refs, delta, }: {
    props: gaesupPassivePropsType;
    refs: passiveRefsType;
    delta: number;
}): void;
