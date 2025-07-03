import React from 'react';
import * as THREE from 'three';
interface PathLineProps {
    points: THREE.Vector3[];
    color: string;
}
export declare const PathLine: React.MemoExoticComponent<({ points, color }: PathLineProps) => React.JSX.Element | null>;
export {};
