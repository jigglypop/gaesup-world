const PLANE_COUNT = 6;
const PLANE_STRIDE = 4;
const POSITION_STRIDE = 3;

export const FRUSTUM_PLANES_LENGTH = PLANE_COUNT * PLANE_STRIDE;

export function extractFrustumPlanes(viewProjection: Float32Array, out: Float32Array, clipDepthZeroToOne = false): Float32Array {
  const m0 = viewProjection[0] ?? 0;
  const m1 = viewProjection[1] ?? 0;
  const m2 = viewProjection[2] ?? 0;
  const m3 = viewProjection[3] ?? 0;
  const m4 = viewProjection[4] ?? 0;
  const m5 = viewProjection[5] ?? 0;
  const m6 = viewProjection[6] ?? 0;
  const m7 = viewProjection[7] ?? 0;
  const m8 = viewProjection[8] ?? 0;
  const m9 = viewProjection[9] ?? 0;
  const m10 = viewProjection[10] ?? 0;
  const m11 = viewProjection[11] ?? 0;
  const m12 = viewProjection[12] ?? 0;
  const m13 = viewProjection[13] ?? 0;
  const m14 = viewProjection[14] ?? 0;
  const m15 = viewProjection[15] ?? 0;
  writePlane(out, 0, m3 + m0, m7 + m4, m11 + m8, m15 + m12);
  writePlane(out, 1, m3 - m0, m7 - m4, m11 - m8, m15 - m12);
  writePlane(out, 2, m3 + m1, m7 + m5, m11 + m9, m15 + m13);
  writePlane(out, 3, m3 - m1, m7 - m5, m11 - m9, m15 - m13);
  if (clipDepthZeroToOne) writePlane(out, 4, m2, m6, m10, m14);
  else writePlane(out, 4, m3 + m2, m7 + m6, m11 + m10, m15 + m14);
  writePlane(out, 5, m3 - m2, m7 - m6, m11 - m10, m15 - m14);
  return out;
}

function writePlane(
  out: Float32Array,
  planeIndex: number,
  x: number,
  y: number,
  z: number,
  w: number,
): void {
  const length = Math.hypot(x, y, z);
  const scale = length > 0 ? 1 / length : 0;
  const offset = planeIndex * PLANE_STRIDE;
  out[offset] = x * scale;
  out[offset + 1] = y * scale;
  out[offset + 2] = z * scale;
  out[offset + 3] = w * scale;
}

export function compactVisible(
  visibility: Uint8Array,
  count: number,
  outIndices: Uint32Array,
): number {
  let visibleCount = 0;
  for (let index = 0; index < count; index += 1) {
    if (visibility[index] === 1) {
      outIndices[visibleCount] = index;
      visibleCount += 1;
    }
  }
  return visibleCount;
}

export function cullSpheres(
  planes: Float32Array,
  positions: Float32Array,
  radius: number,
  count: number,
  outVisibility: Uint8Array,
): number {
  let visibleCount = 0;
  for (let index = 0; index < count; index += 1) {
    const positionOffset = index * POSITION_STRIDE;
    const x = positions[positionOffset] ?? 0;
    const y = positions[positionOffset + 1] ?? 0;
    const z = positions[positionOffset + 2] ?? 0;
    let visible = 1;
    for (let plane = 0; plane < PLANE_COUNT; plane += 1) {
      const planeOffset = plane * PLANE_STRIDE;
      const distance =
        (planes[planeOffset] ?? 0) * x +
        (planes[planeOffset + 1] ?? 0) * y +
        (planes[planeOffset + 2] ?? 0) * z +
        (planes[planeOffset + 3] ?? 0);
      if (distance < -radius) {
        visible = 0;
        break;
      }
    }
    outVisibility[index] = visible;
    visibleCount += visible;
  }
  return visibleCount;
}
