import type {
  NPCAction,
  NPCBrainDecision,
  NPCInstance,
  NPCObservation,
} from '../types';
import type { NPCBrainAdapterContext } from './brain';
import { registerNPCBrainAdapter } from './brain';

type ReinforcementPolicyRequest = {
  provider?: string;
  instance: {
    id: string;
    templateId: string;
    name: string;
    brainMode: string;
    behaviorMode: string;
  };
  observation: NPCObservation;
};

type ReinforcementPolicyResponse = {
  actions?: NPCAction[];
  reason?: string;
  ttlMs?: number;
};

export type ReinforcementAdapterConfig = {
  endpoint: string;
  apiKey?: string;
  timeoutMs: number;
  minRequestIntervalMs: number;
  headers?: Record<string, string>;
  fallbackToScriptedBehavior: boolean;
};

type AdapterRuntimeState = {
  inFlight: boolean;
  lastRequestAtMs: number;
  queuedDecision?: NPCBrainDecision;
};

const DEFAULT_CONFIG: ReinforcementAdapterConfig = {
  endpoint: 'http://localhost:8091/policy/step',
  timeoutMs: 3000,
  minRequestIntervalMs: 700,
  headers: {},
  fallbackToScriptedBehavior: true,
};

const runtimeState = new Map<string, AdapterRuntimeState>();
let adapterConfig: ReinforcementAdapterConfig = { ...DEFAULT_CONFIG };
let registered = false;

function nowFromObservation(observation: NPCObservation): number {
  return Math.round(observation.timestamp * 1000);
}

function createWanderTarget(observation: NPCObservation, radius: number): [number, number, number] {
  const seed = observation.timestamp * 1.7 + observation.instanceId.length * 13.37;
  const angle = (Math.sin(seed) * 0.5 + 0.5) * Math.PI * 2;
  const distance = radius * (0.35 + (Math.cos(seed * 0.73) * 0.5 + 0.5) * 0.65);
  return [
    observation.position[0] + Math.cos(angle) * distance,
    observation.position[1],
    observation.position[2] + Math.sin(angle) * distance,
  ];
}

function createFallbackDecision(instance: NPCInstance, observation: NPCObservation): NPCBrainDecision | undefined {
  if (!adapterConfig.fallbackToScriptedBehavior) return undefined;
  const behavior = instance.behavior;
  if (!behavior || behavior.mode === 'idle' || observation.navigationState === 'moving') return undefined;

  if (behavior.mode === 'patrol' && behavior.waypoints && behavior.waypoints.length > 0) {
    return {
      source: 'reinforcement',
      reason: 'fallback patrol',
      actions: [{
        type: 'patrol',
        waypoints: behavior.waypoints,
        speed: behavior.speed,
        ...(behavior.loop !== undefined ? { loop: behavior.loop } : {}),
        ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
      }],
    };
  }

  if (behavior.mode === 'wander') {
    const radius = Math.max(0.5, behavior.wanderRadius ?? 4);
    return {
      source: 'reinforcement',
      reason: 'fallback wander',
      actions: [{
        type: 'moveTo',
        target: createWanderTarget(observation, radius),
        speed: behavior.speed,
        ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
      }],
    };
  }

  return undefined;
}

function normalizeActions(actions: unknown): NPCAction[] {
  if (!Array.isArray(actions)) return [];
  return actions.filter((entry): entry is NPCAction =>
    Boolean(entry) && typeof entry === 'object' && typeof (entry as { type?: unknown }).type === 'string');
}

function queueDecisionFromResponse(
  instanceId: string,
  observation: NPCObservation,
  response: ReinforcementPolicyResponse,
): void {
  const actions = normalizeActions(response.actions);
  if (actions.length === 0) return;
  const state = runtimeState.get(instanceId);
  if (!state) return;
  state.queuedDecision = {
    source: 'reinforcement',
    reason: response.reason ?? `policy@${observation.timestamp.toFixed(2)}`,
    actions,
  };
}

async function requestPolicyDecision(
  context: NPCBrainAdapterContext,
  state: AdapterRuntimeState,
): Promise<void> {
  const { instance, observation } = context;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), adapterConfig.timeoutMs);
  try {
    const provider = instance.brain?.policyId ?? instance.brain?.providerId;
    const payload: ReinforcementPolicyRequest = {
      ...(provider
        ? { provider }
        : {}),
      instance: {
        id: instance.id,
        templateId: instance.templateId,
        name: instance.name,
        brainMode: instance.brain?.mode ?? 'none',
        behaviorMode: instance.behavior?.mode ?? 'idle',
      },
      observation,
    };

    const response = await fetch(adapterConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider
          ? { 'X-Policy-Provider': provider }
          : {}),
        ...(adapterConfig.apiKey ? { Authorization: `Bearer ${adapterConfig.apiKey}` } : {}),
        ...(adapterConfig.headers ?? {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) return;
    const body = await response.json() as ReinforcementPolicyResponse;
    queueDecisionFromResponse(instance.id, observation, body);
  } catch {
    // Silent fail; fallback behavior handles continuity.
  } finally {
    clearTimeout(timeout);
    state.inFlight = false;
  }
}

function reinforcementAdapter(context: NPCBrainAdapterContext): NPCBrainDecision | undefined {
  const { instance, observation } = context;
  const nowMs = nowFromObservation(observation);
  const state = runtimeState.get(instance.id) ?? {
    inFlight: false,
    lastRequestAtMs: -Number.MAX_SAFE_INTEGER,
  };
  runtimeState.set(instance.id, state);

  if (state.queuedDecision) {
    const decision = state.queuedDecision;
    delete state.queuedDecision;
    return decision;
  }

  if (!state.inFlight && (nowMs - state.lastRequestAtMs) >= adapterConfig.minRequestIntervalMs) {
    state.inFlight = true;
    state.lastRequestAtMs = nowMs;
    void requestPolicyDecision(context, state);
  }

  return createFallbackDecision(instance, observation);
}

export function configureReinforcementAdapter(
  config: Partial<ReinforcementAdapterConfig>,
): ReinforcementAdapterConfig {
  adapterConfig = {
    ...adapterConfig,
    ...config,
    headers: {
      ...(adapterConfig.headers ?? {}),
      ...(config.headers ?? {}),
    },
  };
  return adapterConfig;
}

export function getReinforcementAdapterConfig(): ReinforcementAdapterConfig {
  return { ...adapterConfig, headers: { ...(adapterConfig.headers ?? {}) } };
}

export function registerDefaultReinforcementAdapter(): void {
  if (registered) return;
  registerNPCBrainAdapter('reinforcement', 'default', reinforcementAdapter);
  registerNPCBrainAdapter('reinforcement', 'openai', reinforcementAdapter);
  registerNPCBrainAdapter('reinforcement', 'huggingface', reinforcementAdapter);
  registered = true;
}

registerDefaultReinforcementAdapter();
