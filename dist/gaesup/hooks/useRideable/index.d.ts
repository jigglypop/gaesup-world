import { CollisionEnterPayload } from "@react-three/rapier";
import * as THREE from "three";
export declare const rideableDefault: {
    objectkey: any;
    objectType: any;
    isRiderOn: boolean;
    url: any;
    wheelUrl: any;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    offset: THREE.Vector3;
    visible: boolean;
};
export type rideableType = {
    objectkey: string;
    objectType?: "vehicle" | "airplane";
    enableRiding?: boolean;
    isRiderOn?: boolean;
    url?: string;
    wheelUrl?: string;
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    offset?: THREE.Vector3;
    landingOffset?: THREE.Vector3;
    visible?: boolean;
    vehicleSize?: THREE.Vector3;
    wheelSize?: THREE.Vector3;
    airplaneSize?: THREE.Vector3;
};
export declare function useRideable(): {
    initRideable: (props: rideableType) => void;
    setRideable: (props: rideableType) => void;
    getRideable: (objectkey: string) => rideableType;
    ride: (e: CollisionEnterPayload, props: rideableType) => Promise<void>;
    landing: (objectkey: string) => void;
};
