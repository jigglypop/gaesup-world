import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, createCharacterPlugin, createScenePlugin, useCharacterStore, useSceneStore, useRoomVisibilityStore, toggleCharacterWeapon } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function worldCharacterScene(ctx: ScenarioContext) {
  const identity = `character-scene-${crypto.randomUUID()}`;
  const legacy = [useCharacterStore, useSceneStore, useRoomVisibilityStore] as const;
  const restore = legacy.map(store => { const state = store.getState(); return () => (store.setState as (value: unknown) => void)(state); });
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, plugins: [createCharacterPlugin(), createScenePlugin()] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  type CharacterStore = Pick<typeof useCharacterStore, 'getState'>;
  type SceneStore = Pick<typeof useSceneStore, 'getState'>;
  const rooms: Record<string, ReturnType<typeof useRoomVisibilityStore.getState>> = {};
  const observed: Record<string, string> = {};
  function Consumer({ id }: { id: string }) {
    rooms[id] = useRoomVisibilityStore();
    observed[id] = useCharacterStore(s => s.appearance.name);
    const scene = useSceneStore(s => s.current);
    return <p>월드 {id}: 캐릭터 {observed[id]} · 장면 {scene} · 방 {rooms[id]!.rooms.size}</p>;
  }
  const check = (id: string, actual: number, scope: string) => { ctx.sample(id, actual, 'count', scope); ctx.assert(id, 0, actual); };
  try {
    await a.setup(); await b.setup();
    const ca = a.requireService<CharacterStore>('character.store'); const cb = b.requireService<CharacterStore>('character.store');
    const sa = a.requireService<SceneStore>('scene.store'); const sb = b.requireService<SceneStore>('scene.store');
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>));
    flushSync(() => { ca.getState().setName('Alice'); cb.getState().setName('Bob'); });
    check('character-state-leaks', Number(observed['A'] !== 'Alice') + Number(observed['B'] !== 'Bob'), 'two-real-provider-hooks');
    const toggle = toggleCharacterWeapon as (id: string, store: CharacterStore) => void;
    toggle(`${identity}:weapon`, ca);
    check('equipment-owner-mismatches', Number(ca.getState().outfits.weapon !== `${identity}:weapon`) + Number(cb.getState().outfits.weapon === `${identity}:weapon`), 'public-equipment-command-port');
    flushSync(() => {
      rooms['A']!.registerRoom({ id: identity, sceneId: 'outdoor', bounds: { min: [0, 0, 0], max: [1, 1, 1] } });
      rooms['B']!.registerRoom({ id: identity, sceneId: 'outdoor', bounds: { min: [7, 0, 0], max: [8, 1, 1] } });
      sa.getState().registerScene({ id: identity, name: 'A', interior: true });
      sb.getState().registerScene({ id: identity, name: 'B', interior: true });
    });
    check('room-registration-leaks', Number(rooms['A']!.rooms.get(identity)?.bounds.min[0] !== 0) + Number(rooms['B']!.rooms.get(identity)?.bounds.min[0] !== 7), 'same-room-id-two-worlds');
    check('scene-registration-leaks', Number(sa.getState().scenes[identity]?.name !== 'A') + Number(sb.getState().scenes[identity]?.name !== 'B'), 'same-scene-id-two-worlds');
    await a.save.save('main'); await b.save.save('main'); ca.getState().setName('Changed'); await a.save.load('main');
    check('character-save-mismatches', Number(ca.getState().appearance.name !== 'Alice') + Number(cb.getState().appearance.name !== 'Bob'), 'actual-indexeddb-owned-character-bindings');
    const other = `${identity}:other`; sb.getState().registerScene({ id: other, interior: true });
    await Promise.all([sa.getState().goTo(identity), sb.getState().goTo(other)]);
    check('parallel-scene-mismatches', Number(sa.getState().current !== identity) + Number(sb.getState().current !== other), 'two-concurrent-real-fade-transitions');
    await a.save.save('scene'); await b.save.save('scene');
    const pending = sa.getState().goTo('outdoor'); await a.dispose(); await pending;
    check('scene-after-dispose-mismatches', Number(sa.getState().current !== identity) + Number(sa.getState().pending !== null) + Number(sa.getState().transition.active), 'real-transition-cancelled-by-runtime-disposal');
    check('other-world-scene-mismatches', Number(sb.getState().current !== other), 'one-world-disposal');
    await a.setup(); await sa.getState().goTo('outdoor'); await a.save.load('scene'); await nextFrame(ctx.signal);
    check('scene-restart-save-mismatches', Number(sa.getState().current !== identity) + Number(sb.getState().current !== other), 'restart-and-real-indexeddb-scene-restore');
  } finally {
    flushSync(() => root.unmount());
    for (const runtime of [a, b]) { await runtime.save.remove('main'); await runtime.save.remove('scene'); await runtime.dispose(); }
    for (const apply of restore) apply();
  }
}

export const characterSceneScenarios: Scenario[] = [
  { id: 'world-character-scene', title: '두 월드의 캐릭터·장면 전환', description: '실제 캐릭터·방 훅, 장비 명령, IndexedDB와 동시 장면 전환을 연결해 월드 간 간섭 및 종료·재시작을 계측합니다.', version: 1, requirementIds: ['R25'], run: worldCharacterScene },
];
