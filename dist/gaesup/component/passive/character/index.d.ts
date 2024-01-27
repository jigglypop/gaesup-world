/// <reference types="react" />
import { urlsType } from "../../../world/context/type";
export type passiveCharacterPropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    urls: urlsType;
    currentAnimation: string;
    children?: React.ReactNode;
};
export declare function PassiveCharacter(props: passiveCharacterPropsType): import("react/jsx-runtime").JSX.Element;
