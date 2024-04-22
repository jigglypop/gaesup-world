import * as THREE from "three";
export declare function useFocus(): {
    open: () => Promise<void>;
    close: () => Promise<void>;
    on: () => Promise<void>;
    off: () => Promise<void>;
    focus: ({ zoom, target, position, }: {
        zoom?: number;
        target: THREE.Vector3;
        position: THREE.Vector3;
    }) => Promise<void>;
    free: ({ zoom }: {
        zoom?: number;
    }) => Promise<void>;
    focusOn: ({ zoom, target, position, }: {
        zoom?: number;
        target: THREE.Vector3;
        position: THREE.Vector3;
    }) => Promise<void>;
    focusOff: ({ zoom }: {
        zoom?: number;
    }) => Promise<void>;
};
