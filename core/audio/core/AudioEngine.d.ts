import type { BgmTrack, SfxDef } from '../types';
declare class AudioEngine {
    private ctx;
    private masterGain;
    private bgmGain;
    private sfxGain;
    private bgmInterval;
    private bgmStep;
    private currentBgm;
    private bufferCache;
    ensure(): boolean;
    resume(): void;
    setMasterVolume(v: number): void;
    setBgmVolume(v: number): void;
    setSfxVolume(v: number): void;
    playSfx(def: SfxDef): void;
    playBgm(track: BgmTrack | null): void;
    stopBgm(): void;
    getCurrentBgmId(): string | null;
    private playFromUrl;
}
export declare function getAudioEngine(): AudioEngine;
export type { AudioEngine };
