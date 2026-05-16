export type DebugFieldType = 'text' | 'number' | 'vector3' | 'angle';
export type DebugFieldValue = string | number | [number, number, number] | {
    x: number;
    y: number;
    z: number;
};
export interface DebugField {
    key: string;
    label: string;
    type: DebugFieldType;
    value?: DebugFieldValue;
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
    /** When true, disables fixed positioning (for embedding inside editor panels). */
    embedded?: boolean;
}
export declare const DEFAULT_DEBUG_FIELDS: DebugField[];
