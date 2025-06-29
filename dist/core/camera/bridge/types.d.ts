import { Emitter } from 'mitt';
export type CameraEngineEvents = {
    modeChange: {
        from: string;
        to: string;
    };
    positionUpdate: {
        position: [number, number, number];
        target: [number, number, number];
    };
    configChange: {
        key: string;
        value: any;
    };
    controllerSwitch: {
        from: string;
        to: string;
    };
    error: {
        message: string;
        details?: any;
    };
};
export interface CameraEngineConfig {
    mode: string;
    distance: {
        x: number;
        y: number;
        z: number;
    };
    smoothing: {
        position: number;
        rotation: number;
        fov: number;
    };
    fov: number;
    zoom: number;
    enableCollision: boolean;
    [key: string]: any;
}
export interface ICameraEngineMonitor {
    getState(): {
        mode: string;
        distance: {
            x: number;
            y: number;
            z: number;
        };
        smoothing: {
            position: number;
            rotation: number;
            fov: number;
        };
        fov: number;
        zoom: number;
        enableCollision: boolean;
    };
    getMetrics(): {
        frameCount: number;
        averageFrameTime: number;
        lastUpdateTime: number;
    };
}
export type CameraEngineEmitter = Emitter<CameraEngineEvents>;
