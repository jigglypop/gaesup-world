import React from 'react';
import { BlueprintItem } from './types';
export type BlueprintListProps = {
    blueprints: BlueprintItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onSpawn?: (id: string) => void;
    isSpawning?: boolean;
};
export declare const BlueprintList: React.FC<BlueprintListProps>;
