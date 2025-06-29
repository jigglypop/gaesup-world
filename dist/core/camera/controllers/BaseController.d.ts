import * as THREE from 'three';
import { ICameraController, CameraCalcProps, CameraSystemState, CameraSystemConfig } from '../core/types';
export declare abstract class BaseController implements ICameraController {
    abstract name: string;
    abstract defaultConfig: Partial<CameraSystemConfig>;
    abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
    calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
    update(props: CameraCalcProps, state: CameraSystemState): void;
}
