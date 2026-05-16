import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
export declare class ThirdPersonController extends BaseController {
    name: string;
    private target;
    private offset;
    defaultConfig: Partial<CameraConfig>;
    calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
}
