import type { RendererStats } from 'gaesup-world';

export type RoomQuality = 'economy' | 'balanced' | 'high';
export type RoomLighting = 'day' | 'evening';
export type RoomFrame = { at: number; submitMs: number; stats: RendererStats };
export type RoomOptions = { backend?: 'auto' | 'webgl'; dpr?: number; onProgress?: (stage: string) => void; onNotice?: (message: string) => void; onError?: (error: Error) => void };
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
  avatarPosition: [number, number, number];
};
