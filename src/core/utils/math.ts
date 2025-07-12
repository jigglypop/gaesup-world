import * as THREE from 'three';

export const MathUtils = {
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * this.clamp(factor, 0, 1);
  },

  smoothStep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },

  mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  },

  randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  },

  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  },

  distance2D(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  },

  angleDifference(a: number, b: number): number {
    return this.normalizeAngle(b - a);
  },

  vectorToAngle(vector: THREE.Vector3): number {
    return Math.atan2(vector.x, vector.z);
  },

  angleToVector(angle: number): THREE.Vector3 {
    return new THREE.Vector3(
      Math.sin(angle),
      0,
      Math.cos(angle)
    );
  }
}; 