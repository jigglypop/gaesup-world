import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, CameraPropType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';
import { cameraUtils } from '../utils';
import { V3 } from '../../utils/vector';

const tempOffset = new THREE.Vector3();
const tempEuler = new THREE.Euler();

export class ShoulderController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
    isAiming: boolean = false,
  ): THREE.Vector3 {
    const shoulderOffset = cameraOption.shoulderOffset || V3(0.5, 1.6, -2);
    const aimOffset = cameraOption.aimOffset || V3(0.3, 1.6, -1);

    const targetOffset = isAiming ? aimOffset : shoulderOffset;

    tempOffset.copy(targetOffset);
    if (activeState.euler) {
      tempEuler.copy(activeState.euler);
      tempOffset.applyEuler(tempEuler);
    }

    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    return characterPosition.clone().add(tempOffset);
  }

  public override update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState, states },
      cameraOption,
    } = prop;

    if (!state?.camera || !activeState?.position) return;

    const isAiming = states?.isAiming || false;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption, isAiming);

    const deltaTime = (state as any).delta || 0.016;
    const lookTarget =
      cameraOption.target ||
      V3(activeState.position.x, activeState.position.y, activeState.position.z).add(V3(0, 1.5, 0));

    cameraUtils.preventCameraJitter(
      state.camera,
      targetPosition,
      lookTarget,
      isAiming ? 12.0 : 8.0,
      deltaTime
    );
  }
}
