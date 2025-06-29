import { ThreeEvent } from '@react-three/fiber';
export interface ClickerResult {
    moveClicker: (event: ThreeEvent<MouseEvent>, isRun: boolean, type: 'normal' | 'ground') => boolean;
    stopClicker: () => void;
    onClick: (event: ThreeEvent<MouseEvent>) => void;
    isReady: boolean;
}
export interface ClickerMoveOptions {
    minHeight?: number;
    offsetY?: number;
}
