import { createNPCObservation, resolveNPCBrainDecision } from '../../npc/core/brain';
import { hydrateNPCState } from '../../npc/plugin';
import type { NPCInstance } from '../../npc/types';
import { createGaesupRuntime } from '../createGaesupRuntime';

const npc = (): NPCInstance => ({ id: 'same', templateId: 'lab', name: 'NPC', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode: 'reinforcement' } });
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const decide = (runtime: ReturnType<typeof createGaesupRuntime>) => {
  const instance = runtime.npcStore.getState().instances.get('same')!;
  return resolveNPCBrainDecision(instance, createNPCObservation(instance, runtime.npcStore.getState().instances, 10), runtime.npcStore.getState().brainBlueprints, runtime);
};
const pending: { signal: AbortSignal; reply: (text: string) => void }[] = [];
let previousFetch: typeof globalThis.fetch;
beforeEach(() => {
  previousFetch = globalThis.fetch; pending.length = 0;
  globalThis.fetch = (_url, init) => new Promise<Response>(resolve => pending.push({ signal: init!.signal!, reply: text => resolve({ ok: true, json: async () => ({ actions: [{ type: 'speak', text }] }) } as Response) }));
});
afterEach(async () => { pending.forEach(request => request.reply('cleanup')); await flush(); globalThis.fetch = previousFetch; });

test('owned policy clients follow entity replacement, brain edits and validated snapshot commits', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  try {
    await a.setup(); await b.setup(); a.npcStore.getState().addInstance(npc()); b.npcStore.getState().addInstance(npc());
    a.npcReinforcement.configure({ minRequestIntervalMs: 0 });
    decide(b); const other = pending.at(-1)!;
    for (const invalidate of [
      () => { a.npcStore.getState().removeInstance('same'); a.npcStore.getState().addInstance(npc()); },
      () => a.npcStore.getState().addInstance(npc()),
      () => a.npcStore.getState().updateInstanceBrain('same', { policyId: 'new' }),
      () => a.npcStore.getState().updateInstance('same', { templateId: 'new-template' }),
      () => hydrateNPCState([npc()], a.npcStore),
      () => a.npcStore.setState({ instances: new Map([['same', npc()]]) }),
    ]) {
      decide(a); const old = pending.at(-1)!; invalidate();
      expect(old.signal.aborted).toBe(true); expect(other.signal.aborted).toBe(false);
      old.reply('stale'); await flush(); expect(a.npcReinforcement.getStats()).toMatchObject({ instances: 0, pending: 0, queued: 0 });
    }
    decide(a); const live = pending.at(-1)!;
    expect(() => hydrateNPCState([{ ...npc(), position: [NaN, 0, 0] }], a.npcStore)).toThrow();
    expect(live.signal.aborted).toBe(false);
    a.npcStore.getState().updateNavigationPosition('same', [1, 0, 0]);
    expect(live.signal.aborted).toBe(false);
    live.reply('current'); other.reply('other'); await flush();
    expect(decide(a)?.actions).toEqual([{ type: 'speak', text: 'current' }]);
    expect(decide(b)?.actions).toEqual([{ type: 'speak', text: 'other' }]);
  } finally { await a.dispose(); await b.dispose(); }
});

test('local fallback actions do not cancel the external decision they are waiting for', async () => {
  const runtime = createGaesupRuntime();
  try {
    await runtime.setup(); runtime.npcStore.getState().addInstance({ ...npc(), behavior: { mode: 'patrol', speed: 2, waypoints: [[1, 0, 0]] } });
    const fallback = decide(runtime)!;
    runtime.npcStore.getState().executeInstanceActions('same', fallback.actions);
    expect(pending[0]!.signal.aborted).toBe(false);
    pending[0]!.reply('external'); await flush();
    expect(decide(runtime)?.actions).toEqual([{ type: 'speak', text: 'external' }]);
  } finally { await runtime.dispose(); }
});

test('50 runtime restarts release all requests and keep stopped adapters inert', async () => {
  const runtime = createGaesupRuntime(); runtime.npcStore.getState().addInstance(npc());
  expect(decide(runtime)).toBeUndefined(); expect(pending).toHaveLength(0);
  try {
    for (let i = 0; i < 50; i++) {
      await runtime.setup();
      expect(runtime.getService('gaesup.runtime.npc-brain-adapters')).toBe(runtime.npcBrainAdapters);
      decide(runtime); expect(runtime.npcReinforcement.getStats().pending).toBe(1);
      await runtime.dispose(); const request = pending.at(-1)!;
      expect(request.signal.aborted).toBe(true); request.reply('late'); await flush();
      expect(decide(runtime)).toBeUndefined(); expect(runtime.npcReinforcement.getStats()).toMatchObject({ active: false, instances: 0, pending: 0, queued: 0 });
      expect(runtime.getService('gaesup.runtime.npc-reinforcement')).toBeUndefined();
    }
    expect(pending).toHaveLength(50); expect(runtime.npcReinforcement.getStats().discardedResponses).toBe(50);
  } finally { await runtime.dispose(); }
});

test('setup failure leaves NPC services inactive and a later successful setup restores them', async () => {
  let fail = true;
  const runtime = createGaesupRuntime({ plugins: [{ id: 'npc-test-failure', name: 'NPC setup failure', version: '1.0.0', setup: () => { if (fail) throw new Error('setup failed'); } }] });
  runtime.npcStore.getState().addInstance(npc());
  try {
    await expect(runtime.setup()).rejects.toThrow(); expect(decide(runtime)).toBeUndefined(); expect(pending).toHaveLength(0);
    expect(runtime.getService('gaesup.runtime.npc-brain-adapters')).toBeUndefined();
    fail = false; await runtime.setup(); decide(runtime); expect(pending).toHaveLength(1);
  } finally { await runtime.dispose(); }
});
