import { createMinihome, makeFurniture, parseMinihome } from './model';
import { createMinihomeSession } from './session';
import { createShareLink, readShareLink } from './sharing';

export type ApiCheck = { id: string; title: string; apis: string[]; scope: 'library' | 'example'; status: 'passed' | 'failed'; durationMs: number; detail: string };
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

/** Invokes real public entry points against isolated fixtures; never edits the open home. */
export async function runMinihomeApiChecks(signal?: AbortSignal): Promise<ApiCheck[]> {
  const api = await import('gaesup-world');
  const { FixedStepClock, createGaesupRuntime } = await import('gaesup-world/runtime');
  const results: ApiCheck[] = [];
  async function check(id: string, title: string, apis: string[], run: () => void | Promise<void>, scope: ApiCheck['scope'] = 'library') {
    if (signal?.aborted) throw new DOMException('검사 중지', 'AbortError');
    const start = performance.now();
    try { await run(); results.push({ id, title, apis, scope, status: 'passed', durationMs: performance.now() - start, detail: '기대 상태 일치' }); }
    catch (error) { results.push({ id, title, apis, scope, status: 'failed', durationMs: performance.now() - start, detail: error instanceof Error ? error.message : String(error) }); }
  }
  await check('scene-document', '장면 생성·직렬화·검증', ['createSceneObject', 'createSceneComponent', 'createSceneDocument', 'serializeSceneDocument', 'parseSceneDocument', 'cloneSceneDocument', 'validateSerializedSceneDocument'], () => {
    const component = api.createSceneComponent({ id: 'appearance', type: 'miniroom.furniture', data: { kind: 'plant' } });
    const object = api.createSceneObject({ id: 'plant', components: [component] }); const document = api.createSceneDocument({ id: 'api-fixture', objects: [object] });
    const raw = api.serializeSceneDocument(document); const parsed = api.parseSceneDocument(raw);
    assert(parsed.ok && parsed.document?.objects[0]?.id === 'plant', '장면 round-trip 불일치');
    assert(api.validateSerializedSceneDocument(raw).valid, '정상 문서 검증 실패');
    assert(!api.validateSerializedSceneDocument('{broken').valid, '잘못된 문서 허용');
    const clone = api.cloneSceneDocument(document); clone.objects[0]!.name = 'changed'; assert(document.objects[0]!.name !== 'changed', '복제 소유권 누출');
  });
  await check('scene-commands', '명령·revision·구독 해제', ['createSceneDocumentController', 'SceneDocumentController.dispatch', 'SceneDocumentController.subscribe', 'SceneDocumentController.getRevision', 'applySceneDocumentCommand'], () => {
    const controller = api.createSceneDocumentController(api.createSceneDocument({ id: 'api-fixture' })); let notifications = 0;
    const off = controller.subscribe(() => { notifications++; });
    assert(controller.dispatch({ type: 'scene-object.create', object: makeFurniture('plant', 0, 0, 'one') }).accepted, '생성 실패');
    assert(controller.dispatch({ type: 'scene-object.update', objectId: 'one', patch: { transform: { position: [1, 0, 2] } } }, { expectedRevision: 1 }).accepted, '수정 실패');
    assert(!controller.dispatch({ type: 'scene-object.delete', objectId: 'one' }, { expectedRevision: 0 }).accepted, '오래된 revision 허용');
    const before = controller.getSnapshot();
    assert(!api.applySceneDocumentCommand(before, { type: 'scene-object.update', objectId: 'one', patch: { transform: { position: [NaN, 0, 0] } } }).accepted, '잘못된 transform 허용');
    assert(controller.getRevision() === 2 && notifications === 2, '명령/알림 중복'); off();
    assert(controller.dispatch({ type: 'scene-object.delete', objectId: 'one' }).accepted, '삭제 실패'); assert(notifications === 2 && !controller.getSnapshot().objects.length, '구독 해제 실패');
  });
  await check('scene-hierarchy', '계층·월드 좌표·컴포넌트 명령', ['loadSceneRuntime', 'SceneRuntime.getWorldMatrix', 'SceneRuntime.getWorldTransform', 'SceneRuntime.getChildren', 'sceneTransformToMatrix', 'sceneMatrixToTransform', 'sceneEulerToQuaternion', 'sceneQuaternionToEuler'], () => {
    const parent = api.createSceneObject({ id: 'parent', transform: { position: [2, 0, 0], scale: [2, 2, 2] } });
    const child = api.createSceneObject({ id: 'child', parentId: 'parent', transform: { position: [1, 0, 0] } });
    const controller = api.createSceneDocumentController(api.createSceneDocument({ id: 'api-fixture', objects: [parent, child] }));
    assert(controller.dispatch({ type: 'scene-object.component.add', objectId: 'child', component: api.createSceneComponent({ id: 'test', type: 'test' }) }).accepted, '컴포넌트 추가 실패');
    assert(controller.dispatch({ type: 'scene-object.component.remove', objectId: 'child', componentId: 'test' }).accepted, '컴포넌트 제거 실패');
    const loaded = api.loadSceneRuntime(controller.getSnapshot()); assert(loaded.runtime, '계층 로드 실패');
    assert(loaded.runtime.getWorldTransform('child')?.position[0] === 4 && loaded.runtime.getChildren('parent').length === 1, '부모 transform 누락');
    assert(loaded.runtime.getWorldMatrix('child')?.[12] === 4, '월드 행렬 불일치');
    const restored = api.sceneMatrixToTransform(api.sceneTransformToMatrix(child.transform)); assert(restored.position[0] === 1, '행렬 변환 불일치');
    const rotation = api.sceneQuaternionToEuler(api.sceneEulerToQuaternion([0, 0.7, 0])); assert(Math.abs(rotation[1] - 0.7) < 1e-6, '회전 변환 불일치');
    assert(controller.dispatch({ type: 'scene-object.move', objectId: 'child', parentId: null }).accepted, '부모 해제 실패');
  });
  await check('scene-query', '태그·레이어·쿼리', ['findSceneObjects', 'findSceneObject', 'findSceneObjectsByTag', 'findSceneObjectsWithComponent', 'createSceneLayerTagRegistry', 'validateSceneObjectLayersAndTags', 'isSceneLayerVisible', 'isSceneLayerSelectable'], () => {
    const object = makeFurniture('plant', 0, 0, 'plant'); object.tags = ['decor']; object.layer = 'furniture';
    const document = api.createSceneDocument({ id: 'api-fixture', objects: [object] }); const loaded = api.loadSceneRuntime(document); assert(loaded.runtime, '쿼리 장면 로드 실패');
    const registry = api.createSceneLayerTagRegistry({ layers: [{ id: 'furniture', selectable: false }], tags: [{ id: 'decor' }] });
    assert(api.validateSceneObjectLayersAndTags(document, registry).valid, '레이어/태그 검증 실패');
    assert(api.findSceneObjects(loaded.runtime, { tag: 'decor', layer: 'furniture' }).length === 1, '복합 쿼리 실패');
    assert(api.findSceneObject(loaded.runtime, { id: 'plant' })?.id === 'plant', 'ID 조회 실패');
    assert(api.findSceneObjectsByTag(loaded.runtime, 'decor').length === 1 && api.findSceneObjectsWithComponent(loaded.runtime, 'miniroom.furniture').length === 1, '컴포넌트 쿼리 실패');
    assert(api.isSceneLayerVisible(registry, 'furniture') && !api.isSceneLayerSelectable(registry, 'furniture'), '레이어 계약 불일치');
  });
  await check('scene-save', '저장 binding·snapshot 복원', ['SaveSystem', 'createSceneDocumentSaveBinding', 'SaveSystem.register', 'SaveSystem.createBlob', 'SaveSystem.hydrateBlob', 'SaveSystem.save', 'SaveSystem.load'], async () => {
    const values = new Map<string, import('gaesup-world').SaveBlob>();
    const save = new api.SaveSystem({ adapter: { read: async slot => values.get(slot) ?? null, write: async (slot, value) => { values.set(slot, value); }, list: async () => [...values.keys()], remove: async slot => { values.delete(slot); } } });
    const controller = api.createSceneDocumentController(createMinihome().room); const off = save.register(api.createSceneDocumentSaveBinding(controller));
    try {
      const snapshot = save.createBlob(); await save.save('fixture'); controller.dispatch({ type: 'scene-object.delete', objectId: 'sofa-1' });
      assert(await save.load('fixture'), '저장 읽기 실패'); assert(controller.getSnapshot().objects.length === 6, '저장 복원 불일치');
      controller.dispatch({ type: 'scene-object.delete', objectId: 'table-1' }); assert(save.hydrateBlob(snapshot), 'snapshot 적용 실패'); assert(controller.getSnapshot().objects.length === 6, 'snapshot 복원 불일치');
    } finally { off(); }
  });
  await check('unity-exchange', 'Unity 장면 왕복', ['exportUnityScene', 'importUnityScene'], () => {
    const document = createMinihome().room; const restored = api.importUnityScene(api.exportUnityScene(document));
    assert(restored.objects.length === document.objects.length, 'Unity 객체 수 불일치');
    for (let i = 0; i < document.objects.length; i++) assert(restored.objects[i]?.transform.position.every((value, axis) => Math.abs(value - document.objects[i]!.transform.position[axis]!) < 1e-6), 'Unity 좌표 반전 불일치');
  });
  await check('world-lifecycle', '두 월드·플러그인·도메인 격리', ['createGaesupRuntime', 'createInventoryPlugin', 'createEconomyPlugin', 'GaesupRuntime.setup', 'GaesupRuntime.dispose', 'GaesupRuntime.requireService', 'inventoryStore.add', 'walletStore.add'], async () => {
    const a = createGaesupRuntime({ plugins: [api.createInventoryPlugin(), api.createEconomyPlugin()] });
    const b = createGaesupRuntime({ plugins: [api.createInventoryPlugin(), api.createEconomyPlugin()] });
    try {
      await a.setup(); await b.setup(); a.inventoryStore.getState().add('miniroom-fixture', 2); a.walletStore.getState().add(5);
      assert(a.inventoryStore.getState().countOf('miniroom-fixture') === 2 && b.inventoryStore.getState().countOf('miniroom-fixture') === 0, '가방 월드 오염');
      assert(a.walletStore.getState().bells === b.walletStore.getState().bells + 5, '지갑 월드 오염');
      assert(a.requireService('gaesup.runtime.save-system') === a.save, '서비스 소유권 불일치');
      await a.dispose(); assert(!a.isActive() && b.isActive(), '독립 종료 실패'); await a.setup(); assert(a.isActive(), '재시작 실패');
    } finally { await a.dispose(); await b.dispose(); }
  });
  await check('fixed-clock', '고정 tick·해제', ['FixedStepClock', 'FixedStepClock.addSystem', 'FixedStepClock.advance'], () => {
    for (const hz of [30, 60, 144]) {
      const clock = new FixedStepClock(); let updates = 0; const off = clock.addSystem({ id: 'fixture', phase: 'simulation', update: () => { updates++; } });
      for (let frame = 0; frame < hz; frame++) clock.advance(1 / hz);
      assert(updates === 60, `${hz}Hz tick 불일치`); off(); clock.advance(1 / 60); assert(updates === 60 && clock.systemCount === 0, 'clock 해제 실패');
    }
  });
  await check('navigation', '가구 회피·경로 탐색', ['NavigationSystem', 'NavigationSystem.init', 'NavigationSystem.setBlocked', 'NavigationSystem.findPath', 'NavigationSystem.smoothPath', 'NavigationSystem.canTraverseSegment', 'NavigationSystem.isWalkable', 'NavigationSystem.dispose'], async () => {
    const { NavigationSystem } = await import('gaesup-world/navigation');
    const navigation = new NavigationSystem({ cellSize: 0.25, worldMinX: -4, worldMaxX: 4, worldMinZ: -4, worldMaxZ: 4 });
    try {
      await navigation.init(); navigation.setBlocked(0, 0, 1, 2);
      const path = navigation.findPath(-2, 0, 2, 0, { y: 0, agentRadius: 0.18 });
      const smooth = navigation.smoothPath(path, [-2, 0, 0], [2, 0, 0], { agentRadius: 0.18 });
      assert(!navigation.isWalkable(0, 0) && smooth.length > 2, '장애물 회피 경로 실패');
      for (let i = 1; i < smooth.length; i++) assert(navigation.canTraverseSegment(smooth[i - 1]![0], smooth[i - 1]![2], smooth[i]![0], smooth[i]![2], { agentRadius: 0.18 }), '장애물 통과 경로');
    } finally { navigation.dispose(); }
  });
  await check('home-history', '미니홈피 변경·undo/redo', ['createMinihomeSession', 'MinihomeSession.update', 'MinihomeSession.undo', 'MinihomeSession.redo', 'parseMinihome'], () => {
    const session = createMinihomeSession(createMinihome());
    try {
      session.update(data => ({ ...data, theme: 'sage' })); session.controller.dispatch({ type: 'scene-object.create', object: makeFurniture('lamp', 0, 0, 'added') });
      session.undo(); assert(session.getSnapshot().data.room.objects.length === 6, '객체 undo 실패'); session.undo(); assert(session.getSnapshot().data.theme === 'peach', '테마 undo 실패');
      session.redo(); session.redo(); assert(session.getSnapshot().data.room.objects.length === 7 && !!parseMinihome(JSON.stringify(session.getSnapshot().data)), 'redo 문서 불일치');
    } finally { session.dispose(); }
  }, 'example');
  await check('home-sharing', '공유 링크·개인 기록 분리', ['createShareLink', 'readShareLink'], () => {
    const home = createMinihome(); home.diary = [{ id: 'private', author: 'me', text: 'private', date: new Date(0).toISOString() }];
    const link = createShareLink(home, 'https://example.test/'); const shared = readShareLink(new URL(link).hash);
    assert(shared?.room.objects.length === 6 && shared.diary.length === 0 && home.diary.length === 1, '공유 또는 개인 기록 계약 불일치');
  }, 'example');
  return results;
}
