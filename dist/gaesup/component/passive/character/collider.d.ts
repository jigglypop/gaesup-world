/// <reference types="react" />
import { Collider } from "@dimforge/rapier3d-compat";
import { characterColliderType } from "../../../world/context/type";
export declare const CharacterCapsuleCollider: import("react").ForwardRefExoticComponent<{
    collider: characterColliderType;
} & import("react").RefAttributes<Collider>>;
