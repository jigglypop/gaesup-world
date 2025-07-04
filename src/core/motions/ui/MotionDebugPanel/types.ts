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

export const DEFAULT_DEBUG_FIELDS: DebugField[] = [
  { key: 'motionType', label: 'Motion Type', type: 'text' },
  { key: 'position', label: 'Position', type: 'vector3' },
  { key: 'velocity', label: 'Velocity', type: 'vector3' },
  { key: 'speed', label: 'Speed', type: 'number' },
  { key: 'direction', label: 'Direction', type: 'vector3' },
  { key: 'isGrounded', label: 'Grounded', type: 'text' },
  { key: 'isMoving', label: 'Moving', type: 'text' },
  { key: 'acceleration', label: 'Acceleration', type: 'number' },
  { key: 'jumpForce', label: 'Jump Force', type: 'number' },
  { key: 'maxSpeed', label: 'Max Speed', type: 'number' },
  { key: 'totalDistance', label: 'Total Distance', type: 'number' },
  { key: 'gameState', label: 'Game State', type: 'text' }
];
