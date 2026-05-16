import React from 'react';
export type TreeObjectProps = {
    id?: string;
    position: [number, number, number];
    rotationY?: number;
    hp?: number;
    woodDrop?: number;
    regrowMinutes?: number;
    hitRange?: number;
    trunkColor?: string;
    foliageColor?: string;
    scale?: number;
};
export declare function TreeObject({ position, rotationY, hp, woodDrop, regrowMinutes, hitRange, trunkColor, foliageColor, scale, }: TreeObjectProps): React.JSX.Element;
export default TreeObject;
