import { RootState } from '@react-three/fiber';

export type FrameCallback = (state: RootState, delta: number) => void;

export interface FrameSubscription {
  id: string;
  callback: FrameCallback;
  priority: number;
}
