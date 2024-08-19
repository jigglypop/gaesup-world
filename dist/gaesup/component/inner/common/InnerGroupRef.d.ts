import * as THREE from "three";
export declare const InnerGroupRef: import("react").ForwardRefExoticComponent<{
    children?: React.ReactNode;
    objectNode: THREE.Object3D;
    animationRef: import("react").MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
    nodes: {
        [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
    };
    isActive?: boolean;
    ridingUrl?: string;
    offset?: THREE.Vector3;
    parts?: import("../../../controller/type").partsType;
} & import("./type").ridingType & import("react").RefAttributes<THREE.Group<THREE.Object3DEventMap>>>;
