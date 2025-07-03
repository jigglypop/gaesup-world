import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
export declare class FixedController extends BaseController {
    name: string;
    defaultConfig: Partial<CameraConfig>;
    calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
    overridecalculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
}
