/// <reference types="react" />
import { propType } from "../../controller/type";
export default function initDebug(prop: propType): {
    children?: import("react").ReactNode;
    groupProps?: import("@react-three/fiber").GroupProps;
    rigidBodyProps?: import("@react-three/rapier").RigidBodyProps;
    slopeRay: import("../../controller/type").slopeRayType;
    groundRay: import("../../controller/type").groundRayType;
    cameraRay: import("../../camera/type").cameraRayType;
    constant: import("../../controller/type").constantType;
    capsuleColliderRef: import("react").RefObject<import("@dimforge/rapier3d-compat").Collider>;
    rigidBodyRef: import("react").RefObject<import("@dimforge/rapier3d-compat").RigidBody>;
    outerGroupRef: import("react").RefObject<import("three").Group<import("three").Object3DEventMap>>;
    innerGroupRef: import("react").RefObject<import("three").Group<import("three").Object3DEventMap>>;
    slopeRayOriginRef: import("react").RefObject<import("three").Mesh<import("three").BufferGeometry<import("three").NormalBufferAttributes>, import("three").Material | import("three").Material[], import("three").Object3DEventMap>>;
    jointRefs?: import("react").RefObject<import("@dimforge/rapier3d-compat").RevoluteImpulseJoint>;
    characterUrl?: string;
    kartUrl?: string;
    airplaneUrl?: string;
    keyControl: import("../../world/context/type").keyControlType;
    debug?: boolean;
    callbacks?: import("../callback/type").callbackType;
    isRider?: boolean;
};
