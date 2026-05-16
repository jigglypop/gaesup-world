import React from 'react';
import { BillboardConfig } from '../../types';
interface Props {
    billboards: BillboardConfig[];
    isEditMode: boolean;
    onClick?: (id: string) => void;
}
export declare const BillboardRenderer: React.NamedExoticComponent<Props>;
export {};
