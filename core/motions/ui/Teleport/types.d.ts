import { CSSProperties } from 'react';
import * as THREE from 'three';
export type TeleportProps = {
    text?: string;
    position: THREE.Vector3;
    teleportStyle?: CSSProperties;
    cooldown?: number;
    range?: number;
    effect?: 'fade' | 'warp' | 'instant';
    onTeleportStart?: () => void;
    onTeleportComplete?: () => void;
    onTeleportFailed?: (reason: string) => void;
};
