import type { RendererStats } from 'gaesup-world';

import type { FestivalDiagnostics } from './roomFestival';

export type RoomQuality = 'economy' | 'balanced' | 'high';
export type RoomLighting = 'day' | 'evening';
export type RoomCamera = 'isometric' | 'front' | 'top' | 'back' | 'left' | 'right' | 'follow';
export type RoomAvatarStyle = 'classic' | 'coral' | 'blue' | 'mint';
export type RoomSound = 'calm' | 'bright';
export type RoomSettings = { quality: RoomQuality; lighting: RoomLighting; camera: RoomCamera; avatar: RoomAvatarStyle; sound: RoomSound; volume: number; projection: 'orthographic' | 'perspective'; pan: boolean; rotate: boolean; damping: boolean; moveSpeed: number; natureMotion: boolean; weather: 'clear' | 'snow' | 'blizzard'; bloom: boolean; bloomStrength: number; bloomRadius: number; bloomThreshold: number; festive: boolean };
export const DEFAULT_ROOM_SETTINGS: Readonly<RoomSettings> = Object.freeze({ quality: 'balanced', lighting: 'day', camera: 'isometric', avatar: 'classic', sound: 'calm', volume: 0.35, projection: 'orthographic', pan: true, rotate: true, damping: true, moveSpeed: 3.5, natureMotion: true, weather: 'clear', bloom: true, bloomStrength: 0.6, bloomRadius: 0.4, bloomThreshold: 1.2, festive: true });
export type DrawCallRow = { id: string; name: string; pass: 'scene' | 'shadow'; calls: number; triangles: number; instances: number; material: string };
export type RoomFrame = { at: number; submitMs: number; stats: RendererStats; draws: DrawCallRow[]; otherCalls: number };
export type RoomOptions = { backend?: 'auto' | 'webgl'; dpr?: number; onProgress?: (stage: string) => void; onNotice?: (message: string) => void; onError?: (error: Error) => void; onCameraZoom?: (zoom: number) => void; onPaint?: (indices: number[], kind: import('./terrain').TileKind) => void; onSculpt?: (indices: number[], shape: import('./terrain').TerrainShape) => void; onPlace?: (kind: import('./types').FurnitureKind, x: number, z: number) => void };
export type RoomDiagnostics = {
  backend: string;
  adapter: string | null;
  renderedFrames: number;
  loopCallbacks: number;
  pendingFrame: boolean;
  objectCount: number;
  visibleObjects: number;
  quality: RoomQuality;
  lighting: RoomLighting;
  dpr: number;
  width: number;
  height: number;
  frame: RoomFrame | null;
  camera: { preset: RoomCamera; projection: RoomSettings['projection']; position: [number, number, number]; target: [number, number, number]; zoom: number };
  movement: { state: 'idle' | 'moving' | 'arrived' | 'blocked'; destination: [number, number, number] | null; waypoints: number };
  bloom: { enabled: boolean; strength: number; objects: number };
  terrain: { size: number; tiles: number; batches: number; counts: Record<string, number> };
  environment?: { grassCells: number; grassBatches: number; grassInstances: number; oceanSize: number; elapsed: number; weather: RoomSettings['weather'] };
  visitors: number;
  festive?: FestivalDiagnostics;
  avatarPosition: [number, number, number];
  avatar: { style: RoomAvatarStyle; status: 'loading' | 'ready'; parts?: number; animation?: string | null };
};
