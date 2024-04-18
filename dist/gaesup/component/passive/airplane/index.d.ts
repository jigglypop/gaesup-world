/// <reference types="react" />
import { CollisionEnterPayload, RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { urlsType } from "../../../world/context/type";
export type passiveAirplanePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    urls: urlsType;
    currentAnimation: string;
    offset?: THREE.Vector3;
    children?: React.ReactNode;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    type?: RigidBodyTypeString;
};
export declare function PassiveAirplane(props: passiveAirplanePropsType): import("react/jsx-runtime").JSX.Element;
