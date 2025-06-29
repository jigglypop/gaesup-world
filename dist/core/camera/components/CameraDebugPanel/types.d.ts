export interface CameraDebugPanelProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    visible?: boolean;
    updateInterval?: number;
    zIndex?: number;
    compact?: boolean;
    theme?: 'dark' | 'light' | 'glass';
    fields?: DebugField[];
    precision?: number;
    width?: number;
    height?: number;
    customFields?: CustomField[];
}
export interface DebugField {
    key: string;
    label: string;
    enabled: boolean;
    format?: 'number' | 'vector3' | 'text' | 'angle';
    precision?: number;
}
export interface CustomField {
    key: string;
    label: string;
    getValue: () => any;
    format?: 'number' | 'vector3' | 'text' | 'angle';
    precision?: number;
}
export interface CameraMetrics {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
    mode: string;
    activeController: string;
    distance: {
        x: number;
        y: number;
        z: number;
    } | null;
    fov: number;
    position: {
        x: number;
        y: number;
        z: number;
    } | null;
    targetPosition: {
        x: number;
        y: number;
        z: number;
    } | null;
    velocity?: {
        x: number;
        y: number;
        z: number;
    } | null;
    rotation?: {
        x: number;
        y: number;
        z: number;
    } | null;
    zoom?: number;
}
export declare const DEFAULT_DEBUG_FIELDS: DebugField[];
