import {
  configureReinforcementAdapter, createGaesupRuntime, createNPCObservation,
  getReinforcementAdapterConfig, registerNPCBrainAdapter, resolveNPCBrainDecision,
  type NPCBrainDecision, type NPCInstanceData,
} from 'gaesup-world';

import type { Scenario, ScenarioContext } from './types';

type Runtime = ReturnType<typeof createGaesupRuntime>;
type Registry = { register: typeof registerNPCBrainAdapter };
type Client = { configure: typeof configureReinforcementAdapter };
const registry = (runtime: Runtime) => Reflect.get(runtime, 'npcBrainAdapters') as Registry | undefined;
const client = (runtime: Runtime) => Reflect.get(runtime, 'npcReinforcement') as Client | undefined;
const configure = (runtime: Runtime, endpoint: string) => (client(runtime)?.configure ?? configureReinforcementAdapter)({ endpoint, timeoutMs: 60000, minRequestIntervalMs: 0, fallbackToScriptedBehavior: false });
function decide(runtime: Runtime, instance: NPCInstanceData): NPCBrainDecision | undefined {
  return Reflect.apply(resolveNPCBrainDecision, undefined, [instance, createNPCObservation(instance, runtime.npcStore.getState().instances, 10), runtime.npcStore.getState().brainBlueprints, runtime, registry(runtime)]);
}
const npc = (id: string, mode: 'llm' | 'reinforcement' = 'reinforcement'): NPCInstanceData => ({ id, templateId: 'lab', name: id, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode, policyId: 'lab-owned' } });
const text = (decision: NPCBrainDecision | undefined) => decision?.actions.find(action => action.type === 'speak')?.text;
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

async function withTransport(ctx: ScenarioContext, run: (a: Runtime, b: Runtime, requests: Pending[], metric: (key: string, value: number) => void) => Promise<void>) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const savedFetch = globalThis.fetch; const savedConfig = getReinforcementAdapterConfig();
  const requests: Pending[] = [];
  globalThis.fetch = (url, init) => new Promise<Response>(resolve => requests.push({ url: String(url), signal: init?.signal, reply: body => resolve(Object.assign(new Response(null, { status: 200 }), { json: async () => body })) }));
  const metric = (key: string, value: number) => { ctx.sample(key, value, 'count', 'real-npc-brain-controlled-policy-transport'); ctx.assert(key, 0, value); };
  try {
    await a.setup(); await b.setup();
    await run(a, b, requests, metric);
    ctx.host.textContent = `두 월드의 실제 NPC brain 경로 · 제어된 HTTP 응답 ${requests.length}개 · 외부 서버 호출 없음`;
  } finally {
    await a.dispose(); await b.dispose(); requests.forEach(request => request.reply({})); await flush();
    globalThis.fetch = savedFetch; configureReinforcementAdapter(savedConfig);
  }
}
type Pending = { url: string; signal: AbortSignal | null | undefined; reply: (body: unknown) => void };

async function isolation(ctx: ScenarioContext) {
  await withTransport(ctx, async (a, b, requests, metric) => {
    const entity = npc(`same-${crypto.randomUUID()}`, 'llm');
    const registerA = registry(a)?.register ?? registerNPCBrainAdapter;
    const registerB = registry(b)?.register ?? registerNPCBrainAdapter;
    const ra = registerA('llm', 'lab-owned', () => ({ source: 'external', actions: [{ type: 'speak', text: 'A' }] }));
    const rb = registerB('llm', 'lab-owned', () => ({ source: 'external', actions: [{ type: 'speak', text: 'B' }] }));
    try {
      metric('npc-custom-adapter-world-leaks', Number(text(decide(a, entity)) !== 'A') + Number(text(decide(b, entity)) !== 'B'));
      ra(); metric('npc-adapter-stale-cleanup-loss', Number(text(decide(b, entity)) !== 'B'));
    } finally { ra(); rb(); }
    entity.brain = { mode: 'reinforcement' };
    a.npcStore.getState().addInstance(entity); b.npcStore.getState().addInstance(entity);
    configure(a, '/policy-A'); configure(b, '/policy-B');
    decide(a, entity); decide(b, entity);
    metric('npc-policy-request-owner-mismatches', Math.abs(requests.filter(request => request.url === '/policy-A').length - 1) + Math.abs(requests.filter(request => request.url === '/policy-B').length - 1));
    requests.forEach(request => request.reply({ actions: [{ type: 'speak', text: request.url === '/policy-A' ? 'A' : 'B' }] })); await flush();
    metric('npc-policy-response-world-leaks', Number(text(decide(a, entity)) !== 'A') + Number(text(decide(b, entity)) !== 'B'));
  });
}

async function lifetime(ctx: ScenarioContext) {
  await withTransport(ctx, async (a, _b, requests, metric) => {
    configure(a, '/policy-lifetime');
    const entity = npc(`lifetime-${crypto.randomUUID()}`);
    a.npcStore.getState().addInstance(entity); decide(a, entity);
    const removedRequest = requests.at(-1)!;
    a.npcStore.getState().removeInstance(entity.id); a.npcStore.getState().addInstance({ ...entity });
    removedRequest.reply({ actions: [{ type: 'speak', text: 'removed' }] }); await flush();
    metric('npc-removed-entity-response-leaks', Number(text(decide(a, entity)) === 'removed'));
    // Start a fresh request even when the old implementation returned its queued decision.
    decide(a, entity); const stoppedRequest = requests.at(-1)!;
    await a.dispose();
    metric('npc-policy-unaborted-after-dispose', Number(!stoppedRequest.signal?.aborted));
    stoppedRequest.reply({ actions: [{ type: 'speak', text: 'stopped' }] }); await flush();
    metric('npc-policy-decisions-after-dispose', Number(Boolean(decide(a, entity))));
    await a.setup();
    const before = requests.length; decide(a, entity);
    metric('npc-policy-restart-request-mismatches', Number(requests.length !== before + 1));
    requests.at(-1)!.reply({ actions: [{ type: 'speak', text: 'restarted' }] }); await flush();
    metric('npc-policy-restart-response-mismatches', Number(text(decide(a, entity)) !== 'restarted'));
  });
}

export const npcAdapterScenarios: Scenario[] = [
  { id: 'npc-adapter-isolation', title: 'NPC adapter 월드 분리', description: '같은 NPC ID와 정책 ID를 사용하는 두 월드의 adapter·설정·요청·응답 소유권을 검사합니다.', version: 1, run: isolation },
  { id: 'npc-policy-lifetime', title: 'NPC 정책 요청 수명', description: 'NPC 교체, 월드 종료와 재시작 뒤의 지연 응답을 실제 brain 경로에서 검사합니다. HTTP 전송만 로컬에서 제어합니다.', version: 1, run: lifetime },
];
