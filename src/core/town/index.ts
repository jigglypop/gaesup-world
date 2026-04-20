export type {
  ResidentId,
  HouseId,
  Resident,
  HousePlotState,
  HousePlot as HousePlotData,
  TownStats,
  TownSerialized,
} from './types';
export { useTownStore } from './stores/townStore';
export { useDecorationScore } from './hooks/useDecorationScore';
export type { DecorationWeights } from './hooks/useDecorationScore';
export { HousePlot } from './components/HousePlot';
export type { HousePlotProps } from './components/HousePlot';
export { TownHUD } from './components/TownHUD';
export type { TownHUDProps } from './components/TownHUD';
