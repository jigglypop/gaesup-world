import * as THREE from 'three';
import { ICameraController, CameraCalcProps, CameraSystemState, CameraSystemConfig } from '../core/types';
export declare abstract class BaseController implements ICameraController {
    abstract name: string;
    abstract defaultConfig: Partial<CameraSystemConfig>;
    abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
    private focusTarget;
    private focusDirection;
    private focusBasePosition;
    private focusTargetPosition;
    private orbitRight;
    private orbitYawQuaternion;
    private orbitPitchQuaternion;
    private readonly xAxis;
    private readonly yAxis;
    private applyDefaults;
    calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
    protected applyOrbitOffset(offset: THREE.Vector3, state: CameraSystemState): THREE.Vector3;
    update(props: CameraCalcProps, state: CameraSystemState): void;
}
