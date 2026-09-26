import { Vector3 } from 'three';

import type { GameplayEventBlueprint, GameplayEventTrigger } from '../../gameplay/events/types';
import { createGaesupRuntime } from '../createGaesupRuntime';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const emitting = (id: string, trigger: GameplayEventTrigger): GameplayEventBlueprint =>
  ({ id, name: id, trigger, actions: [{ type: 'emit', eventName: id }] });

test('interacting, entering an area and a new game hour reach the world rule engine', async () => {
  const runtime = createGaesupRuntime();
  await runtime.setup();
  const fired: string[] = [];
  for (const id of ['talk', 'plaza', 'hour']) runtime.plugins.context.events.on(id, () => fired.push(id));
  runtime.gameplayEvents.setBlueprints([
    emitting('talk', { type: 'interaction', targetId: 'npc-1', action: 'interact' }),
    emitting('plaza', { type: 'enterArea', areaId: 'plaza' }),
    emitting('hour', { type: 'timeChanged' }),
  ]);
  try {
    const interactables = runtime.interactablesStore.getState();
    interactables.register({ id: 'npc-1', kind: 'npc', label: 'Luru', position: new Vector3(), range: 2, key: 'E', onActivate: () => {} });
    interactables.track(new Vector3(), 0);
    expect(runtime.interactablesStore.getState().activateCurrent()).toBe(true);

    runtime.gameplayAreas.register({ id: 'plaza', center: [0, 0, 0], size: [4, 4, 4] });
    runtime.stateManager.getActiveState().position.set(0, 0, 0);
    runtime.clockLoop.clock.stepTicks(2);

    runtime.timeStore.getState().tick(60 * 60 * 1000);
    await flush();
    // Two ticks inside the area are one entry.
    expect([...fired].sort()).toEqual(['hour', 'plaza', 'talk']);
  } finally {
    await runtime.dispose();
  }
});
