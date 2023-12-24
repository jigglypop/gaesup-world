/// <reference types="react" />
import { RapierRigidBody } from "@react-three/rapier";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
export type useSetWheelType = {
    wheelPositions: [number, number, number][];
};
export declare function Wheels({ props, rigidBodyRef, url, }: {
    props: gaesupPassivePropsType;
    rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
    url: string;
}): import("react/jsx-runtime").JSX.Element;
