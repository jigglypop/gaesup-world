import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, createAudioPlugin, getAudioEngine, useAudioStore, useAmbientBgm } from 'gaesup-world';

import { nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';

async function worldAudio(ctx: ScenarioContext) {
  const identity = `audio-world-${crypto.randomUUID()}`;
  const previous = useAudioStore.getState();
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, plugins: [createAudioPlugin()] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  const engine = (world: typeof a) => (world as typeof a & { audioEngine?: ReturnType<typeof getAudioEngine> }).audioEngine ?? getAudioEngine();
  const ea = engine(a); const eb = engine(b);
  const nativeContext = (value: typeof ea) => (value as unknown as { ctx: AudioContext | null }).ctx;
  const sourceCount = (value: typeof ea) => (value as unknown as { sources: Map<unknown, unknown> }).sources.size;
  const originalSubscribe = a.timeStore.subscribe; let subscriptions = 0;
  a.timeStore.subscribe = listener => { subscriptions++; const off = originalSubscribe(listener); let released = false; return () => { if (!released) { released = true; subscriptions--; off(); } }; };
  const observed: Record<string, string | null> = {};
  function Consumer({ id }: { id: string }) { useAmbientBgm(); observed[id] = useAudioStore(s => s.currentBgmId); return <p>월드 {id}: {observed[id]}</p>; }
  const tree = (count: number) => <><GaesupRuntimeProvider runtime={a}>{Array.from({ length: count }, (_, i) => <Consumer key={i} id={`A${i}`} />)}</GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>;
  const check = (id: string, expected: number, actual: number, scope: string) => { ctx.sample(id, actual, 'count', scope); ctx.assert(id, expected, actual); };
  try {
    await ea.dispose(); if (ea !== eb) await eb.dispose();
    await a.setup(); await b.setup();
    type AudioStore = Pick<typeof useAudioStore, 'getState'>;
    const sa = a.requireService<AudioStore>('audio.store'); const sb = b.requireService<AudioStore>('audio.store');
    sa.getState().setMaster(0.02); sb.getState().setMaster(0.04);
    check('audio-settings-contexts', 0, new Set([nativeContext(ea), nativeContext(eb)].filter(Boolean)).size, 'settings-before-playback-native-context-count');
    check('audio-settings-leaks', 0, Number(sa.getState().masterVolume !== 0.02) + Number(sb.getState().masterVolume !== 0.04), 'owned-audio-settings');
    await a.save.save('main'); await b.save.save('main'); sa.getState().setMaster(0.03); await a.save.load('main');
    check('audio-save-mismatches', 0, Number(sa.getState().masterVolume !== 0.02) + Number(sb.getState().masterVolume !== 0.04), 'actual-indexeddb-audio-settings');
    a.timeStore.getState().setTotalMinutes(12 * 60); b.timeStore.getState().setTotalMinutes(0);
    flushSync(() => root.render(tree(2)));
    const contexts = [...new Set([nativeContext(ea), nativeContext(eb)].filter((value): value is AudioContext => !!value))];
    for (const context of contexts) void context.resume().catch(() => undefined);
    for (let i = 0; i < 30 && contexts.some(value => value.state !== 'running'); i++) await nextFrame(ctx.signal);
    if (!contexts.length || contexts.some(value => value.state !== 'running')) throw new UnsupportedScenario('AudioContext 재생 권한이 필요합니다.');
    check('ambient-active-subscriptions', 1, subscriptions, 'two-actual-ambient-hook-consumers');
    check('ambient-world-mismatches', 0, Number(!ea.getCurrentBgmId()?.startsWith('bgm.day.')) + Number(!eb.getCurrentBgmId()?.startsWith('bgm.night.')), 'real-native-audio-contexts');
    flushSync(() => root.render(tree(1)));
    check('ambient-unmount-mismatches', 0, Number(!ea.getCurrentBgmId()?.startsWith('bgm.day.')) + Number(!eb.getCurrentBgmId()?.startsWith('bgm.night.')), 'one-of-two-consumers-unmounted');
    b.timeStore.getState().setTotalMinutes(7 * 60); await nextFrame(ctx.signal);
    const otherContext = nativeContext(eb); const otherTrack = eb.getCurrentBgmId();
    await a.dispose(); await nextFrame(ctx.signal);
    check('audio-contexts-after-dispose', 0, Number(nativeContext(ea) !== null), 'owned-native-context-closed');
    check('ambient-subscriptions-after-dispose', 0, subscriptions, 'mounted-hooks-runtime-disposal');
    check('audio-other-world-disposal-mismatches', 0, Number(!otherContext || otherContext.state === 'closed') + Number(!otherTrack || eb.getCurrentBgmId() !== otherTrack), 'other-native-context-and-track-still-active');
    const before = sourceCount(ea); sa.getState().playSfx({ id: 'stale', duration: 1 });
    check('audio-stale-command-sources', 0, sourceCount(ea) - before, 'retained-store-after-disposal');
    await a.setup(); await nextFrame(ctx.signal);
    check('audio-restart-mismatches', 0, Number(!ea.getCurrentBgmId()?.startsWith('bgm.day.')) + Number(subscriptions !== 1) + Number(eb.getCurrentBgmId() !== otherTrack), 'mounted-hooks-runtime-restart');
  } finally {
    flushSync(() => root.unmount());
    for (const world of [a, b]) { await world.save.remove('main'); await world.dispose(); }
    await ea.dispose(); if (ea !== eb) await eb.dispose();
    a.timeStore.subscribe = originalSubscribe; useAudioStore.setState(previous);
  }
}

export const worldAudioScenarios: Scenario[] = [
  { id: 'world-audio', title: '두 월드의 오디오·BGM 구독', description: '실제 AudioContext와 배경음 훅을 사용해 지연 초기화, 월드 간섭, 중복 구독, 일부 해제 및 종료·재시작을 측정합니다.', version: 1, requirementIds: ['R07', 'R25'], run: worldAudio },
];
