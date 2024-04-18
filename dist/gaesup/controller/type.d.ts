import { Collider, Ray, RayColliderToi } from "@dimforge/rapier3d-compat";
import { GroupProps, Props } from "@react-three/fiber";
import { PhysicsProps, RapierRigidBody, RigidBodyProps } from "@react-three/rapier";
import { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { cameraRayType } from "../camera/type";
import { keyControlType, urlsType } from "../world/context/type";
import { airplaneType, characterType, vehicleType } from "./context/type";
import { callbackType } from "./initialize/callback/type";
export type optionsType = {
    debug: boolean;
    mode?: "normal" | "vehicle" | "airplane";
    controllerType: "none" | "gameboy" | "joystick" | "keyboard";
    cameraCollisionType: "transparent" | "closeUp";
    camera: {
        type: "perspective" | "orthographic";
        control: "orbit" | "normal";
    };
    minimap: boolean;
    minimapRatio: number;
};
export type partialOptionsType = Partial<optionsType>;
export type jumpInnerType = {
    velocity: THREE.Vector3;
    direction: THREE.Vector3;
};
export type jumpConstType = {
    speed: number;
    gravity: number;
};
export type jumpPropType = jumpInnerType & jumpConstType;
export type rayType = {
    origin: THREE.Vector3;
    hit: RayColliderToi | null;
    rayCast: Ray | null;
    dir: THREE.Vector3;
    offset: THREE.Vector3;
    length: number;
    current?: THREE.Vector3;
    angle?: number;
    parent?: RapierRigidBody | null | undefined;
};
export type slopeRayType = Omit<rayType, "parent">;
export type groundRayType = Omit<rayType, "current" | "angle">;
export type controllerInnerType = {
    name?: string;
    groundRay: groundRayType;
    cameraRay: cameraRayType;
    keyControl: keyControlType;
} & controllerOtherPropType & refsType & callbackType;
export type animationTagType = {
    idle: string;
    walk: string;
    run: string;
    jump: string;
    jumpIdle: string;
    jumpLand: string;
    fall: string;
    ride: string;
    land: string;
    sit: string;
};
export type actionsType = animationTagType & {
    [key: string]: string;
};
export type refsType = {
    colliderRef: RefObject<Collider>;
    rigidBodyRef: RefObject<RapierRigidBody>;
    outerGroupRef: RefObject<THREE.Group>;
    innerGroupRef: RefObject<THREE.Group>;
    characterInnerRef: RefObject<THREE.Group>;
};
export type gaesupControllerContextPropType = {
    airplane: airplaneType;
    vehicle: vehicleType;
    character: characterType;
    urls: urlsType;
};
export interface controllerOtherPropType extends RigidBodyProps {
    children?: ReactNode;
    groupProps?: GroupProps;
    rigidBodyProps?: RigidBodyProps;
    debug?: boolean;
    CanvasProps?: Partial<Props>;
    PhysicsProps?: Partial<PhysicsProps>;
}
export type controllerType = controllerOtherPropType & Partial<gaesupControllerContextPropType> & callbackType;
