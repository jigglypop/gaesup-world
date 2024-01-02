/// <reference types="react" />
import { RapierRigidBody } from "@react-three/rapier";
export type useSetWheelType = {
    wheelPositions: [number, number, number][];
};
export declare function Wheels({ vehicleSize, wheelSize, rigidBodyRef, url, }: {
    vehicleSize: THREE.Vector3;
    wheelSize: THREE.Vector3;
    rigidBodyRef: React.MutableRefObject<RapierRigidBody>;
    url: string;
}): import("react/jsx-runtime").JSX.Element;
