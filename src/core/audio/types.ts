export type SfxId = string;

export type SfxDef = {
  id: SfxId;
  url?: string;
  freq?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
};

export type BgmId = string;

export type BgmTrack = {
  id: BgmId;
  url?: string;
  baseFreq?: number;
  intervalMs?: number;
  pattern?: number[];
  volume?: number;
};

export type AudioSerialized = {
  version: number;
  masterMuted: boolean;
  bgmMuted: boolean;
  sfxMuted: boolean;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
};
