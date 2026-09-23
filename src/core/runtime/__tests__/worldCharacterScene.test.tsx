import { act, fireEvent, render } from '@testing-library/react';

import { playCameraCinematic } from '../../camera/cinematic';
import { ActionEquipmentPanel } from '../../character/components/ActionEquipmentPanel';
import { createCharacterPlugin } from '../../character/plugin';
import { useCharacterStore, useCharacterStoreApi } from '../../character/stores/characterStore';
import { createScenePlugin } from '../../scene/plugin';
import { useRoomVisibilityStoreApi } from '../../scene/stores/roomVisibilityStore';
import { useSceneStoreApi } from '../../scene/stores/sceneStore';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('character, scene and room hooks resolve their world and actual panel actions edit only that character', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  await a.setup(); await b.setup();
  const observed: Record<string, unknown[]> = {};
  function Consumer({ id }: { id: string }) {
    observed[id] = [useCharacterStoreApi(), useSceneStoreApi(), useRoomVisibilityStoreApi()];
    const name = useCharacterStore(s => s.appearance.name);
    return <><p>{name}</p><ActionEquipmentPanel renderers={{ root: panel => <button onClick={panel.actions.toggleWeapon}>{id}</button> }} /></>;
  }
  const view = render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>);
  try {
    expect(observed['A']).toEqual([a.characterStore, a.sceneStore, a.roomVisibilityStore]);
    expect(observed['B']).toEqual([b.characterStore, b.sceneStore, b.roomVisibilityStore]);
    fireEvent.click(view.getByText('A'));
    expect(a.characterStore.getState().outfits.weapon).toBe('starter-weapon-layer');
    expect(b.characterStore.getState().outfits.weapon).toBeNull();
    act(() => a.characterStore.getState().setName('Owned character'));
    expect(view.getByText('Owned character')).toBeTruthy();
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('save bindings use owned character and scene stores and disposal cancels only its transition', async () => {
  jest.useFakeTimers();
  const make = () => createGaesupRuntime({ plugins: [createCharacterPlugin(), createScenePlugin()] });
  const a = make(); const b = make();
  try {
    await a.setup(); await b.setup();
    for (const world of [a, b]) world.sceneStore.getState().registerScene({ id: 'house' });
    a.characterStore.getState().setName('Alice'); b.characterStore.getState().setName('Bob');
    const saved = a.save.createBlob(); a.characterStore.getState().setName('Changed'); a.save.hydrateBlob(saved);
    expect(a.characterStore.getState().appearance.name).toBe('Alice'); expect(b.characterStore.getState().appearance.name).toBe('Bob');
    const first = a.sceneStore.getState().goTo('house'); const second = b.sceneStore.getState().goTo('house');
    await a.dispose(); await first;
    expect(jest.getTimerCount()).toBe(1);
    await jest.runAllTimersAsync(); await second;
    expect(a.sceneStore.getState().current).toBe('outdoor'); expect(b.sceneStore.getState().current).toBe('house');
    await a.setup(); const restarted = a.sceneStore.getState().goTo('house');
    await jest.runAllTimersAsync(); await restarted;
    expect(a.sceneStore.getState().current).toBe('house');
  } finally { await a.dispose(); await b.dispose(); jest.useRealTimers(); }
});

test('cinematic expression, equipment and fade commands accept explicit world ports', async () => {
  jest.useFakeTimers();
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  try {
    await a.setup(); await b.setup();
    const playback = playCameraCinematic([
      { kind: 'expression', face: 'wink' }, { kind: 'equip', itemId: 'cinematic-weapon' }, { kind: 'fade', direction: 'out' },
    ], { store: a.store, characterStore: a.characterStore, sceneStore: a.sceneStore });
    await jest.runAllTimersAsync(); await playback.finished;
    expect(a.characterStore.getState()).toMatchObject({ appearance: { face: 'wink' }, outfits: { weapon: 'cinematic-weapon' } });
    expect(b.characterStore.getState().outfits.weapon).toBeNull();
    expect(a.sceneStore.getState().transition).toMatchObject({ active: false, progress: 0 }); expect(b.sceneStore.getState().transition.progress).toBe(0);
  } finally { await a.dispose(); await b.dispose(); jest.useRealTimers(); }
});
