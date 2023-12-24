/// <reference types="react" />
import { Collider } from "@dimforge/rapier3d-compat";
import { urlType, vehicleColliderType } from "../../../world/context/type";
export declare const VehicleCollider: import("react").ForwardRefExoticComponent<{
    collider: vehicleColliderType;
    url: urlType;
} & import("react").RefAttributes<Collider>>;
