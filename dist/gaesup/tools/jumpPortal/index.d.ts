import { CSSProperties } from "react";
import * as THREE from "three";
import "./style.css";
export type JumpPortalType = {
    text?: string;
    position: THREE.Vector3;
    jumpPortalStyle?: CSSProperties;
};
export declare function JumpPortal({ text, position, jumpPortalStyle, }: JumpPortalType): import("react/jsx-runtime").JSX.Element;
