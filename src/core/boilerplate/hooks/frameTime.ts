import { MILLISECONDS_IN_SECOND } from '../types';

export function getFrameElapsedSeconds(state: object): number {
  if ('elapsed' in state && typeof state.elapsed === 'number') {
    return state.elapsed;
  }
  if ('clock' in state && typeof state.clock === 'object' && state.clock !== null &&
    'elapsedTime' in state.clock && typeof state.clock.elapsedTime === 'number') {
    return state.clock.elapsedTime;
  }
  return performance.now() / MILLISECONDS_IN_SECOND;
}

export function getFrameTimeMs(state: object): number {
  return getFrameElapsedSeconds(state) * MILLISECONDS_IN_SECOND;
}
