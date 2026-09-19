export * from './types';
export { computeGameTime, realMsToGameMinutes, isNewDay, isNewHour, TIME_CONSTANTS } from './core/Clock';
export { useTimeStore, createTimeStore, TimeStoreProvider, useTimeStoreApi } from './stores/timeStore';
export type { TimeStore, TimeState } from './stores/timeStore';
export { getTimeClock, RUNTIME_TIME_STORE_SERVICE_ID } from './core/timeClock';
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
