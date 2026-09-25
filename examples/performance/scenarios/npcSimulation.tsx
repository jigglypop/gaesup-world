import { useEffect } from 'react';

import { useRapier, type RapierContext, type RapierRigidBody } from '@react-three/rapier';

import { createGaesupRuntime, createNPCPlugin, createNPCObservation, GaesupRuntimeProvider, NPCPerceptionIndex, NPCSystem, serializeNPCState, WorldPhysics, type NPCInstanceData } from 'gaesup-world';

import { mountScene } from './scene';
import { checkAbort, type Scenario, type ScenarioContext } from './types';

const npc = (id: string, position: [number, number, number]): NPCInstanceData => ({ id, templateId: 'lab', name: id, position, rotation: [0, 0, 0], scale: [1, 1, 1], brain: { mode: 'none' } });

async function distance(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime({ plugins: [createNPCPlugin()] });
  let scene: Awaited<ReturnType<typeof mountScene>> | undefined;
  let api: RapierContext | undefined;
  function Ready() { const value = useRapier(); useEffect(() => { api = value; }, [value]); return null; }
  const body = () => {
    let result: RapierRigidBody | undefined;
    api?.world.forEachRigidBody(value => { if ((value.userData as { instanceId?: string } | undefined)?.instanceId === 'traveller') result = value; });
    return result;
  };
  try {
    await runtime.setup(); runtime.clockLoop.suspend();
    const store = runtime.npcStore.getState();
    store.addTemplate({ id: 'lab', name: 'Lab NPC', category: 'humanoid', baseParts: [{ id: 'body', type: 'body', url: '', position: [0, 1, 0], scale: [2, 4, 2], color: '#50cdd4' }], clothingParts: [] });
    store.addInstance(npc('traveller', [180, 0, 0])); store.setNavigation('traveller', [[0, 0, 0]], 60);
    scene = await mountScene(ctx, [], false, <GaesupRuntimeProvider runtime={runtime}><WorldPhysics gravity={[0, 0, 0]}><Ready /><NPCSystem /></WorldPhysics></GaesupRuntimeProvider>);
    for (let i = 0; i < 120 && !api; i++) await scene.frame();
    if (!api) throw new Error('NPC world did not initialize');
    scene.state.setFrameloop('never'); scene.state.camera.position.set(0, 4, 10); scene.state.camera.lookAt(0, 1, 0);
    let timestamp = 0;
    const frames = async (count: number) => {
      for (let i = 0; i < count; i++) {
        checkAbort(ctx.signal); runtime.clockLoop.clock.stepTicks(); timestamp += 1 / 60;
        scene!.state.advance(timestamp, false);
        if (i % 5 === 0 || i === count - 1) await new Promise(resolve => setTimeout(resolve, 0));
      }
    };
    await frames(30);
    ctx.assert('offscreen-body-unmounted', true, !body());
    ctx.assert('offscreen-navigation-progress', 150, runtime.npcSimulation.getPose('traveller')!.position[0]);
    await frames(155);
    ctx.assert('actual-position-enters-lod', true, Boolean(body()));
    ctx.assert('offscreen-route-arrived', 'arrived', runtime.npcStore.getState().instances.get('traveller')!.navigation!.state);
    const first = body();
    ctx.sample('npc-remount-position-error', first ? Math.abs(first.translation().x - runtime.npcSimulation.getPose('traveller')!.position[0]) : 1000, 'world', 'actual-rapier-body-versus-authoritative-pose');
    ctx.assert('first-mount-position', true, Boolean(first && Math.abs(first.translation().x) < 0.00001));
    scene.state.camera.position.set(500, 4, 10); scene.state.camera.lookAt(500, 1, 0);
    store.setNavigation('traveller', [[30, 0, 0]], 10); await frames(65);
    ctx.assert('lod-removes-presentation', true, !body());
    const saved = serializeNPCState(runtime.npcStore);
    const live = runtime.npcSimulation.getPose('traveller')!.position[0];
    ctx.assert('save-mid-route-live-position', true, Math.abs(saved.instances[0]!.position[0] - live) < 0.00001 && live > 10);
    scene.state.camera.position.set(live, 4, 10); scene.state.camera.lookAt(live, 1, 0); await frames(35);
    const returned = body(); const error = returned ? Math.abs(returned.translation().x - runtime.npcSimulation.getPose('traveller')!.position[0]) : 1000;
    ctx.sample('npc-remount-position-error', error, 'world', 'actual-rapier-body-versus-authoritative-pose');
    ctx.assert('remount-has-no-position-jump', true, error < 0.00001);
    await runtime.dispose(); const stopped = runtime.npcSimulation.getPose('traveller')!.position[0];
    await frames(30); ctx.assert('npc-stops-after-world-dispose', stopped, runtime.npcSimulation.getPose('traveller')!.position[0]);
    scene.dispose(); scene = undefined;
  } finally { scene?.dispose(); await runtime.dispose(); }
}

async function perception(ctx: ScenarioContext) {
  const instances = new Map<string, NPCInstanceData>();
  for (let i = 0; i < ctx.config.count; i++) {
    const instance = { ...npc(String(i), [(i % 50) * 5, (i % 3) * 2, Math.floor(i / 50) * 5]), perception: { enabled: true, sightRadius: 20, hearingRadius: 10 } };
    instances.set(instance.id, instance);
  }
  const index = new NPCPerceptionIndex(); index.refresh(instances);
  let mismatches = 0;
  for (const instance of instances.values()) if (JSON.stringify(index.observe(instance, 1)) !== JSON.stringify(createNPCObservation(instance, instances, 1))) mismatches++;
  ctx.assert('npc-perception-linear-equivalence', 0, mismatches);
  const started = performance.now(); let iteration = 0;
  do {
    checkAbort(ctx.signal);
    iteration++;
    const before = performance.now();
    const indexed = ctx.role !== 'baseline';
    if (indexed) index.refresh(instances);
    for (const instance of instances.values()) {
      if (indexed) index.observe(instance, iteration); else createNPCObservation(instance, instances, iteration);
    }
    const duration = performance.now() - before;
    if (performance.now() - started >= ctx.config.warmupMs) {
      ctx.sample('npc-perception-batch', duration, 'ms', 'all-npc-observations-one-decision-batch-including-index-maintenance');
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  } while (performance.now() - started < ctx.config.warmupMs + ctx.config.durationMs);
}

export const npcSimulationScenarios: Scenario[] = [
  { id: 'npc-distance', title: 'NPC 화면 밖 시뮬레이션·LOD', version: 1, description: '실제 NPCSystem·Rapier에서 화면 밖 이동, 현재 위치 기반 LOD, 재등장 위치, 이동 중 저장과 월드 종료를 검사합니다.', run: distance },
  { id: 'npc-perception', title: 'NPC 시야 계산 비용', version: 2, timed: true, description: 'baseline은 기존 선형 계산, candidate는 공간 인덱스를 실행합니다. 동일 결과를 검사하고 인덱스 유지 비용을 포함한 전체 판단 배치 CPU p95를 측정합니다. GPU·FPS 측정이 아닙니다.', run: perception },
];
