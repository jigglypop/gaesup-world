import * as THREE from 'three';
export declare function createVectorCache(): {
    getTempVector: (index: number) => THREE.Vector3;
    getCached: (key: string, factory: () => THREE.Vector3) => THREE.Vector3;
    clear: () => void;
    getStats: () => {
        cacheSize: number;
        tempVectorCount: number;
    };
};
export declare const getCachedTrig: (angle: number) => {
    sin: number;
    cos: number;
};
export declare const clearTrigCache: () => void;
export declare const getTrigCacheStats: () => {
    size: number;
    maxSize: number;
    coverage: string;
};
export declare const normalizeAngle: (angle: number) => number;
export declare const shouldUpdate: (current: number, previous: number, threshold?: number) => boolean;
export declare const shouldUpdateVector3: (current: THREE.Vector3, previous: THREE.Vector3, threshold?: number) => boolean;
export declare class MemoizationManager {
    private static instance?;
    private vectorCaches;
    static getInstance(): MemoizationManager;
    getVectorCache(id: string): {
        getTempVector: (index: number) => THREE.Vector3;
        getCached: (key: string, factory: () => THREE.Vector3) => THREE.Vector3;
        clear: () => void;
        getStats: () => {
            cacheSize: number;
            tempVectorCount: number;
        };
    };
    clearAll(): void;
    getStats(): {
        vectorCaches: {
            cacheSize: number;
            tempVectorCount: number;
            id: string;
        }[];
        trigCache: {
            size: number;
            maxSize: number;
            coverage: string;
        };
    };
}
