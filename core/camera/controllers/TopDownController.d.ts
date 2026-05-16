import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
export declare class TopDownController extends BaseController {
    name: string;
    private target;
    private offset;
    private yawQuaternion;
    private pitchQuaternion;
    private readonly topDownXAxis;
    private readonly topDownYAxis;
    defaultConfig: Partial<CameraConfig>;
    calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
}
