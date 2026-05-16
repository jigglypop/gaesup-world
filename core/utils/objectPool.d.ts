import * as THREE from 'three';
export declare class ThreeObjectPool {
    private static instance;
    private vector3Pool;
    private quaternionPool;
    private eulerPool;
    private matrix4Pool;
    private constructor();
    static getInstance(): ThreeObjectPool;
    acquireVector3(): THREE.Vector3;
    releaseVector3(v: THREE.Vector3): void;
    acquireQuaternion(): THREE.Quaternion;
    releaseQuaternion(q: THREE.Quaternion): void;
    acquireEuler(): THREE.Euler;
    releaseEuler(e: THREE.Euler): void;
    acquireMatrix4(): THREE.Matrix4;
    releaseMatrix4(m: THREE.Matrix4): void;
    withVector3<T>(fn: (v: THREE.Vector3) => T): T;
    withQuaternion<T>(fn: (q: THREE.Quaternion) => T): T;
    withEuler<T>(fn: (e: THREE.Euler) => T): T;
    withMatrix4<T>(fn: (m: THREE.Matrix4) => T): T;
    getStats(): {
        vector3: {
            available: number;
            inUse: number;
            total: number;
        };
        quaternion: {
            available: number;
            inUse: number;
            total: number;
        };
        euler: {
            available: number;
            inUse: number;
            total: number;
        };
        matrix4: {
            available: number;
            inUse: number;
            total: number;
        };
    };
    clear(): void;
}
export declare const threeObjectPool: ThreeObjectPool;
