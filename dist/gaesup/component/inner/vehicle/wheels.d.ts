import { RapierRigidBody } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";
export declare function WheelsRef({ vehicleSize, rigidBodyRef, wheelUrl, }: {
    vehicleSize: THREE.Vector3;
    rigidBodyRef: RefObject<RapierRigidBody>;
    wheelUrl: string;
}): import("react/jsx-runtime").JSX.Element;
