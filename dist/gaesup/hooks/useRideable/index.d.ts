import { CollisionEnterPayload } from "@react-three/rapier";
import { rideableType } from "./type";
export declare const rideableDefault: {
    objectkey: any;
    objectType: any;
    isRiderOn: boolean;
    url: any;
    wheelUrl: any;
    position: import("three").Vector3;
    rotation: import("three").Euler;
    offset: import("three").Vector3;
    visible: boolean;
};
export declare function useRideable(): {
    initRideable: (props: rideableType) => void;
    setRideable: (props: rideableType) => void;
    getRideable: (objectkey: string) => rideableType;
    ride: (e: CollisionEnterPayload, props: rideableType) => Promise<void>;
    landing: (objectkey: string) => void;
};
