import * as THREE from 'three';
export declare function MinimapPlatform({ id, position, size, label, children, }: {
    id: string;
    position: THREE.Vector3 | [number, number, number];
    size: THREE.Vector3 | [number, number, number];
    label: string;
    children?: React.ReactNode;
}): import("react").JSX.Element;
export declare function MinimapObject({ id, position, emoji, size, children, }: {
    id: string;
    position: THREE.Vector3 | [number, number, number];
    emoji: string;
    size?: THREE.Vector3 | [number, number, number];
    children?: React.ReactNode;
}): import("react").JSX.Element;
