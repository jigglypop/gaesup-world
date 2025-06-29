export interface DebugField {
    key: string;
    label: string;
    format: 'text' | 'number' | 'vector3' | 'angle' | 'array';
    enabled: boolean;
}
export interface AnimationMetrics {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
    currentAnimation: string;
    animationType: string;
    availableAnimations: string[];
    isPlaying: boolean;
    weight: number;
    speed: number;
    blendDuration: number;
    activeActions: number;
}
export interface AnimationDebugPanelProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    fields?: DebugField[];
    customFields?: DebugField[];
    precision?: number;
    compact?: boolean;
}
export declare const DEFAULT_DEBUG_FIELDS: DebugField[];
