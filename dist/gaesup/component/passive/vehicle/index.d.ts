/// <reference types="react" />
import { CollisionEnterPayload, RigidBodyTypeString } from "@react-three/rapier";
import * as THREE from "three";
import { urlsType } from "../../../world/context/type";
export type passiveVehiclePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    urls: urlsType;
    currentAnimation: string;
    children?: React.ReactNode;
    offset?: THREE.Vector3;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    type?: RigidBodyTypeString;
};
export declare function PassiveVehicle(props: passiveVehiclePropsType): import("react/jsx-runtime").JSX.Element;
