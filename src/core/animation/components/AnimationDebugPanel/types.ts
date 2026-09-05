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

export const DEFAULT_DEBUG_FIELDS: DebugField[] = [
  {
    key: 'currentAnimation',
    label: '현재 애니메이션',
    format: 'text',
    enabled: true
  },
  {
    key: 'animationType',
    label: '애니메이션 타입',
    format: 'text',
    enabled: true
  },
  {
    key: 'isPlaying',
    label: '재생 상태',
    format: 'text',
    enabled: true
  },
  {
    key: 'weight',
    label: '가중치',
    format: 'number',
    enabled: true
  },
  {
    key: 'speed',
    label: '속도',
    format: 'number',
    enabled: true
  },
  {
    key: 'blendDuration',
    label: '블렌드 시간',
    format: 'number',
    enabled: false
  },
  {
    key: 'activeActions',
    label: '활성 액션',
    format: 'number',
    enabled: true
  },
  {
    key: 'availableAnimations',
    label: '사용 가능 애니메이션',
    format: 'array',
    enabled: false
  },
  {
    key: 'frameCount',
    label: '프레임 카운트',
    format: 'number',
    enabled: false
  },
  {
    key: 'averageFrameTime',
    label: '평균 프레임 시간',
    format: 'number',
    enabled: false
  }
];
