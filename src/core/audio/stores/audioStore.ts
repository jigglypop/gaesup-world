import { create } from 'zustand';

import { getAudioEngine } from '../core/AudioEngine';
import type { AudioSerialized, BgmTrack, SfxDef } from '../types';

type State = {
  masterMuted: boolean;
  bgmMuted: boolean;
  sfxMuted: boolean;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  currentBgmId: string | null;

  setMaster: (volume: number) => void;
  setBgm: (volume: number) => void;
  setSfx: (volume: number) => void;
  toggleMaster: () => void;
  toggleBgm: () => void;
  toggleSfx: () => void;

  playSfx: (def: SfxDef) => void;
  playBgm: (track: BgmTrack | null) => void;
  stopBgm: () => void;

  apply: () => void;

  serialize: () => AudioSerialized;
  hydrate: (data: AudioSerialized | null | undefined) => void;
  prepareHydrate: (data: AudioSerialized | null | undefined) => () => void;
};

export const useAudioStore = create<State>((set, get) => ({
  masterMuted: false,
  bgmMuted: false,
  sfxMuted: false,
  masterVolume: 0.6,
  bgmVolume: 0.4,
  sfxVolume: 0.7,
  currentBgmId: null,

  setMaster: (v) => { set({ masterVolume: Math.max(0, Math.min(1, v)) }); get().apply(); },
  setBgm: (v) => { set({ bgmVolume: Math.max(0, Math.min(1, v)) }); get().apply(); },
  setSfx: (v) => { set({ sfxVolume: Math.max(0, Math.min(1, v)) }); get().apply(); },

  toggleMaster: () => { set({ masterMuted: !get().masterMuted }); get().apply(); },
  toggleBgm:    () => { set({ bgmMuted:    !get().bgmMuted    }); get().apply(); },
  toggleSfx:    () => { set({ sfxMuted:    !get().sfxMuted    }); get().apply(); },

  playSfx: (def) => {
    const s = get();
    if (s.masterMuted || s.sfxMuted) return;
    getAudioEngine().resume();
    getAudioEngine().playSfx(def);
  },

  playBgm: (track) => {
    getAudioEngine().resume();
    getAudioEngine().playBgm(track);
    set({ currentBgmId: track?.id ?? null });
    get().apply();
  },

  stopBgm: () => {
    getAudioEngine().stopBgm();
    set({ currentBgmId: null });
  },

  apply: () => {
    const s = get();
    const eng = getAudioEngine();
    eng.setMasterVolume(s.masterMuted ? 0 : s.masterVolume);
    eng.setBgmVolume(s.bgmMuted ? 0 : s.bgmVolume);
    eng.setSfxVolume(s.sfxMuted ? 0 : s.sfxVolume);
  },

  serialize: (): AudioSerialized => {
    const s = get();
    return {
      version: 1,
      masterMuted: s.masterMuted,
      bgmMuted: s.bgmMuted,
      sfxMuted: s.sfxMuted,
      masterVolume: s.masterVolume,
      bgmVolume: s.bgmVolume,
      sfxVolume: s.sfxVolume,
    };
  },

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 ||
      ![data.masterMuted, data.bgmMuted, data.sfxMuted].every((value) => typeof value === 'boolean') ||
      ![data.masterVolume, data.bgmVolume, data.sfxVolume].every(
        (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1,
      )) throw new TypeError('Invalid audio snapshot');
    const { masterMuted, bgmMuted, sfxMuted, masterVolume, bgmVolume, sfxVolume } = data;
    return () => {
      set({ masterMuted, bgmMuted, sfxMuted, masterVolume, bgmVolume, sfxVolume });
      get().apply();
    };
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
