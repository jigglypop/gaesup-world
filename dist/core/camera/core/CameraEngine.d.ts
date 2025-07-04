import { ICameraController, CameraSystemState, CameraCalcProps, CameraConfig, CameraState, CameraTransition } from './types';
import { BaseCameraEngine } from '../bridge/BaseCameraEngine';
import { CameraEngineConfig } from '../bridge/types';
export declare class CameraEngine extends BaseCameraEngine {
    private controllers;
    private state;
    private cameraStates;
    private currentCameraStateName;
    private cameraTransitions;
    constructor(config: CameraEngineConfig);
    private createInitialState;
    private initializeCameraStates;
    registerController(controller: ICameraController): void;
    updateConfig(config: Partial<CameraConfig>): void;
    update(deltaTime: number): void;
    calculate(props: CameraCalcProps): void;
    getState(): CameraSystemState;
    getCameraState(name: string): CameraState | undefined;
    getCurrentCameraState(): CameraState | undefined;
    addCameraState(name: string, state: CameraState): void;
    setCameraTransitions(transitions: CameraTransition[]): void;
    switchCameraState(name: string): void;
    private registerControllers;
}
