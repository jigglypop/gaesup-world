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

  hydrate: (data) => {
    if (!data) return;
    set({
      masterMuted:  !!data.masterMuted,
      bgmMuted:     !!data.bgmMuted,
      sfxMuted:     !!data.sfxMuted,
      masterVolume: typeof data.masterVolume === 'number' ? data.masterVolume : 0.6,
      bgmVolume:    typeof data.bgmVolume    === 'number' ? data.bgmVolume    : 0.4,
      sfxVolume:    typeof data.sfxVolume    === 'number' ? data.sfxVolume    : 0.7,
    });
    get().apply();
  },
}));
