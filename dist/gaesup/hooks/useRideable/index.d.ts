import { CollisionEnterPayload } from "@react-three/rapier";
import { rideableType } from "../../world/context/type";
/**
 * Default rideable object properties.
 * @type {Object}
 */
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
/**
 * Custom hook for managing rideable objects.
 * @returns {Object} An object containing functions to initialize, set, get, ride, and land rideable objects.
 */
export declare function useRideable(): {
    initRideable: (props: rideableType) => void;
    setRideable: (props: rideableType) => void;
    getRideable: (objectkey: string) => rideableType;
    ride: (e: CollisionEnterPayload, props: rideableType) => Promise<void>;
    landing: (objectkey: string) => void;
};
