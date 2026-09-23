import type { FrameScheduler } from '../FrameScheduler';
import type { FrameSubscriptionOptions } from '../types';

export type FrameSchedulerHostProps = {
  scheduler?: FrameScheduler;
  metrics?: boolean;
};

export type UseEngineFrameOptions = FrameSubscriptionOptions & {
  scheduler?: FrameScheduler;
  active?: boolean;
};
