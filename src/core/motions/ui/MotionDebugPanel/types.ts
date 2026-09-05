export type DebugFieldType = 'text' | 'number' | 'vector3' | 'angle';

export type DebugFieldValue = 
  | string  // for 'text'
  | number  // for 'number' and 'angle'
  | [number, number, number]  // for 'vector3'
  | { x: number; y: number; z: number };  // alternative vector3 format

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

export const DEFAULT_DEBUG_FIELDS: DebugField[] = [
  { key: 'motionType', label: '이동 유형', type: 'text' },
  { key: 'position', label: '위치', type: 'vector3' },
  { key: 'velocity', label: '속도 벡터', type: 'vector3' },
  { key: 'speed', label: '속력', type: 'number' },
  { key: 'direction', label: '방향', type: 'vector3' },
  { key: 'isGrounded', label: '지면 접촉', type: 'text' },
  { key: 'isMoving', label: '이동 중', type: 'text' },
  { key: 'acceleration', label: '가속도', type: 'number' },
  { key: 'jumpForce', label: '점프 힘', type: 'number' },
  { key: 'maxSpeed', label: '최대 속력', type: 'number' },
  { key: 'totalDistance', label: '총 이동 거리', type: 'number' },
  { key: 'gameState', label: '이동 상태', type: 'text' }
];
