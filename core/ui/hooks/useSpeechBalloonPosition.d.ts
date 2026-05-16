import { Sprite } from 'three';
import * as THREE from 'three';
export interface UseSpeechBalloonPositionProps {
    playerPosition: THREE.Vector3;
    offset: {
        x: number;
        y: number;
        z: number;
    };
}
export declare function useSpeechBalloonPosition({ playerPosition, offset }: UseSpeechBalloonPositionProps): import("react").RefObject<Sprite<THREE.Object3DEventMap> | null>;
