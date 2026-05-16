import React from 'react';
import type { BuildingModelFallbackKind } from '../../../types';
type ModelObjectProps = {
    url?: string;
    label?: string;
    fallbackKind?: BuildingModelFallbackKind;
    scale?: number;
    color?: string;
};
export default function ModelObject({ url, label, fallbackKind, scale, color }: ModelObjectProps): React.JSX.Element;
export {};
