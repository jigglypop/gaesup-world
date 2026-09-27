import * as THREE from 'three';

/** Meters of ground between the samples a click ray takes, and how far down and out it looks. */
const GROUND_STEP = 0.25;
const GROUND_FLOOR = -4;
const MAX_STEPS = 400;

/**
 * Where a click ray first meets the ground `heightAt` describes: walked out from the camera in short steps, the
 * crossing then found by bisection. A raised floor catches the ray before the flat plane behind it does, so a click
 * lands on the surface under the pointer. Null when the ray meets no ground within reach.
 */
export function groundAlongRay(
  ray: THREE.Ray,
  heightAt: (x: number, z: number) => number,
  out = new THREE.Vector3(),
): THREE.Vector3 | null {
  const { origin, direction } = ray;
  if (direction.y > -1e-4) return null;
  const end = (GROUND_FLOOR - origin.y) / direction.y;
  const across = Math.hypot(direction.x, direction.z);
  const step = across > 1e-4 ? GROUND_STEP / across : end;
  const below = (t: number) => origin.y + direction.y * t <= heightAt(origin.x + direction.x * t, origin.z + direction.z * t);
  let above = 0;
  for (let index = 1; index <= MAX_STEPS; index++) {
    const t = Math.min(index * step, end);
    if (below(t)) {
      let low = above;
      let high = t;
      for (let split = 0; split < 10; split++) {
        const middle = (low + high) / 2;
        if (below(middle)) high = middle;
        else low = middle;
      }
      return ray.at(high, out);
    }
    if (t >= end) return null;
    above = t;
  }
  return null;
}

/**
 * The walkable point nearest a click that landed on something the agent cannot stand on (a rock, a wall, a pond):
 * rings of `step` meters outward up to `reach`, taking on the first ring with any the one nearest `from`, the side the
 * agent walks up from. The click itself when it is walkable; null when nothing within reach is.
 */
export function nearestWalkable(
  isWalkable: (x: number, z: number) => boolean,
  x: number,
  z: number,
  step: number,
  reach: number,
  from: { x: number; z: number },
): [number, number] | null {
  if (isWalkable(x, z)) return [x, z];
  for (let radius = step; radius <= reach + 1e-6; radius += step) {
    const samples = Math.max(8, Math.ceil((Math.PI * 2 * radius) / step));
    let best: [number, number] | null = null;
    let bestDistance = Infinity;
    for (let index = 0; index < samples; index++) {
      const angle = (index / samples) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const pz = z + Math.sin(angle) * radius;
      if (!isWalkable(px, pz)) continue;
      const distance = (px - from.x) ** 2 + (pz - from.z) ** 2;
      if (distance < bestDistance) {
        best = [px, pz];
        bestDistance = distance;
      }
    }
    if (best) return best;
  }
  return null;
}
