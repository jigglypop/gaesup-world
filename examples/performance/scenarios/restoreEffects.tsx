import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, createTimePlugin, createWeatherPlugin, createAudioPlugin, createScenePlugin, useAmbientBgm } from 'gaesup-world';

import { nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const check = (ctx: ScenarioContext, id: string, actual: number) => { ctx.sample(id, actual, 'count', 'actual-runtime-restore-and-audio'); ctx.assert(id, 0, actual); };

async function restoreEffects(ctx: ScenarioContext) {
  const id = `restore-effects-${crypto.randomUUID()}`;
  const make = (suffix: string) => createGaesupRuntime({ worldId: `${id}:${suffix}`, plugins: [createTimePlugin(), createWeatherPlugin(), createAudioPlugin(), createScenePlugin()] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  const release: Array<() => void> = []; let intermediateAudio = 0; let lateA = 0; let lateB = 0;
  const play = a.audioStore.getState().playBgm;
  a.audioStore.setState({ playBgm: track => { if (a.save.isRestoring()) intermediateAudio++; play(track); } });
  function Consumer() { useAmbientBgm(); return null; }
  try {
    await a.setup(); await b.setup();
    for (const runtime of [a, b]) for (const scene of ['home', 'stale']) runtime.sceneStore.getState().registerScene({ id: scene, name: scene, interior: true });
    a.timeStore.getState().setTotalMinutes(0);
    a.weatherStore.setState({ current: { day: 1, kind: 'sunny', intensity: 1 } });
    await a.save.save('main');
    a.timeStore.getState().setTotalMinutes(720);
    a.weatherStore.setState({ current: { day: 1, kind: 'rain', intensity: 1 } });
    a.sceneStore.setState({ current: 'home' });
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer /><Consumer /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer /></GaesupRuntimeProvider></>));
    const bAudio = b.audioStore.getState().bgmRevision;
    const aPlayback = a.cinematics.play([{ kind: 'closeUp', target: [3, 2, 1], durationMs: 120 }, { kind: 'event', name: 'stale' }], { onEvent: () => { lateA++; } });
    b.cinematics.play([{ kind: 'closeUp', target: [6, 2, 1], durationMs: 120 }, { kind: 'event', name: 'other' }], { onEvent: () => { lateB++; } });
    let attempted = false;
    release.push(a.sceneStore.subscribe((state, previous) => {
      if (a.save.isRestoring() && state.current !== previous.current && !attempted) { attempted = true; void state.goTo('stale'); }
    }));
    await a.save.load('main'); await wait(650);
    check(ctx, 'restore-late-cinematic-effects', lateA);
    check(ctx, 'restore-cinematic-cancellation-misses', Number(aPlayback.state !== 'cancelled'));
    check(ctx, 'restore-reentrant-scene-mismatches', Number(!attempted) + Number(a.sceneStore.getState().current !== 'outdoor'));
    check(ctx, 'restore-intermediate-audio-plays', intermediateAudio);
    check(ctx, 'restore-final-audio-mismatches', Number(a.audioEngine.getCurrentBgmId() !== 'bgm.night.sunny'));
    check(ctx, 'restore-other-world-effects', Number(lateB !== 1) + Number(b.audioStore.getState().bgmRevision !== bAudio));

    let after = 0;
    const fresh = a.cinematics.play([{ kind: 'event', name: 'fresh' }], { onEvent: () => { after++; } });
    await fresh.finished; await a.sceneStore.getState().goTo('home');
    check(ctx, 'restore-effects-resume-mismatches', Number(after !== 1) + Number(a.sceneStore.getState().current !== 'home'));

    let value = 1;
    const off = a.save.register({ key: 'failure', serialize: () => value, hydrate: data => { value = Number(data); if (data === 99) throw new Error('intentional restore failure'); } });
    const snapshot = a.save.createBlob(); snapshot.domains['failure'] = 99;
    snapshot.domains['time'] = { ...a.timeStore.getState().serialize(), totalMinutes: 720 };
    const rollbackPlayback = a.cinematics.play([{ kind: 'closeUp', target: [1, 1, 1], durationMs: 120 }, { kind: 'event', name: 'rollback-stale' }], { onEvent: () => { lateA++; } });
    intermediateAudio = 0; let rejected = false;
    try { a.save.hydrateBlob(snapshot); } catch { rejected = true; }
    off(); await wait(150);
    check(ctx, 'restore-rollback-effects', Number(!rejected) + Number(value !== 1) + Number(rollbackPlayback.state !== 'cancelled') + Number(a.audioEngine.getCurrentBgmId() !== 'bgm.night.sunny') + intermediateAudio);
    let invalidEffect = 0;
    const invalidPlayback = a.cinematics.play([{ kind: 'closeUp', target: [1, 1, 1], durationMs: 30 }, { kind: 'event', name: 'valid-timeline' }], { onEvent: () => { invalidEffect++; } });
    const invalid = a.save.createBlob(); invalid.domains['time'] = { version: -1 };
    try { a.save.hydrateBlob(invalid); } catch { /* Invalid data must not cancel the live timeline. */ }
    await invalidPlayback.finished;
    check(ctx, 'restore-invalid-data-effects', Number(invalidEffect !== 1));
    ctx.host.dataset['restoreEffects'] = 'finished';
  } finally { for (const off of release) off(); flushSync(() => root.unmount()); await a.save.remove('main'); await a.dispose(); await b.dispose(); }
}

async function restoreAudioDecode(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const native = (runtime: typeof a) => (runtime.audioEngine as unknown as { ctx: AudioContext | null }).ctx;
  const sounds = (runtime: typeof a) => [...(runtime.audioEngine as unknown as { sources: Map<AudioNode, { bgm: boolean }> }).sources.values()].filter(source => !source.bgm).length;
  const buffer = new ArrayBuffer(1644); const view = new DataView(buffer);
  const label = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
  label(0, 'RIFF'); view.setUint32(4, 1636, true); label(8, 'WAVE'); label(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, 8000, true); view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); label(36, 'data'); view.setUint32(40, 1600, true);
  const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  let releaseDecode = () => {}; let restoreDecode = () => {};
  try {
    await a.setup(); await b.setup();
    a.audioStore.getState().setMaster(0); b.audioStore.getState().setMaster(0);
    a.audioStore.getState().playBgm({ id: 'manual', intervalMs: 10000 });
    a.audioStore.getState().playSfx({ id: 'active', duration: 10 }); b.audioStore.getState().playSfx({ id: 'other', duration: 10 });
    const context = native(a); if (!context) throw new UnsupportedScenario('실제 AudioContext가 필요합니다.');
    await context.resume(); if (context.state !== 'running') throw new UnsupportedScenario('AudioContext 재생 권한이 필요합니다.');
    const decode = context.decodeAudioData; restoreDecode = () => { context.decodeAudioData = decode; };
    let entered = false; let work: Promise<AudioBuffer> | undefined;
    const gate = new Promise<void>(resolve => { releaseDecode = resolve; });
    context.decodeAudioData = data => { entered = true; work = gate.then(() => decode.call(context, data)); return work; };
    a.audioStore.getState().playSfx({ id: 'pending', url });
    for (let i = 0; i < 120 && !entered; i++) await nextFrame(ctx.signal);
    if (!entered) throw new Error('Native audio decode did not start');
    const requests = [...(a.audioEngine as unknown as { requests: Map<AbortController, boolean> }).requests.keys()];
    check(ctx, 'restore-audio-fixture-mismatches', Number(sounds(a) !== 1) + Number(sounds(b) !== 1) + Number(requests.length !== 1));
    a.save.hydrateBlob(a.save.createBlob());
    check(ctx, 'restore-pending-sfx-abort-misses', requests.filter(request => !request.signal.aborted).length);
    releaseDecode(); await work; await Promise.resolve(); await Promise.resolve();
    check(ctx, 'restore-late-native-audio-sources', sounds(a));
    check(ctx, 'restore-native-audio-other-state', Number(sounds(b) !== 1) + Number(a.audioEngine.getCurrentBgmId() !== 'manual'));
    a.audioStore.getState().playSfx({ id: 'fresh', duration: 10 });
    check(ctx, 'restore-native-audio-resume-misses', Number(sounds(a) !== 1));
  } finally { releaseDecode(); restoreDecode(); URL.revokeObjectURL(url); await a.dispose(); await b.dispose(); }
}

export const restoreEffectScenarios: Scenario[] = [
  { id: 'world-restore-effects', title: '복원 중 시네마틱·장면·오디오', description: '두 실제 Provider, IndexedDB 복원, 지연 시네마틱·재진입 장면 이동·중간 BGM·롤백·잘못된 snapshot의 효과 수명을 검사합니다.', version: 1, run: restoreEffects },
  { id: 'world-restore-audio-decode', title: '복원 중 지연 오디오 decode', description: '실제 AudioContext와 WAV 디코드를 지연해 이전 SFX의 재생 차단, 수동 BGM·다른 월드 보존, 복원 후 새 효과음을 검사합니다.', version: 1, run: restoreAudioDecode },
];
