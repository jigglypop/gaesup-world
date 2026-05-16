import React from 'react';
export type CatchEntry = {
    itemId: string;
    weight: number;
};
export type FishSpotProps = {
    position: [number, number, number];
    radius?: number;
    pool?: CatchEntry[];
    cooldownMs?: number;
    successChance?: number;
    showRipple?: boolean;
    rippleColor?: string;
};
export declare function FishSpot({ position, radius, pool, cooldownMs, successChance, showRipple, rippleColor, }: FishSpotProps): React.JSX.Element;
export default FishSpot;
