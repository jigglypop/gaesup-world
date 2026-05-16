import { ICameraController, CameraCalcProps, CameraState, CameraTransition } from './types';
import { BaseCameraSystem } from '../bridge/BaseCameraSystem';
import { CameraSystemConfig } from '../bridge/types';
export declare class CameraSystem extends BaseCameraSystem {
    private controllers;
    private state;
    private cameraStates;
    private currentCameraStateName;
    private cameraTransitions;
    constructor(config: CameraSystemConfig);
    private createInitialState;
    private initializeCameraStates;
    registerController(controller: ICameraController): void;
    updateConfig(config: Partial<CameraSystemConfig>): void;
    update(deltaTime: number): void;
    calculate(props: CameraCalcProps): void;
    getCameraState(name: string): CameraState | undefined;
    getCurrentCameraState(): CameraState | undefined;
    addCameraState(name: string, state: CameraState): void;
    setCameraTransitions(transitions: CameraTransition[]): void;
    switchCameraState(name: string): void;
    private registerControllers;
}
