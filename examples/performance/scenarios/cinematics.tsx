import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider, playCameraCinematic, CinematicPanel, useCharacterStore, type CameraCinematicPlayback } from 'gaesup-world';

import type { Scenario, ScenarioContext } from './types';

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const ports = (runtime: ReturnType<typeof createGaesupRuntime>) => ({ store: runtime.store, characterStore: runtime.characterStore, sceneStore: runtime.sceneStore, dialogStore: runtime.dialogStore });
function metrics(ctx: ScenarioContext) { return (name: string, value: number) => { ctx.sample(name, value, 'count', 'actual-cinematic-api-and-world-lifecycle'); ctx.assert(name, 0, value); }; }

async function lifetime(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime(); const plays: CameraCinematicPlayback[] = []; const metric = metrics(ctx);
  const play = (beats: Parameters<typeof playCameraCinematic>[0], extra: Parameters<typeof playCameraCinematic>[1] = {}) => { const run = playCameraCinematic(beats, { ...ports(runtime), ...extra }); plays.push(run); return run; };
  try {
    await runtime.setup();
    const cancelled = play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 180 }]); cancelled.cancel();
    metric('cinematic-cancel-pending', await Promise.race([cancelled.finished.then(() => 0), wait(0).then(() => 1)])); await cancelled.finished;
    const old = play([{ kind: 'closeUp', target: [1, 0, 0], durationMs: 50 }]);
    const current = play([{ kind: 'closeUp', target: [2, 0, 0], durationMs: 140 }]);
    await old.finished; metric('cinematic-stale-completion-restores', Number(runtime.store.getState().cameraOption.focus !== true));
    old.cancel(); metric('cinematic-stale-cancel-restores', Number(runtime.store.getState().cameraOption.focus !== true)); await current.finished;
    runtime.store.getState().setCameraOption({ offset: new THREE.Vector3(1, 2, 3) });
    const shake = play([{ kind: 'shake', intensity: 0.2, durationMs: 80 }]); shake.cancel();
    metric('cinematic-shake-offset-loss', Number(!runtime.store.getState().cameraOption.offset?.equals(new THREE.Vector3(1, 2, 3)))); await shake.finished;
    runtime.sceneStore.getState().setTransition({ active: false, progress: 0, color: '#000000' });
    const fade = play([{ kind: 'fade', direction: 'out', durationMs: 80 }]); fade.cancel();
    metric('cinematic-cancelled-fade-active', Number(runtime.sceneStore.getState().transition.active)); await fade.finished;
    const failure = play([{ kind: 'closeUp', target: [3, 0, 0] }, { kind: 'event', name: 'failure' }], { onEvent: () => { throw new Error('controlled cinematic callback failure'); } });
    await failure.finished.catch(() => {}); metric('cinematic-error-camera-leaks', Number(runtime.store.getState().cameraOption.focus));
    ctx.host.textContent = '취소·중첩 재생·shake/fade 복원·실패 후 카메라 수명 검사 완료';
  } finally { plays.forEach(playback => playback.cancel()); await Promise.allSettled(plays.map(playback => playback.finished)); await runtime.dispose(); }
}

async function worldLifecycle(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const metric = metrics(ctx); const plays: CameraCinematicPlayback[] = [];
  let hitsA = 0; let hitsB = 0;
  try {
    await a.setup(); await b.setup();
    const beats = [{ kind: 'closeUp' as const, target: [1, 0, 0] as [number, number, number], durationMs: 80 }, { kind: 'event' as const, name: 'after-wait' }];
    const first = playCameraCinematic(beats, { ...ports(a), onEvent: () => { hitsA++; } });
    const second = playCameraCinematic(beats, { ...ports(b), onEvent: () => { hitsB++; } }); plays.push(first, second);
    await a.dispose(); metric('cinematic-disposed-camera-leaks', Number(a.store.getState().cameraOption.focus));
    await Promise.all([first.finished, second.finished]);
    metric('cinematic-effects-after-dispose', hitsA); metric('cinematic-other-world-stops', Number(hitsB !== 1));
    const stopped = playCameraCinematic([{ kind: 'event', name: 'inactive' }], { ...ports(a), onEvent: () => { hitsA++; } }); plays.push(stopped); await stopped.finished;
    metric('cinematic-inactive-playback-effects', hitsA);
    await a.setup(); const before = hitsA;
    const restarted = playCameraCinematic([{ kind: 'event', name: 'restarted' }], { ...ports(a), onEvent: () => { hitsA++; } }); plays.push(restarted); await restarted.finished;
    metric('cinematic-restart-mismatches', Number(hitsA !== before + 1));
    ctx.host.textContent = '두 월드의 독립 재생·종료·비활성 명령·재시작 검사 완료';
  } finally { plays.forEach(playback => playback.cancel()); await Promise.allSettled(plays.map(playback => playback.finished)); await a.dispose(); await b.dispose(); }
}

async function editorOwnership(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host); const metric = metrics(ctx);
  const legacy = useCharacterStore.getState(); let late = 0; let mounted = true;
  try {
    await a.setup(); await b.setup(); const before = a.characterStore.getState().appearance.face;
    const face = before === 'surprised' ? 'smile' : 'surprised';
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><CinematicPanel beats={[{ kind: 'expression', face, durationMs: 100 }, { kind: 'event', name: 'late' }]} playbackOptions={{ onEvent: () => { late++; } }} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><CinematicPanel beats={[]} /></GaesupRuntimeProvider></>));
    const button = Array.from(ctx.host.querySelectorAll('button')).find(button => button.textContent?.trim() === '미리 보기'); if (!button) throw new Error('Cinematic preview button missing');
    flushSync(() => button.click());
    metric('cinematic-editor-owner-mismatches', Number(a.characterStore.getState().appearance.face !== face) + Number(useCharacterStore.getState().appearance.face !== legacy.appearance.face));
    metric('cinematic-editor-other-world-changes', Number(b.characterStore.getState().appearance.face !== before));
    flushSync(() => root.unmount()); mounted = false; await wait(130);
    metric('cinematic-editor-effects-after-unmount', late);
    ctx.host.textContent = '실제 CinematicPanel의 Provider 소유권과 unmount 취소 검사 완료';
  } finally { if (mounted) flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); useCharacterStore.getState().setFace(legacy.appearance.face); }
}

export const cinematicScenarios: Scenario[] = [
  { id: 'cinematic-lifetime', title: '시네마틱 취소·중첩 수명', description: '실제 재생 API의 즉시 취소, 이전 실행의 복원 간섭, shake/fade 및 오류 복원을 검사합니다.', version: 1, run: lifetime },
  { id: 'world-cinematic-lifecycle', title: '월드별 시네마틱 수명', description: '두 월드에서 재생·종료·비활성 명령·재시작을 검사합니다.', version: 1, run: worldLifecycle },
  { id: 'cinematic-editor-ownership', title: '시네마틱 editor 소유권', description: '실제 두 Provider의 CinematicPanel 미리 보기와 unmount 후 실행을 검사합니다.', version: 1, run: editorOwnership },
];
