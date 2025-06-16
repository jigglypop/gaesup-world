import * as THREE from 'three';

export interface ClickerQueueItem {
  action: 'move' | 'click' | 'wait' | 'custom';
  target?: THREE.Vector3;
  beforeCB?: () => void;
  afterCB?: () => void;
  time?: number;
  data?: Record<string, unknown>;
}

export interface ClickerOptionState {
  isRun: boolean;
  throttle: number;
  autoStart: boolean;
  track: boolean;
  loop: boolean;
  queue: ClickerQueueItem[];
  line: boolean;
}

export interface ClickerOptionSlice {
  clickerOption: ClickerOptionState;
  setClickerOption: (update: Partial<ClickerOptionState>) => void;
}
 