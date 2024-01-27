/// <reference types="react" />
import { Collider } from "@dimforge/rapier3d-compat";
import { urlsType } from "../../../world/context/type";
export declare const VehicleWheelCollider: import("react").ForwardRefExoticComponent<{
    urls: urlsType;
    vehicleSize: THREE.Vector3;
} & import("react").RefAttributes<Collider>>;
export declare const VehicleCollider: import("react").ForwardRefExoticComponent<{
    vehicleSize: THREE.Vector3;
} & import("react").RefAttributes<Collider>>;
