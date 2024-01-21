import { RapierRigidBody } from "@react-three/rapier";
import { ReactNode } from "react";
import { controllerInnerType } from "../../../controller/type";
export declare const RigidBodyRef: import("react").ForwardRefExoticComponent<{
    children: ReactNode;
    name?: string;
} & import("react").RefAttributes<RapierRigidBody>>;
export declare const PassiveRigidBodyRef: import("react").ForwardRefExoticComponent<{
    props: controllerInnerType;
    children: ReactNode;
} & import("react").RefAttributes<RapierRigidBody>>;
