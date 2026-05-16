import * as THREE from 'three';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';
import type { MinimapMarker } from '../types';
interface MinimapSystemState extends BaseState {
    markers: Map<string, MinimapMarker>;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    isDirty: boolean;
    lastPosition: {
        x: number;
        z: number;
    } | null;
    lastRotation: number | null;
    gradientCache: {
        background: CanvasGradient | null;
        avatar: CanvasGradient | null;
    };
}
interface MinimapSystemMetrics extends BaseMetrics {
    markerCount: number;
    renderTime: number;
}
interface MinimapRenderOptions {
    size: number;
    scale: number;
    position: THREE.Vector3;
    rotation: number;
    blockRotate?: boolean;
    tileGroups?: Map<string, TileGroupLike>;
    sceneObjects?: Map<string, {
        position: THREE.Vector3;
        size: THREE.Vector3;
    }>;
}
type TileLike = {
    position: {
        x: number;
        y: number;
        z: number;
    };
    size?: number;
    objectType?: string;
};
type TileGroupLike = {
    tiles?: TileLike[];
};
export declare class MinimapSystem extends AbstractSystem<MinimapSystemState, MinimapSystemMetrics> {
    private static instance;
    private listeners;
    constructor();
    static getInstance(): MinimapSystem;
    addMarker(id: string, type: 'normal' | 'ground', text: string, center: THREE.Vector3, size: THREE.Vector3): void;
    removeMarker(id: string): void;
    updateMarker(id: string, updates: Partial<Omit<MinimapMarker, 'id'>>): void;
    getMarkers(): Map<string, MinimapMarker>;
    getMarker(id: string): MinimapMarker | undefined;
    clear(): void;
    subscribe(listener: (markers: Map<string, MinimapMarker>) => void): () => void;
    private notifyListeners;
    setCanvas(canvas: HTMLCanvasElement | null): void;
    checkForUpdates(position: THREE.Vector3, rotation: number, threshold?: number, rotationThreshold?: number): void;
    render(options: MinimapRenderOptions): void;
    private renderCompass;
    private renderTiles;
    private renderSceneObjects;
    private renderMarkers;
    private renderAvatar;
    protected performUpdate(context: SystemContext): void;
    protected createUpdateArgs(context: SystemContext): SystemContext;
    protected updateMetrics(deltaTime: number): void;
    protected onDispose(): void;
}
export {};
