import * as THREE from "three";
import { controllerOptionsType } from "../../controller/type";
export type rideablePropType = {
    objectkey: string;
    objectType?: "vehicle" | "airplane";
    controllerOptions: controllerOptionsType;
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
