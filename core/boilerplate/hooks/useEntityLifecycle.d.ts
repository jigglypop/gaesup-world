import * as THREE from 'three';
export interface EntityLifecycleOptions {
    onReady?: () => void;
    onFrame?: () => void;
    onAnimate?: () => void;
    onDestroy?: () => void;
    actions?: Record<string, THREE.AnimationAction | null>;
}
export declare function useEntityLifecycle(options: EntityLifecycleOptions): void;
