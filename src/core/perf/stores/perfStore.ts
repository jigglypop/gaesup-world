import { create } from 'zustand';

import { autoDetectProfile, profileForTier } from '../detect';
import type { DeviceCapabilities, PerfProfile, PerfTier } from '../types';

type State = {
  profile: PerfProfile;
  capabilities: DeviceCapabilities | null;
  manualOverride: boolean;

  detect: () => void;
  setTier: (tier: PerfTier) => void;
  resetAuto: () => void;
};

const initial = profileForTier('medium');

export const usePerfStore = create<State>((set) => ({
  profile: initial,
  capabilities: null,
  manualOverride: false,

  detect: () => {
    const { profile, capabilities } = autoDetectProfile();
    set({ profile, capabilities, manualOverride: false });
  },

  setTier: (tier) => {
    set({ profile: profileForTier(tier), manualOverride: true });
  },

  resetAuto: () => {
    const { profile, capabilities } = autoDetectProfile();
    set({ profile, capabilities, manualOverride: false });
  },
}));
