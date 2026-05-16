import * as THREE from 'three';
export interface CameraDebugInfo {
    position: THREE.Vector3;
    target: THREE.Vector3;
    distance: number;
    fov: number;
    state: string;
    timestamp: number;
}
export declare class CameraDebugger {
    private isEnabled;
    private positionHistory;
    private debugInfo;
    private maxHistoryLength;
    private cleanupInterval;
    private disposables;
    private debugLines;
    private scene;
    constructor(scene?: THREE.Scene);
    enable(scene?: THREE.Scene): void;
    disable(): void;
    private setupCleanupInterval;
    private setupEventListeners;
    private handleResize;
    update(camera: THREE.Camera, deltaTime: number, state?: string): void;
    private addPositionToHistory;
    private addDebugInfo;
    private updateDebugVisuals;
    private clearDebugLines;
    private cleanupOldHistory;
    getDebugInfo(): CameraDebugInfo[];
    getPositionHistory(): THREE.Vector3[];
    exportData(): string;
    clearDebugInfo(): void;
    private cleanup;
    dispose(): void;
}
