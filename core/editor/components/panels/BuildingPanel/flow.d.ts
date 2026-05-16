import React from 'react';
import '@xyflow/react/dist/style.css';
import type { NPCBrainBlueprint } from '../../../../npc/types';
type BrainFlowProps = {
    blueprint: NPCBrainBlueprint;
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    onSelectNode: (id: string) => void;
    onSelectEdge: (id: string) => void;
};
export declare function BrainFlow({ blueprint, selectedNodeId, selectedEdgeId, onSelectNode, onSelectEdge, }: BrainFlowProps): React.JSX.Element;
export {};
