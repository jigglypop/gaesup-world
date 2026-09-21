import type { BgmTrack, SfxDef } from '../types';

export type AudioEngineOptions = { canPlay?: () => boolean };

class AudioEngine {
  constructor(private readonly options: AudioEngineOptions = {}) {}
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private bgmStep = 0;
  private currentBgm: BgmTrack | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private sources = new Map<AudioScheduledSourceNode, { gain: GainNode; bgm: boolean }>();
  private requests = new Map<AbortController, boolean>();
  private bgmGeneration = 0;
  private playbackEnabled = true;
  private volumes = { master: 1, bgm: 1, sfx: 1 };

  ensure(): boolean {
    if (!this.canPlay()) return false;
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
      this.masterGain.gain.value = this.volumes.master;
      this.bgmGain.gain.value = this.volumes.bgm;
      this.sfxGain.gain.value = this.volumes.sfx;
      return true;
    } catch {
      return false;
    }
  }

  resume(): void {
    if (this.ensure() && this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => undefined);
  }

  suspendPlayback(): void {
    this.playbackEnabled = false;
    this.stopBgm();
    for (const controller of this.requests.keys()) controller.abort();
    for (const source of this.sources.keys()) this.stopSource(source);
  }

  resumePlayback(): void {
    this.playbackEnabled = true;
  }

  canPlay(): boolean { return this.playbackEnabled && (this.options.canPlay?.() ?? true); }

  getDiagnostics() {
    return { contextState: this.ctx?.state ?? 'uninitialized', bgm: this.currentBgm?.id ?? null,
      activeSources: this.sources.size, pendingRequests: this.requests.size, decodedBuffers: this.bufferCache.size };
  }

  /** Invalidate gameplay sounds, including decodes already in flight, preserving BGM. */
  cancelSfx(): void {
    for (const [controller, bgm] of this.requests) if (!bgm) controller.abort();
    for (const [source, state] of this.sources) if (!state.bgm) this.stopSource(source);
  }

  setMasterVolume(v: number): void {
    this.volumes.master = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volumes.master;
  }

  setBgmVolume(v: number): void {
    this.volumes.bgm = Math.max(0, Math.min(1, v));
    if (this.bgmGain) this.bgmGain.gain.value = this.volumes.bgm;
  }

  setSfxVolume(v: number): void {
    this.volumes.sfx = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.volumes.sfx;
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
    this.trackSource(osc, env, false);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  playBgm(track: BgmTrack | null): void {
    if (!this.canPlay()) return;
    this.stopBgm();
    if (!track) return;
    if (!this.ensure() || !this.ctx || !this.bgmGain) return;
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
      this.trackSource(osc, env, true);
      osc.start(t0);
      osc.stop(t0 + interval / 1000 + 0.05);
      this.bgmStep += 1;
    };
    tick();
    this.bgmInterval = window.setInterval(tick, interval);
  }

  stopBgm(): void {
    this.bgmGeneration++;
    for (const [controller, bgm] of this.requests) if (bgm) controller.abort();
    if (this.bgmInterval !== null) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgm = null;
    for (const [source, entry] of this.sources) if (entry.bgm) this.stopSource(source);
  }

  /** Release this engine's nodes, pending loads, decoded buffers and AudioContext. */
  async dispose(): Promise<void> {
    this.stopBgm();
    for (const controller of this.requests.keys()) controller.abort();
    this.requests.clear();
    for (const source of this.sources.keys()) this.stopSource(source);
    this.bufferCache.clear();
    this.bgmGain?.disconnect();
    this.sfxGain?.disconnect();
    this.masterGain?.disconnect();
    const context = this.ctx;
    this.ctx = null;
    this.bgmGain = this.sfxGain = this.masterGain = null;
    if (context && context.state !== 'closed') await context.close();
  }

  private trackSource(source: AudioScheduledSourceNode, gain: GainNode, bgm: boolean): void {
    this.sources.set(source, { gain, bgm });
    source.onended = () => this.releaseSource(source);
  }

  private releaseSource(source: AudioScheduledSourceNode): void {
    const entry = this.sources.get(source);
    if (!entry) return;
    this.sources.delete(source);
    source.onended = null;
    source.disconnect();
    entry.gain.disconnect();
  }

  private stopSource(source: AudioScheduledSourceNode): void {
    try { source.stop(); } catch { /* A source may already have ended. */ }
    this.releaseSource(source);
  }

  getCurrentBgmId(): string | null {
    return this.currentBgm?.id ?? null;
  }

  private async playFromUrl(url: string, dest: GainNode, volume: number, loop: boolean = false): Promise<void> {
    const context = this.ctx;
    if (!context) return;
    const generation = this.bgmGeneration;
    const controller = new AbortController();
    this.requests.set(controller, loop);
    const current = () => this.ctx === context && !controller.signal.aborted && (!loop || generation === this.bgmGeneration);
    try {
      let buffer = this.bufferCache.get(url);
      if (!buffer) {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok || !current()) return;
        const ab = await res.arrayBuffer();
        if (!current()) return;
        buffer = await context.decodeAudioData(ab);
        if (!current()) return;
        this.bufferCache.set(url, buffer);
      }
      if (!current()) return;
      const src = context.createBufferSource();
      src.buffer = buffer;
      src.loop = loop;
      const env = context.createGain();
      env.gain.value = volume;
      src.connect(env);
      env.connect(dest);
      this.trackSource(src, env, loop);
      try { src.start(); } catch (error) { this.releaseSource(src); throw error; }
    } catch { /* A failed or cancelled audio request must not start a source. */ }
    finally { this.requests.delete(controller); }
  }
}

let _instance: AudioEngine | null = null;
export function createAudioEngine(options: AudioEngineOptions = {}): AudioEngine {
  return new AudioEngine(options);
}
export function getAudioEngine(): AudioEngine {
  if (!_instance) _instance = new AudioEngine();
  return _instance;
}
export type { AudioEngine };
