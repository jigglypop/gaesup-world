import type { RootState } from '@react-three/fiber';

import type { FrameScheduler } from '../FrameScheduler';
import type { FramePhase, FrameSubscriptionOptions } from '../types';

export type FrameSchedulerHostProps = {
  scheduler?: FrameScheduler;
  metrics?: boolean;
};

export type UseEngineFrameOptions = FrameSubscriptionOptions & {
  scheduler?: FrameScheduler;
  active?: boolean;
};

export type SharedFrameChannel = {
  readonly phase: FramePhase;
  readonly label: string;
  readonly order?: number;
  readonly throttleMs?: number;
};

export type SharedFrameCallback = (delta: number, elapsedSeconds: number, three: RootState) => void;
