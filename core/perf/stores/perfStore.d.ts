import type { DeviceCapabilities, PerfProfile, PerfTier } from '../types';
type State = {
    profile: PerfProfile;
    capabilities: DeviceCapabilities | null;
    manualOverride: boolean;
    detect: () => void;
    setTier: (tier: PerfTier) => void;
    resetAuto: () => void;
};
export declare const usePerfStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
