import { create } from 'zustand';

import { autoDetectProfile, profileForTier, type RendererIdentity } from '../detect';
import type { DeviceCapabilities, PerfProfile, PerfTier } from '../types';

type State = {
  profile: PerfProfile;
  capabilities: DeviceCapabilities | null;
  manualOverride: boolean;

  /** Classifies the device. Pass the identity of an existing renderer to skip the probe context. */
  detect: (identity?: RendererIdentity | null) => void;
  setTier: (tier: PerfTier) => void;
  resetAuto: () => void;
};

const initial = profileForTier('medium');

export const usePerfStore = create<State>((set) => ({
  profile: initial,
  capabilities: null,
  manualOverride: false,

  detect: (identity) => {
    const { profile, capabilities } = autoDetectProfile(identity);
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
