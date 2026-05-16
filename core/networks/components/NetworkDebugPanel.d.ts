import React from 'react';
interface NetworkDebugPanelProps {
    systemId?: string;
    className?: string;
    style?: React.CSSProperties;
    onClose?: () => void;
}
export declare const NetworkDebugPanel: React.FC<NetworkDebugPanelProps>;
export {};
