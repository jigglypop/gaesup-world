import type { SceneEuler, SceneTransform, SceneVector3 } from './types';

export type SceneQuaternion = readonly [number, number, number, number];
/** Column-major affine matrix, matching glTF and Three.js. */
export type SceneMatrix = readonly [
  number, number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number,
];

export function sceneEulerToQuaternion([x, y, z]: SceneEuler): SceneQuaternion {
  const a = Math.cos(x / 2), b = Math.cos(y / 2), c = Math.cos(z / 2);
  const d = Math.sin(x / 2), e = Math.sin(y / 2), f = Math.sin(z / 2);
  return [d * b * c + a * e * f, a * e * c - d * b * f,
    a * b * f + d * e * c, a * b * c - d * e * f];
}

export function sceneQuaternionToEuler(quaternion: SceneQuaternion): SceneEuler {
  const length = Math.hypot(...quaternion);
  if (!Number.isFinite(length) || length < Number.EPSILON) {
    throw new TypeError('Rotation must be a finite nonzero quaternion.');
  }
  const [x, y, z, w] = quaternion.map((value) => value / length) as [number, number, number, number];
  const m13 = 2 * (x * z + w * y);
  const pitch = Math.asin(Math.max(-1, Math.min(1, m13)));
  return Math.abs(m13) < 0.9999999
    ? [Math.atan2(2 * (w * x - y * z), 1 - 2 * (x * x + y * y)), pitch,
      Math.atan2(2 * (w * z - x * y), 1 - 2 * (y * y + z * z))]
    : [Math.atan2(2 * (y * z + w * x), 1 - 2 * (x * x + z * z)), pitch, 0];
}

export function sceneTransformToMatrix(transform: SceneTransform): SceneMatrix {
  const [x, y, z, w] = sceneEulerToQuaternion(transform.rotation);
  const [sx, sy, sz] = transform.scale;
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + w * z) * sx, 2 * (x * z - w * y) * sx, 0,
    2 * (x * y - w * z) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + w * x) * sy, 0,
    2 * (x * z + w * y) * sz, 2 * (y * z - w * x) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    ...transform.position, 1,
  ];
}

export function multiplySceneMatrices(left: SceneMatrix, right: SceneMatrix): SceneMatrix {
  const result = new Array<number>(16).fill(0);
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      let value = 0;
      for (let k = 0; k < 4; k++) value += left[k * 4 + row]! * right[column * 4 + k]!;
      result[column * 4 + row] = value;
    }
  }
  return result as unknown as SceneMatrix;
}

/** TRS cannot represent shear or a singular basis; callers can retain the exact matrix. */
export function sceneMatrixToTransform(m: SceneMatrix): SceneTransform {
  let sx = Math.hypot(m[0], m[1], m[2]);
  const sy = Math.hypot(m[4], m[5], m[6]), sz = Math.hypot(m[8], m[9], m[10]);
  const determinant = m[0] * (m[5] * m[10] - m[6] * m[9])
    - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
  if (Math.min(sx, sy, sz) < Number.EPSILON) throw new RangeError('Singular transform: use getWorldMatrix().');
  if (determinant < 0) sx = -sx;
  const a = m[0] / sx, b = m[4] / sy, c = m[8] / sz;
  const d = m[1] / sx, e = m[5] / sy, f = m[9] / sz;
  const g = m[2] / sx, h = m[6] / sy, i = m[10] / sz;
  if (Math.max(Math.abs(a * b + d * e + g * h), Math.abs(a * c + d * f + g * i),
    Math.abs(b * c + e * f + h * i)) > 1e-7) {
    throw new RangeError('Sheared transform: use getWorldMatrix().');
  }
  const rotation: SceneVector3 = Math.abs(c) < 0.9999999
    ? [Math.atan2(-f, i), Math.asin(Math.max(-1, Math.min(1, c))), Math.atan2(-b, a)]
    : [Math.atan2(h, e), Math.asin(Math.max(-1, Math.min(1, c))), 0];
  return { position: [m[12], m[13], m[14]], rotation: rotation.map((n) => n === 0 ? 0 : n) as [number, number, number], scale: [sx, sy, sz] };
}
