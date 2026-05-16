import { CSSProperties, ReactElement, RefObject, WheelEventHandler } from 'react';
import * as THREE from 'three';
export interface MinimapMarker {
    id: string;
    x: number;
    y: number;
    type: 'player' | 'enemy' | 'item' | 'waypoint' | 'custom';
    label?: string;
    icon?: string | ReactElement;
    color?: string;
    size?: 'small' | 'medium' | 'large';
}
export interface MinimapResult {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    scale: number;
    upscale: () => void;
    downscale: () => void;
    handleWheel: WheelEventHandler<HTMLCanvasElement>;
    setupWheelListener: () => (() => void) | undefined;
    updateCanvas: () => void;
    isReady: boolean;
}
export interface MinimapProps {
    initialScale?: number;
    scale?: number;
    minScale?: number;
    maxScale?: number;
    blockScale?: boolean;
    blockScaleControl?: boolean;
    blockRotate?: boolean;
    angle?: number;
    minimapStyle?: CSSProperties;
    scaleStyle?: CSSProperties;
    plusMinusStyle?: CSSProperties;
    size?: number;
    zoom?: number;
    updateInterval?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showZoom?: boolean;
    showCompass?: boolean;
    markers?: MinimapMarker[];
    onMarkerClick?: (marker: MinimapMarker) => void;
    theme?: 'light' | 'dark' | 'glass';
}
export interface MinimapMarkerProps {
    marker: MinimapMarker;
    onClick?: (marker: MinimapMarker) => void;
}
export interface MinimapState {
    scale: number;
    rotation: number;
    center: THREE.Vector2;
    markers: MinimapMarker[];
    isTracking: boolean;
    trackingTarget?: string;
}
export interface InternalMinimapMarkerProps {
    id: string;
    position: THREE.Vector3 | [number, number, number];
    size?: THREE.Vector3 | [number, number, number];
    text?: string;
    type?: 'normal' | 'ground';
    children?: React.ReactNode;
}
export interface MinimapPlatformProps {
    id: string;
    position: THREE.Vector3 | [number, number, number];
    size: THREE.Vector3 | [number, number, number];
    label: string;
    children?: React.ReactNode;
}
export interface MinimapObjectProps {
    id: string;
    position: THREE.Vector3 | [number, number, number];
    emoji: string;
    size?: THREE.Vector3 | [number, number, number];
    children?: React.ReactNode;
}
