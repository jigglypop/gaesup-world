/// <reference types="react" />
import { CollisionEnterPayload } from "@react-three/rapier";
import { urlsType } from "../../../world/context/type";
export type passiveVehiclePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    urls: urlsType;
    currentAnimation: string;
    children?: React.ReactNode;
    offset?: THREE.Vector3;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};
export declare function PassiveVehicle(props: passiveVehiclePropsType): import("react/jsx-runtime").JSX.Element;
