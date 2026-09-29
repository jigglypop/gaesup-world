import { ThreeEvent } from '@react-three/fiber';

export type ClickerResult = {
  moveClicker: (
    event: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: 'normal' | 'ground',
  ) => boolean;
  stopClicker: () => void;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
  isReady: boolean;
};

export type ClickerMoveOptions = {
  minHeight?: number;
  offsetY?: number;
  useNavigation?: boolean;
  simplifyPath?: boolean;
  waypointThreshold?: number;
  fallbackToDirectOnFail?: boolean;
  agentRadius?: number;
  agentWidth?: number;
  agentDepth?: number;
  clearance?: number;
};
