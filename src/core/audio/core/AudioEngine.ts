import type { BgmTrack, SfxDef } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private bgmStep = 0;
  private currentBgm: BgmTrack | null = null;
  private bufferCache = new Map<string, AudioBuffer>();

  ensure(): boolean {
    if (this.ctx) return true;
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return false;
    try {
      this.ctx = new window.AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      return true;
    } catch {
      return false;
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  setMasterVolume(v: number): void {
    if (!this.ensure() || !this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setBgmVolume(v: number): void {
    if (!this.ensure() || !this.bgmGain) return;
    this.bgmGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setSfxVolume(v: number): void {
    if (!this.ensure() || !this.sfxGain) return;
    this.sfxGain.gain.value = Math.max(0, Math.min(1, v));
  }

  playSfx(def: SfxDef): void {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    if (def.url) {
      void this.playFromUrl(def.url, this.sfxGain, def.volume ?? 1);
      return;
    }
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = def.type ?? 'sine';
    osc.frequency.value = def.freq ?? 440;
    const dur = def.duration ?? 0.12;
    const t0 = this.ctx.currentTime;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime((def.volume ?? 1) * 0.3, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  playBgm(track: BgmTrack | null): void {
    if (!this.ensure() || !this.ctx || !this.bgmGain) return;
    this.stopBgm();
    if (!track) return;
    this.currentBgm = track;
    if (track.url) {
      void this.playFromUrl(track.url, this.bgmGain, track.volume ?? 1, true);
      return;
    }
    const pattern = track.pattern ?? [0, 4, 7, 4];
    const interval = track.intervalMs ?? 800;
    const baseFreq = track.baseFreq ?? 220;
    this.bgmStep = 0;
    const tick = () => {
      if (!this.ctx || !this.bgmGain) return;
      const semi = pattern[this.bgmStep % pattern.length] ?? 0;
      const freq = baseFreq * Math.pow(2, semi / 12);
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t0 = this.ctx.currentTime;
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime((track.volume ?? 1) * 0.18, t0 + 0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + interval / 1000 * 0.95);
      osc.connect(env);
      env.connect(this.bgmGain);
      osc.start(t0);
      osc.stop(t0 + interval / 1000 + 0.05);
      this.bgmStep += 1;
    };
    tick();
    this.bgmInterval = window.setInterval(tick, interval);
  }

  stopBgm(): void {
    if (this.bgmInterval !== null) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgm = null;
  }

  getCurrentBgmId(): string | null {
    return this.currentBgm?.id ?? null;
  }

  private async playFromUrl(url: string, dest: GainNode, volume: number, loop: boolean = false): Promise<void> {
    if (!this.ctx) return;
    try {
      let buffer = this.bufferCache.get(url);
      if (!buffer) {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        buffer = await this.ctx.decodeAudioData(ab);
        this.bufferCache.set(url, buffer);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = loop;
      const env = this.ctx.createGain();
      env.gain.value = volume;
      src.connect(env);
      env.connect(dest);
      src.start();
    } catch { void 0; }
  }
}

let _instance: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!_instance) _instance = new AudioEngine();
  return _instance;
}
export type { AudioEngine };
