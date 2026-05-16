import React from 'react';
interface NPCNetworkVisualizerProps {
    systemId?: string;
    showLabels?: boolean;
    showConnectionLines?: boolean;
    showGroups?: boolean;
    nodeSize?: number;
    connectionWidth?: number;
    updateInterval?: number;
    maxRenderDistance?: number;
    className?: string;
}
export declare const NPCNetworkVisualizer: React.FC<NPCNetworkVisualizerProps>;
export {};
