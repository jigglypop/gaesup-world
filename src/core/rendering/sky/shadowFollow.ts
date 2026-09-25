import { Vector3 } from 'three';
import type { Camera, DirectionalLight } from 'three';

const WORLD_UP = new Vector3(0, 1, 0);
const right = new Vector3();
const up = new Vector3();
const direction = new Vector3();
const forward = new Vector3();
const center = new Vector3();

/** Ground point ahead of the camera, where a shadow box of half-size `range` covers most of the view. */
export function shadowFocus(camera: Camera, range: number, out: Vector3): Vector3 {
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() > 1e-8) forward.normalize().multiplyScalar(range * 0.4);
  return out.set(camera.position.x + forward.x, 0, camera.position.z + forward.z);
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Centers a directional light's shadow camera on `focus`, snapped to whole shadow-map texels so the map does not
 * shimmer as the focus moves. The depth axis is snapped too, so sub-texel moves leave the light where it is.
 * `offset` points from the target to the light.
 */
export function placeShadowLight(light: DirectionalLight, focus: Vector3, offset: Vector3, texelSize: number): void {
  direction.copy(offset).normalize();
  right.crossVectors(WORLD_UP, direction);
  if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
  right.normalize();
  up.crossVectors(direction, right);
  center.copy(direction).multiplyScalar(snap(focus.dot(direction), texelSize))
    .addScaledVector(right, snap(focus.dot(right), texelSize))
    .addScaledVector(up, snap(focus.dot(up), texelSize));
  light.target.position.copy(center);
  light.target.updateMatrixWorld();
  light.position.copy(center).add(offset);
}
