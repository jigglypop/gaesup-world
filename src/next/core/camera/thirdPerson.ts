export type ThirdPersonCameraConfig = {
  distance: number;
  height: number;
  lookHeight: number;
  smoothing: number;
};

export const DEFAULT_THIRD_PERSON_CAMERA_CONFIG: ThirdPersonCameraConfig = {
  distance: 9,
  height: 4.5,
  lookHeight: 1.5,
  smoothing: 8,
};

export function computeThirdPersonCamera(
  targetX: number,
  targetY: number,
  targetZ: number,
  yaw: number,
  config: ThirdPersonCameraConfig,
  outEye: Float32Array,
  outLook: Float32Array,
): void {
  outEye[0] = targetX - Math.sin(yaw) * config.distance;
  outEye[1] = targetY + config.height;
  outEye[2] = targetZ - Math.cos(yaw) * config.distance;
  outLook[0] = targetX;
  outLook[1] = targetY + config.lookHeight;
  outLook[2] = targetZ;
}

export function smoothTowards(
  current: Float32Array,
  target: Float32Array,
  smoothing: number,
  deltaTime: number,
): void {
  const alpha = Math.min(1, smoothing * deltaTime);
  current[0] = (current[0] ?? 0) + ((target[0] ?? 0) - (current[0] ?? 0)) * alpha;
  current[1] = (current[1] ?? 0) + ((target[1] ?? 0) - (current[1] ?? 0)) * alpha;
  current[2] = (current[2] ?? 0) + ((target[2] ?? 0) - (current[2] ?? 0)) * alpha;
}
