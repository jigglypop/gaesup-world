import type { NPCBrainDecision, NPCInstance, NPCObservation } from '../types';
import { registerNPCBrainAdapter, type NPCBrainAdapter, type NPCBrainAdapterContext, type NPCBrainAdapterRegistry } from './brain';
import { isNPCPolicyResponse } from './validatePolicy';

export type ReinforcementAdapterConfig = {
  /** Policy server URL. Empty (the default) sends nothing and NPCs use the scripted fallback. */
  endpoint: string;
  apiKey?: string;
  timeoutMs: number;
  minRequestIntervalMs: number;
  headers?: Record<string, string>;
  fallbackToScriptedBehavior: boolean;
};

export type ReinforcementAdapterOptions = {
  config?: Partial<ReinforcementAdapterConfig>;
  fetch?: typeof globalThis.fetch;
  /** Monotonic wall time for I/O throttling and response age, independent of simulation pause/rewind. */
  now?: () => number;
  isCurrent?: (context: NPCBrainAdapterContext) => boolean;
  active?: boolean;
};

const DEFAULT_CONFIG: ReinforcementAdapterConfig = {
  endpoint: '', timeoutMs: 3000, minRequestIntervalMs: 700,
  headers: {}, fallbackToScriptedBehavior: true,
};
/** Transport failures back off every NPC together: 1 s doubling up to a minute, reset by any answer. */
const FAILURE_BACKOFF_MS = 1000;
const MAX_FAILURE_BACKOFF_MS = 60_000;
type RequestState = {
  brain: NPCInstance['brain'];
  templateId: string;
  lastRequestAtMs: number;
  controller?: AbortController;
  timer?: ReturnType<typeof setTimeout>;
  queued?: { decision: NPCBrainDecision; expiresAt: number };
};

function fallback(instance: NPCInstance, observation: NPCObservation): NPCBrainDecision | undefined {
  const behavior = instance.behavior;
  if (!behavior || behavior.mode === 'idle' || observation.navigationState === 'moving') return undefined;
  if (behavior.mode === 'patrol' && behavior.waypoints?.length) {
    return { source: 'reinforcement', reason: 'fallback patrol', actions: [{
      type: 'patrol', waypoints: behavior.waypoints, speed: behavior.speed, loop: behavior.loop ?? true,
      ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
    }] };
  }
  if (behavior.mode === 'wander') {
    const seed = observation.timestamp * 1.7 + observation.instanceId.length * 13.37;
    const angle = (Math.sin(seed) * 0.5 + 0.5) * Math.PI * 2;
    const distance = Math.max(0.5, behavior.wanderRadius ?? 4) * (0.35 + (Math.cos(seed * 0.73) * 0.5 + 0.5) * 0.65);
    return { source: 'reinforcement', reason: 'fallback wander', actions: [{
      type: 'moveTo', target: [observation.position[0] + Math.cos(angle) * distance, observation.position[1], observation.position[2] + Math.sin(angle) * distance], speed: behavior.speed,
      ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
    }] };
  }
  return undefined;
}

export function createReinforcementAdapter(options: ReinforcementAdapterOptions = {}) {
  const states = new Map<string, RequestState>();
  const now = options.now ?? (() => performance.now());
  let config: ReinforcementAdapterConfig = { ...DEFAULT_CONFIG, headers: {} };
  let active = options.active ?? true;
  let requests = 0; let discardedResponses = 0; let invalidResponses = 0; let timedOutRequests = 0;
  let failures = 0; let backoffUntil = 0;
  const failed = () => { failures++; backoffUntil = now() + Math.min(MAX_FAILURE_BACKOFF_MS, FAILURE_BACKOFF_MS * 2 ** (failures - 1)); };
  const getConfig = () => ({ ...config, headers: { ...config.headers } });
  const cancel = (state: RequestState) => {
    const controller = state.controller;
    delete state.controller;
    if (state.timer !== undefined) clearTimeout(state.timer);
    delete state.timer; delete state.queued;
    controller?.abort();
  };
  const release = (instanceId?: string) => {
    if (instanceId !== undefined) {
      const state = states.get(instanceId); states.delete(instanceId);
      if (state) cancel(state);
    } else {
      const previous = [...states.values()]; states.clear(); previous.forEach(cancel);
    }
  };
  const configure = (updates: Partial<ReinforcementAdapterConfig>) => {
    const candidate = { ...config, ...updates, headers: { ...config.headers, ...updates.headers } };
    candidate.endpoint = typeof candidate.endpoint === 'string' ? candidate.endpoint.trim() : '';
    if (!Number.isFinite(candidate.timeoutMs) || candidate.timeoutMs <= 0
      || !Number.isFinite(candidate.minRequestIntervalMs) || candidate.minRequestIntervalMs < 0) {
      throw new TypeError('Invalid NPC policy endpoint or request timing');
    }
    release(); config = candidate; failures = 0; backoffUntil = 0;
    return getConfig();
  };
  if (options.config) configure(options.config);
  const current = (context: NPCBrainAdapterContext) => options.isCurrent?.(context) ?? true;

  async function request(context: NPCBrainAdapterContext, state: RequestState) {
    const controller = new AbortController(); state.controller = controller;
    const requestConfig = getConfig(); const startedAt = now();
    const valid = () => active && states.get(context.instance.id) === state && state.controller === controller && !controller.signal.aborted && current(context);
    state.timer = setTimeout(() => {
      if (state.controller !== controller) return;
      timedOutRequests++; cancel(state);
    }, requestConfig.timeoutMs);
    requests++;
    try {
      const { instance, observation } = context;
      const provider = instance.brain?.policyId ?? instance.brain?.providerId;
      const response = await (options.fetch ?? globalThis.fetch)(requestConfig.endpoint, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(provider ? { 'X-Policy-Provider': provider } : {}), ...(requestConfig.apiKey ? { Authorization: `Bearer ${requestConfig.apiKey}` } : {}), ...requestConfig.headers },
        body: JSON.stringify({ ...(provider ? { provider } : {}), instance: { id: instance.id, templateId: instance.templateId, name: instance.name, brainMode: instance.brain?.mode ?? 'none', behaviorMode: instance.behavior?.mode ?? 'idle' }, observation }),
      });
      if (!response.ok) { failed(); if (!valid()) discardedResponses++; return; }
      failures = 0; backoffUntil = 0;
      if (!valid()) { discardedResponses++; return; }
      const body: unknown = await response.json();
      if (!valid()) { discardedResponses++; return; }
      if (!isNPCPolicyResponse(body)) { invalidResponses++; return; }
      // TTL is observation age, measured from dispatch; omitted TTL uses the request deadline.
      const expiresAt = startedAt + Math.min(body.ttlMs ?? requestConfig.timeoutMs, requestConfig.timeoutMs);
      if (now() >= expiresAt) { discardedResponses++; return; }
      if (body.actions?.length) state.queued = { expiresAt, decision: { source: 'reinforcement', reason: body.reason ?? `policy@${observation.timestamp.toFixed(2)}`, actions: body.actions } };
    } catch {
      // Transport failures keep the local fallback; an abort from release or timeout is not a server failure.
      if (!controller.signal.aborted) failed();
    } finally {
      if (state.controller === controller) {
        if (state.timer !== undefined) clearTimeout(state.timer);
        delete state.timer; delete state.controller;
      }
    }
  }

  const adapter: NPCBrainAdapter = context => {
    if (!active || !current(context)) return undefined;
    const { instance, observation } = context;
    let state = states.get(instance.id);
    if (state && (state.brain !== instance.brain || state.templateId !== instance.templateId)) { release(instance.id); state = undefined; }
    if (!state) {
      state = { brain: instance.brain, templateId: instance.templateId, lastRequestAtMs: -Infinity };
      states.set(instance.id, state);
    }
    const time = now();
    if (state.queued) {
      const queued = state.queued; delete state.queued;
      if (time < queued.expiresAt) return queued.decision;
      discardedResponses++;
    }
    if (config.endpoint && !state.controller && time >= backoffUntil && time - state.lastRequestAtMs >= config.minRequestIntervalMs) {
      state.lastRequestAtMs = time; void request(context, state);
    }
    return config.fallbackToScriptedBehavior ? fallback(instance, observation) : undefined;
  };
  return {
    adapter, configure, getConfig, release,
    suspend() { active = false; release(); },
    resume() { active = true; },
    dispose() { active = false; release(); },
    getStats() {
      let pending = 0; let queued = 0;
      for (const state of states.values()) { pending += Number(Boolean(state.controller)); queued += Number(Boolean(state.queued)); }
      return { active, instances: states.size, pending, queued, requests, discardedResponses, invalidResponses, timedOutRequests, failures };
    },
  };
}
export type ReinforcementAdapter = ReturnType<typeof createReinforcementAdapter>;

export function attachReinforcementAdapter(registry: NPCBrainAdapterRegistry, client: ReinforcementAdapter): () => void {
  const releases = ['default', 'openai', 'huggingface'].map(id => registry.register('reinforcement', id, client.adapter));
  return () => releases.forEach(release => release());
}

const legacyClient = createReinforcementAdapter();
let registered = false;
export const configureReinforcementAdapter = legacyClient.configure;
export const getReinforcementAdapterConfig = legacyClient.getConfig;
export function registerDefaultReinforcementAdapter(): void {
  if (registered) return;
  for (const id of ['default', 'openai', 'huggingface']) registerNPCBrainAdapter('reinforcement', id, legacyClient.adapter);
  registered = true;
}
registerDefaultReinforcementAdapter();
