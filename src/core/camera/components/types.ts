export interface CameraDebugPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible?: boolean;
  updateInterval?: number;
  zIndex?: number;
  compact?: boolean;
  theme?: 'dark' | 'light' | 'glass';
}

export interface CameraMetrics {
  frameCount: number;
  averageFrameTime: number;
  lastUpdateTime: number;
  mode: string;
  activeController: string;
  distance: { x: number; y: number; z: number };
  fov: number;
  position: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number } | null;
}
