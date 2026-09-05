export * from './types';
export { computeGameTime, realMsToGameMinutes, isNewDay, isNewHour, TIME_CONSTANTS } from './core/Clock';
export { useTimeStore } from './stores/timeStore';
export {
  createTimePlugin,
  hydrateTimeState,
  serializeTimeState,
  timePlugin,
} from './plugin';
export type { TimePluginOptions } from './plugin';
export {
  useGameTime,
  useTimeOfDay,
  useGameClock,
  useDayChange,
  useHourChange,
} from './hooks/useGameTime';
export { TimeHUD } from './components/TimeHUD';
