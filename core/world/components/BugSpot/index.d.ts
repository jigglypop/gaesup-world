import React from 'react';
export type CatchEntry = {
    itemId: string;
    weight: number;
};
export type BugSpotProps = {
    position: [number, number, number];
    radius?: number;
    pool?: CatchEntry[];
    cooldownMs?: number;
    successChance?: number;
    bugColor?: string;
    hoverHeight?: number;
};
export declare function BugSpot({ position, radius, pool, cooldownMs, successChance, bugColor, hoverHeight, }: BugSpotProps): React.JSX.Element;
export default BugSpot;
