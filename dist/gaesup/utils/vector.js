import * as THREE from "three";
export function isVectorNonZero(v) {
    return v.toArray().every(function (value) { return value !== 0; });
}
export function isValidOrZero(condision, vector) {
    return condision ? vector : new THREE.Vector3(0, 0, 0);
}
export function isValidOrOne(condision, vector) {
    return condision ? vector : new THREE.Vector3(1, 1, 1);
}
export function V3(x, y, z) {
    return new THREE.Vector3(x, y, z);
}
export function V30() {
    return new THREE.Vector3(0, 0, 0);
}
export function V31() {
    return new THREE.Vector3(1, 1, 1);
}
export function Qt(x, y, z, w) {
    return new THREE.Quaternion(x, y, z, w);
}
export function Elr(x, y, z) {
    return new THREE.Euler(x, y, z);
}
