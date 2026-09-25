import { Physics } from '@react-three/rapier';
import { useStore } from 'zustand';

import { createGaesupRuntime, GaesupRuntimeProvider, NPCInstance, type NPCInstanceData } from 'gaesup-world';

import { mountScene } from './scene';
import type { Scenario, ScenarioContext } from './types';

async function npcFrame(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const savedFetch = globalThis.fetch;
  const requests = { a: 0, b: 0 };
  globalThis.fetch = (url, init) => {
    const owner = String(url) === '/lab/npc-policy-frame-a' ? 'a' : String(url) === '/lab/npc-policy-frame-b' ? 'b' : undefined;
    if (!owner) return savedFetch(url, init);
    requests[owner]++;
    return Promise.resolve(Object.assign(new Response(null, { status: 200 }), { json: async () => ({ actions: [{ type: 'remember', key: 'owner', value: owner }] }) }));
  };
  const metric = (key: string, value: number) => { ctx.sample(key, value, 'count', 'mounted-npc-instance-native-renderer-two-providers'); ctx.assert(key, 0, value); };
  function Actor({ runtime }: { runtime: typeof a }) {
    const instance = useStore(runtime.npcStore, state => state.instances.get('same'));
    return instance ? <NPCInstance instance={instance} isEditMode={false} /> : null;
  }
  let scene: Awaited<ReturnType<typeof mountScene>> | undefined;
  try {
    for (const [owner, runtime, x, color] of [['a', a, -2, '#50cdd4'], ['b', b, 2, '#efb454']] as const) {
      await runtime.setup();
      runtime.npcStore.getState().addTemplate({ id: 'lab', name: 'Lab actor', category: 'humanoid', baseParts: [{ id: 'body', type: 'body', url: '', position: [0, 1, 0], scale: [2, 4, 2], color }], clothingParts: [] });
      const entity: NPCInstanceData = { id: 'same', templateId: 'lab', name: owner, position: [x, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode: 'reinforcement' }, behavior: { mode: 'idle', speed: 1, waitSeconds: 0.5 } };
      runtime.npcStore.getState().addInstance(entity);
      runtime.npcReinforcement.configure({ endpoint: `/lab/npc-policy-frame-${owner}`, fallbackToScriptedBehavior: false, minRequestIntervalMs: 100 });
    }
    scene = await mountScene(ctx, [], false, <Physics gravity={[0, 0, 0]}><GaesupRuntimeProvider runtime={a}><Actor runtime={a} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Actor runtime={b} /></GaesupRuntimeProvider></Physics>);
    scene.state.camera.position.set(0, 3, 10); scene.state.camera.lookAt(0, 1, 0); scene.state.camera.updateMatrixWorld();
    const waitFor = async (condition: () => boolean) => {
      const deadline = performance.now() + 8000;
      while (!condition() && performance.now() < deadline) await scene!.frame();
    };
    const memory = (runtime: typeof a) => runtime.npcStore.getState().instances.get('same')?.brain?.memory?.['owner'];
    await waitFor(() => memory(a) === 'a' && memory(b) === 'b');
    metric('npc-frame-world-owner-mismatches', Number(memory(a) !== 'a') + Number(memory(b) !== 'b'));
    await a.dispose();
    const stoppedObservation = a.npcStore.getState().instances.get('same')?.lastObservation;
    const stoppedCount = requests.a; const otherCount = requests.b;
    await waitFor(() => requests.b > otherCount);
    metric('npc-frame-writes-after-dispose', Number(a.npcStore.getState().instances.get('same')?.lastObservation !== stoppedObservation) + requests.a - stoppedCount);
    metric('npc-frame-other-world-stopped', Number(requests.b <= otherCount));
    await a.setup(); await waitFor(() => requests.a > stoppedCount);
    metric('npc-frame-restart-mismatches', Number(requests.a <= stoppedCount));
    ctx.sample('npc-frame-policy-requests', requests.a + requests.b, 'count', 'variable-frame-scheduling-functional-request-count');
    await scene.frame();
  } finally { scene?.dispose(); await a.dispose(); await b.dispose(); globalThis.fetch = savedFetch; }
}

export const npcFrameScenarios: Scenario[] = [
  { id: 'npc-frame-ownership', title: 'NPC 실제 프레임·월드 소유권', description: '두 Provider의 실제 NPCInstance·Rapier·렌더링 루프에서 같은 NPC ID의 정책 응답 적용과 종료/재시작을 검사합니다. 정책 전송만 로컬에서 제어합니다.', version: 1, run: npcFrame },
];
