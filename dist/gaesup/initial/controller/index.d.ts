/// <reference types="react" />
import * as THREE from "three";
import { constantType, controllerType, groundRayType, refsType, slopeRayType } from "../../controller/type";
import { keyControlType } from "../../world/context/type";
export default function initControllerProps({ props, refs, }: {
    props: controllerType;
    refs: refsType;
}): {
    children?: import("react").ReactNode;
    groupProps?: import("@react-three/fiber").GroupProps;
    rigidBodyProps?: import("@react-three/rapier").RigidBodyProps;
    slopeRay: slopeRayType;
    groundRay: groundRayType;
    cameraRay: import("../../camera/type").cameraRayType;
    constant: constantType;
    capsuleColliderRef: import("react").RefObject<import("@react-three/rapier").RapierCollider>;
    rigidBodyRef: import("react").RefObject<import("@react-three/rapier").RapierRigidBody>;
    outerGroupRef: import("react").RefObject<THREE.Group<THREE.Object3DEventMap>>;
    innerGroupRef: import("react").RefObject<THREE.Group<THREE.Object3DEventMap>>;
    slopeRayOriginRef: import("react").RefObject<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], THREE.Object3DEventMap>>;
    jointRefs?: import("react").RefObject<import("@dimforge/rapier3d-compat").RevoluteImpulseJoint>;
    characterUrl?: string;
    kartUrl?: string;
    airplaneUrl?: string;
    keyControl: keyControlType;
    debug?: boolean;
    callbacks?: import("../callback/type").callbackType;
    isRider?: boolean;
};
