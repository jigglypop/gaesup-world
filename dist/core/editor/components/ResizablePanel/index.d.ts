import React from 'react';
interface ResizablePanelProps {
    children: React.ReactNode;
    title: string;
    initialWidth?: number;
    initialHeight?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizeHandles?: ('right' | 'bottom' | 'corner')[];
    className?: string;
    style?: React.CSSProperties;
    onClose?: () => void;
    onMinimize?: () => void;
    draggable?: boolean;
    icon?: string;
    onDrop?: (x: number, y: number) => void;
}
export declare const ResizablePanel: React.FC<ResizablePanelProps>;
export {};
