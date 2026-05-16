import React from 'react';
import type { PlacedObject } from '../../../types';
export interface BillboardProps {
    text?: string;
    imageUrl?: string;
    width?: number;
    height?: number;
    scale?: number;
    color?: string;
    elevation?: number;
    intensity?: number;
    toon?: boolean;
}
export declare const BillboardBatch: React.NamedExoticComponent<{
    billboards: PlacedObject[];
}>;
declare const _default: React.NamedExoticComponent<BillboardProps>;
export default _default;
