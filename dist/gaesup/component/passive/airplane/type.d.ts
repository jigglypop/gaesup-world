/// <reference types="react" />
import { CollisionEnterPayload } from "@react-three/rapier";
export type passiveAirplanePropsType = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    airplaneSize: THREE.Vector3;
    airplaneUrl: string;
    currentAnimation: string;
    children?: React.ReactNode;
    gravity?: number;
    onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
};
