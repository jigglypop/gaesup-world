import React from 'react';
interface FireProps {
    intensity?: number;
    width?: number;
    height?: number;
    color?: string;
}
declare const _default: React.NamedExoticComponent<FireProps>;
export default _default;
export type FireBatchEntry = {
    position: [number, number, number];
    rotation: number;
    intensity: number;
    width: number;
    height: number;
    color: string;
};
export declare function createFireBatchSignature(fires: FireBatchEntry[]): string;
export declare const FireBatch: React.NamedExoticComponent<{
    fires: FireBatchEntry[];
}>;
