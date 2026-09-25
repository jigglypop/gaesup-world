import type { NPCInstance } from '../../types';
import { createNPCBrainAdapterRegistry, createNPCObservation, registerNPCBrainAdapter, resolveNPCBrainDecision } from '../brain';
import { createReinforcementAdapter } from '../reinforcement';
import { isNPCPolicyResponse } from '../validatePolicy';

const instance: NPCInstance = { id: 'same', templateId: 'lab', name: 'NPC', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode: 'reinforcement' } };
const context = { instance, observation: createNPCObservation(instance, new Map(), 10) };
const speak = (text: string) => ({ actions: [{ type: 'speak', text }] });
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function transport() {
  const requests: { signal: AbortSignal; reply: (body: unknown) => void; headers: HeadersInit | undefined; url: RequestInfo | URL }[] = [];
  const fetch: typeof globalThis.fetch = (url, init) => new Promise<Response>(resolve => requests.push({ url, headers: init?.headers, signal: init!.signal!, reply: body => resolve({ ok: true, json: async () => body } as Response) }));
  return { fetch, requests };
}

afterEach(() => { jest.useRealTimers(); });

test('registrations have independent leases, including duplicate registration of the same function', () => {
  const registry = createNPCBrainAdapterRegistry(); const other = createNPCBrainAdapterRegistry();
  const adapter = jest.fn(() => undefined);
  const old = registry.register('reinforcement', 'default', adapter);
  const current = registry.register('reinforcement', 'default', adapter);
  old(); expect(registry.resolve(instance.brain)).toBe(adapter); expect(other.resolve(instance.brain)).toBeUndefined();
  registry.suspend(); expect(registry.resolve(instance.brain)).toBeUndefined(); registry.resume();
  expect(registry.resolve(instance.brain)).toBe(adapter); current(); expect(registry.resolve(instance.brain)).toBeUndefined();
  const legacy = registerNPCBrainAdapter('reinforcement', 'test-legacy', adapter);
  expect(resolveNPCBrainDecision({ ...instance, brain: { mode: 'reinforcement', policyId: 'test-legacy' } }, context.observation, undefined, undefined, other)).toBeUndefined();
  expect(adapter).not.toHaveBeenCalled(); legacy(); registry.dispose();
});

test('two clients keep same-ID requests, configuration and response queues independent', async () => {
  const port = transport();
  const a = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/a', apiKey: 'a', headers: { 'X-Test': 'A' }, fallbackToScriptedBehavior: false } });
  const b = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/b', fallbackToScriptedBehavior: false } });
  try {
    const copy = a.configure({}); copy.endpoint = '/mutated'; copy.headers!['X-Test'] = 'mutated';
    a.adapter(context); a.adapter(context); b.adapter(context);
    expect(port.requests).toHaveLength(2); expect(port.requests.map(request => request.url)).toEqual(['/a', '/b']);
    expect(port.requests[0]!.headers).toMatchObject({ Authorization: 'Bearer a', 'X-Test': 'A' });
    expect(port.requests[1]!.headers).not.toHaveProperty('Authorization');
    port.requests[0]!.reply(speak('A')); port.requests[1]!.reply(speak('B')); await flush();
    expect(a.adapter(context)?.actions).toEqual(speak('A').actions); expect(b.adapter(context)?.actions).toEqual(speak('B').actions);
  } finally { a.dispose(); b.dispose(); }
});

test('release, reconfiguration and suspend reject late responses even if transport ignores abort', async () => {
  const port = transport(); const client = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/policy', fallbackToScriptedBehavior: false, minRequestIntervalMs: 0 } });
  try {
    for (const invalidate of [() => client.release('same'), () => client.configure({ endpoint: '/new' }), () => client.suspend()]) {
      client.adapter(context); const old = port.requests.at(-1)!; invalidate();
      expect(old.signal.aborted).toBe(true); expect(client.getStats()).toMatchObject({ pending: 0, instances: 0 });
      client.resume(); client.adapter(context); const fresh = port.requests.at(-1)!;
      old.reply(speak('obsolete')); await flush(); expect(client.getStats().pending).toBe(1);
      fresh.reply(speak('fresh')); await flush(); expect(client.adapter(context)?.actions).toEqual(speak('fresh').actions);
      client.release();
    }
    expect(client.getStats().discardedResponses).toBe(3);
  } finally { client.dispose(); }
});

test('timeout releases an uncooperative request and does not let its finally clear a newer request', async () => {
  jest.useFakeTimers(); const port = transport();
  const client = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/policy', timeoutMs: 30, minRequestIntervalMs: 0, fallbackToScriptedBehavior: false } });
  try {
    client.adapter(context); jest.advanceTimersByTime(30);
    expect(port.requests[0]!.signal.aborted).toBe(true); expect(client.getStats()).toMatchObject({ pending: 0, timedOutRequests: 1 });
    client.adapter(context); port.requests[0]!.reply(speak('old')); await flush(); expect(client.getStats().pending).toBe(1);
    port.requests[1]!.reply(speak('new')); await flush(); expect(client.adapter(context)?.actions).toEqual(speak('new').actions);
  } finally { client.dispose(); }
  expect(jest.getTimerCount()).toBe(0);
});

test('TTL includes transit and queued time; throttling uses monotonic time across simulation rewind', async () => {
  const port = transport(); let time = 0;
  const client = createReinforcementAdapter({ fetch: port.fetch, now: () => time, config: { endpoint: '/policy', minRequestIntervalMs: 100, fallbackToScriptedBehavior: false } });
  try {
    client.adapter(context); time = 20; port.requests[0]!.reply({ ...speak('late'), ttlMs: 10 }); await flush();
    expect(client.getStats()).toMatchObject({ queued: 0, discardedResponses: 1 });
    time = 100; client.adapter(context); port.requests[1]!.reply({ ...speak('expired in queue'), ttlMs: 50 }); await flush();
    time = 151; expect(client.adapter(context)).toBeUndefined(); expect(port.requests).toHaveLength(2);
    time = 200; client.adapter({ ...context, observation: { ...context.observation, timestamp: 0 } }); expect(port.requests).toHaveLength(3);
    expect(client.getStats().discardedResponses).toBe(2);
  } finally { client.dispose(); }
});

test('response validation covers every action and rejects the entire malformed batch', async () => {
  const valid = [ { type: 'idle' }, { type: 'moveTo', target: [1, 2, 3] }, { type: 'patrol', waypoints: [[0, 0, 0]], loop: true }, { type: 'wander', radius: 2 }, { type: 'playAnimation', animationId: 'idle' }, { type: 'lookAt', target: [0, 0, 0] }, { type: 'speak', text: 'hi' }, { type: 'interact', targetId: 'other' }, { type: 'remember', key: 'k', value: { nested: [1, true, null] } } ];
  expect(isNPCPolicyResponse({ actions: valid, ttlMs: 0 })).toBe(true);
  for (const action of [{ type: 'moveTo', target: [NaN, 0, 0] }, { type: 'patrol', waypoints: [[1]] }, { type: 'speak', text: 4 }, { type: 'moveTo', target: [0, 0, 0], speed: -1 }, { type: 'unknown' }]) expect(isNPCPolicyResponse({ actions: [...valid, action] })).toBe(false);
  for (const body of [null, { actions: {} }, { actions: valid, ttlMs: -1 }, { actions: valid, reason: {} }]) expect(isNPCPolicyResponse(body)).toBe(false);
  const port = transport(); const client = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/policy', fallbackToScriptedBehavior: false } });
  try { client.adapter(context); port.requests[0]!.reply({ actions: [{ type: 'moveTo' }] }); await flush(); expect(client.adapter(context)).toBeUndefined(); expect(client.getStats().invalidResponses).toBe(1); } finally { client.dispose(); }
});

test('invalid configuration is atomic and does not cancel a valid pending request', () => {
  const port = transport(); const client = createReinforcementAdapter({ fetch: port.fetch, config: { endpoint: '/policy' } });
  try {
    client.adapter(context); const before = client.getConfig();
    expect(() => client.configure({ timeoutMs: NaN })).toThrow(); expect(client.getConfig()).toEqual(before); expect(port.requests[0]!.signal.aborted).toBe(false);
  } finally { client.dispose(); }
});

test('entity invalidation while JSON is being decoded cannot enqueue the old response', async () => {
  let decode: (body: unknown) => void = () => {};
  let current = true;
  const fetch: typeof globalThis.fetch = async () => ({ ok: true, json: () => new Promise(resolve => { decode = resolve; }) }) as Response;
  const client = createReinforcementAdapter({ fetch, isCurrent: () => current, config: { endpoint: '/policy' } });
  try {
    client.adapter(context); await flush(); current = false; decode(speak('old')); await flush();
    expect(client.getStats()).toMatchObject({ pending: 0, queued: 0, discardedResponses: 1 });
    expect(client.adapter(context)).toBeUndefined();
  } finally { client.dispose(); }
});

test('without a configured endpoint no request leaves and the scripted fallback decides', () => {
  const fetch = jest.fn<ReturnType<typeof globalThis.fetch>, Parameters<typeof globalThis.fetch>>();
  const client = createReinforcementAdapter({ fetch });
  const wanderer: NPCInstance = { ...instance, behavior: { mode: 'wander', speed: 1, wanderRadius: 3 } };
  try {
    const decision = client.adapter({ instance: wanderer, observation: createNPCObservation(wanderer, new Map(), 10) });
    expect(fetch).not.toHaveBeenCalled();
    expect(decision?.reason).toBe('fallback wander');
    expect(client.getStats().requests).toBe(0);
  } finally { client.dispose(); }
});

test('transport failures back off every NPC together until the server answers again', async () => {
  let time = 0;
  let reachable = false;
  const fetch = jest.fn(async () => {
    if (!reachable) throw new TypeError('connect ECONNREFUSED');
    return { ok: true, json: async () => speak('back') } as Response;
  });
  const client = createReinforcementAdapter({ fetch, now: () => time, config: { endpoint: '/policy', minRequestIntervalMs: 0 } });
  const other: NPCInstance = { ...instance, id: 'other' };
  try {
    client.adapter(context); await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    // Within the first second no NPC asks again, including one that never asked.
    time = 500;
    client.adapter(context); client.adapter({ instance: other, observation: createNPCObservation(other, new Map(), 10) }); await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    time = 1000;
    client.adapter(context); await flush();
    expect(fetch).toHaveBeenCalledTimes(2);
    // The second failure doubles the wait.
    time = 2500;
    client.adapter(context); await flush();
    expect(fetch).toHaveBeenCalledTimes(2);
    reachable = true;
    time = 3000;
    client.adapter(context); await flush();
    expect(client.getStats().failures).toBe(0);
    client.adapter({ instance: other, observation: createNPCObservation(other, new Map(), 10) }); await flush();
    expect(fetch).toHaveBeenCalledTimes(4);
  } finally { client.dispose(); }
});
