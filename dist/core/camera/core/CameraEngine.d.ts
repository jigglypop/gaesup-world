import { ICameraController, CameraSystemState, CameraCalcProps, CameraConfig } from './types';
import { BaseCameraEngine } from '../bridge/BaseCameraEngine';
import { CameraEngineConfig } from '../bridge/types';
export declare class CameraEngine extends BaseCameraEngine {
    private controllers;
    private state;
    constructor(config: CameraEngineConfig);
    private createInitialState;
    registerController(controller: ICameraController): void;
    updateConfig(config: Partial<CameraConfig>): void;
    update(deltaTime: number): void;
    calculate(props: CameraCalcProps): void;
    getState(): CameraSystemState;
    private registerControllers;
}
