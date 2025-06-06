import * as THREE from 'three';
import { CameraPropType } from '../type';

const tempVector3 = new THREE.Vector3();

export default function isometric(prop: CameraPropType): void {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;
  if (!state?.camera || !activeState?.position) return;
  const distance = cameraOption.distance || 20;
  const angle = cameraOption.isoAngle || Math.PI / 4;
  const targetPosition = tempVector3.set(
    activeState.position.x + distance * Math.cos(angle),
    activeState.position.y + distance,
    activeState.position.z + distance * Math.sin(angle),
  );

  state.camera.position.lerp(targetPosition, 0.1);
  state.camera.lookAt(activeState.position);

  if (state.camera instanceof THREE.OrthographicCamera) {
    const zoom = cameraOption.zoom || 1;
    state.camera.zoom = zoom;
    state.camera.updateProjectionMatrix();
  }
}
