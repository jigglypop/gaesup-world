import * as THREE from 'three';
export declare const MathUtils: {
    clamp(value: number, min: number, max: number): number;
    lerp(start: number, end: number, factor: number): number;
    smoothStep(edge0: number, edge1: number, x: number): number;
    mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
    randomInRange(min: number, max: number): number;
    degToRad(degrees: number): number;
    radToDeg(radians: number): number;
    distance2D(x1: number, y1: number, x2: number, y2: number): number;
    normalizeAngle(angle: number): number;
    angleDifference(a: number, b: number): number;
    vectorToAngle(vector: THREE.Vector3): number;
    angleToVector(angle: number): THREE.Vector3;
};
