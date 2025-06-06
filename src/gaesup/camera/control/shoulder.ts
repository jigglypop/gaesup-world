import * as THREE from 'three';
import { CameraPropType } from '../type';

const tempVector3 = new THREE.Vector3();
const tempOffset = new THREE.Vector3();
const tempEuler = new THREE.Euler();

export default function shoulder(prop: CameraPropType): void {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;

  if (!state?.camera || !activeState?.position) return;

  const shoulderOffset = cameraOption.shoulderOffset || new THREE.Vector3(0.5, 1.6, -2);
  const aimOffset = cameraOption.aimOffset || new THREE.Vector3(0.3, 1.6, -1);

  const isAiming = (prop.worldContext as any)?.states?.isAiming || false;
  const targetOffset = isAiming ? aimOffset : shoulderOffset;

  tempOffset.copy(targetOffset);
  if (activeState.euler) {
    tempEuler.copy(activeState.euler);
    tempOffset.applyEuler(tempEuler);
  }

  const targetPosition = tempVector3.copy(activeState.position).add(tempOffset);

  const lerpSpeed = isAiming ? 0.2 : 0.1;
  const deltaTime = prop.state?.delta || 0.016;

  const lookTarget =
    cameraOption.lookTarget ||
    tempVector3.copy(activeState.position).add(new THREE.Vector3(0, 1.5, 0));

  cameraUtils.preventCameraJitter(
    state.camera,
    targetPosition,
    lookTarget,
    isAiming ? 12.0 : 8.0,
    deltaTime,
  );
}
