import { ReactNode } from "react";
import * as THREE from "three";
import { urlsType } from "../../../world/context/type";
export type riderRefType = {
    urls: urlsType;
    children?: ReactNode;
    offset?: THREE.Vector3;
    euler?: THREE.Euler;
    currentAnimation?: string;
};
export default function RiderRef({ urls, children, offset, euler, currentAnimation, }: riderRefType): import("react/jsx-runtime").JSX.Element;
