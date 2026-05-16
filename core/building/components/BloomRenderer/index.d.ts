import React from 'react';
import { BloomConfig } from '../../types';
interface Props {
    blooms: BloomConfig[];
    isEditMode: boolean;
    onClick?: (id: string) => void;
}
export declare const BloomRenderer: React.NamedExoticComponent<Props>;
export {};
