export type DebugFieldType = 'text' | 'number' | 'vector3' | 'angle';
export interface DebugField {
    key: string;
    label: string;
    type: DebugFieldType;
    value?: any;
}
export interface MotionMetrics {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    physicsTime: number;
    isAccelerating: boolean;
    groundContact: boolean;
}
export interface MotionDebugPanelProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    updateInterval?: number;
    customFields?: DebugField[];
    precision?: number;
    compact?: boolean;
    zIndex?: number;
    theme?: 'dark' | 'light' | 'glass';
}
export declare const DEFAULT_DEBUG_FIELDS: DebugField[];
