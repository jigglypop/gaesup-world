/** @jest-environment jsdom */
// jsdom: the save path checks prototypes of structuredClone results, which jest's node realm gets from the host.

/**
 * Public entry contracts, driven the way a consumer would use them. They started as the minihome in-browser API checks;
 * the example now runs only its own checks.
 */
const api = jest.requireActual<typeof import('gaesup-world')>('gaesup-world');
const { FixedStepClock, createGaesupRuntime } = jest.requireActual<typeof import('gaesup-world/runtime')>('gaesup-world/runtime');
const { NavigationSystem } = jest.requireActual<typeof import('gaesup-world/navigation')>('gaesup-world/navigation');

type SaveBlob = import('gaesup-world').SaveBlob;

const furniture = (id: string, position: [number, number, number] = [0, 0, 0]) => api.createSceneObject({
  id,
  transform: { position },
  components: [api.createSceneComponent({ id: 'appearance', type: 'miniroom.furniture', data: { kind: 'plant' } })],
});

describe('public entry contracts', () => {
  test('장면 생성·직렬화·검증', () => {
    const document = api.createSceneDocument({ id: 'api-fixture', objects: [furniture('plant')] });
    const raw = api.serializeSceneDocument(document);
    const parsed = api.parseSceneDocument(raw);
    expect(parsed.ok && parsed.document?.objects[0]?.id).toBe('plant');
    expect(api.validateSerializedSceneDocument(raw).valid).toBe(true);
    expect(api.validateSerializedSceneDocument('{broken').valid).toBe(false);
    const clone = api.cloneSceneDocument(document);
    clone.objects[0]!.name = 'changed';
    expect(document.objects[0]!.name).not.toBe('changed');
  });

  test('명령·revision·구독 해제', () => {
    const controller = api.createSceneDocumentController(api.createSceneDocument({ id: 'api-fixture' }));
    let notifications = 0;
    const off = controller.subscribe(() => { notifications++; });
    expect(controller.dispatch({ type: 'scene-object.create', object: furniture('one') }).accepted).toBe(true);
    expect(controller.dispatch({ type: 'scene-object.update', objectId: 'one', patch: { transform: { position: [1, 0, 2] } } }, { expectedRevision: 1 }).accepted).toBe(true);
    expect(controller.dispatch({ type: 'scene-object.delete', objectId: 'one' }, { expectedRevision: 0 }).accepted).toBe(false);
    const invalid = { type: 'scene-object.update', objectId: 'one', patch: { transform: { position: [NaN, 0, 0] } } } as const;
    expect(api.applySceneDocumentCommand(controller.getSnapshot(), invalid).accepted).toBe(false);
    expect([controller.getRevision(), notifications]).toEqual([2, 2]);
    off();
    expect(controller.dispatch({ type: 'scene-object.delete', objectId: 'one' }).accepted).toBe(true);
    expect(notifications).toBe(2);
    expect(controller.getSnapshot().objects).toHaveLength(0);
  });

  test('계층·월드 좌표·컴포넌트 명령', () => {
    const parent = api.createSceneObject({ id: 'parent', transform: { position: [2, 0, 0], scale: [2, 2, 2] } });
    const child = api.createSceneObject({ id: 'child', parentId: 'parent', transform: { position: [1, 0, 0] } });
    const controller = api.createSceneDocumentController(api.createSceneDocument({ id: 'api-fixture', objects: [parent, child] }));
    const component = api.createSceneComponent({ id: 'test', type: 'test' });
    expect(controller.dispatch({ type: 'scene-object.component.add', objectId: 'child', component }).accepted).toBe(true);
    expect(controller.dispatch({ type: 'scene-object.component.remove', objectId: 'child', componentId: 'test' }).accepted).toBe(true);
    const { runtime } = api.loadSceneRuntime(controller.getSnapshot());
    expect(runtime?.getWorldTransform('child')?.position[0]).toBe(4);
    expect(runtime?.getChildren('parent')).toHaveLength(1);
    expect(runtime?.getWorldMatrix('child')?.[12]).toBe(4);
    expect(api.sceneMatrixToTransform(api.sceneTransformToMatrix(child.transform)).position[0]).toBe(1);
    expect(api.sceneQuaternionToEuler(api.sceneEulerToQuaternion([0, 0.7, 0]))[1]).toBeCloseTo(0.7, 6);
    expect(controller.dispatch({ type: 'scene-object.move', objectId: 'child', parentId: null }).accepted).toBe(true);
  });

  test('태그·레이어·쿼리', () => {
    const object = furniture('plant');
    object.tags = ['decor'];
    object.layer = 'furniture';
    const document = api.createSceneDocument({ id: 'api-fixture', objects: [object] });
    const { runtime } = api.loadSceneRuntime(document);
    if (!runtime) throw new Error('쿼리 장면 로드 실패');
    const registry = api.createSceneLayerTagRegistry({ layers: [{ id: 'furniture', selectable: false }], tags: [{ id: 'decor' }] });
    expect(api.validateSceneObjectLayersAndTags(document, registry).valid).toBe(true);
    expect(api.findSceneObjects(runtime, { tag: 'decor', layer: 'furniture' })).toHaveLength(1);
    expect(api.findSceneObject(runtime, { id: 'plant' })?.id).toBe('plant');
    expect(api.findSceneObjectsByTag(runtime, 'decor')).toHaveLength(1);
    expect(api.findSceneObjectsWithComponent(runtime, 'miniroom.furniture')).toHaveLength(1);
    expect(api.isSceneLayerVisible(registry, 'furniture')).toBe(true);
    expect(api.isSceneLayerSelectable(registry, 'furniture')).toBe(false);
  });

  test('저장 binding·snapshot 복원', async () => {
    const values = new Map<string, SaveBlob>();
    const save = new api.SaveSystem({ adapter: {
      read: async (slot) => values.get(slot) ?? null,
      write: async (slot, value) => { values.set(slot, value); },
      list: async () => [...values.keys()],
      remove: async (slot) => { values.delete(slot); },
    } });
    const initial = api.createSceneDocument({ id: 'api-fixture', objects: [furniture('sofa-1', [1, 0, 0]), furniture('table-1', [0, 0, 1])] });
    const controller = api.createSceneDocumentController(initial);
    const off = save.register(api.createSceneDocumentSaveBinding(controller));
    try {
      const snapshot = save.createBlob();
      await save.save('fixture');
      controller.dispatch({ type: 'scene-object.delete', objectId: 'sofa-1' });
      expect(await save.load('fixture')).toBe(true);
      expect(controller.getSnapshot()).toEqual(initial);
      controller.dispatch({ type: 'scene-object.delete', objectId: 'table-1' });
      expect(save.hydrateBlob(snapshot)).toBe(true);
      expect(controller.getSnapshot()).toEqual(initial);
    } finally {
      off();
    }
  });

  test('Unity 장면 왕복', () => {
    const document = api.createSceneDocument({ id: 'api-fixture', objects: [furniture('a', [1.5, 0, -2]), furniture('b', [-3, 0.5, 4])] });
    const restored = api.importUnityScene(api.exportUnityScene(document));
    expect(restored.objects).toHaveLength(document.objects.length);
    document.objects.forEach((object, index) => object.transform.position.forEach((value, axis) => {
      expect(restored.objects[index]!.transform.position[axis]).toBeCloseTo(value, 6);
    }));
  });

  test('두 월드·플러그인·도메인 격리', async () => {
    const a = createGaesupRuntime({ plugins: [api.createInventoryPlugin(), api.createEconomyPlugin()] });
    const b = createGaesupRuntime({ plugins: [api.createInventoryPlugin(), api.createEconomyPlugin()] });
    try {
      await a.setup();
      await b.setup();
      a.inventoryStore.getState().add('fixture', 2);
      a.walletStore.getState().add(5);
      expect(a.inventoryStore.getState().countOf('fixture')).toBe(2);
      expect(b.inventoryStore.getState().countOf('fixture')).toBe(0);
      expect(a.walletStore.getState().bells).toBe(b.walletStore.getState().bells + 5);
      expect(a.requireService('gaesup.runtime.save-system')).toBe(a.save);
      await a.dispose();
      expect([a.isActive(), b.isActive()]).toEqual([false, true]);
      await a.setup();
      expect(a.isActive()).toBe(true);
    } finally {
      await a.dispose();
      await b.dispose();
    }
  });

  test.each([30, 60, 144])('고정 tick·해제 (%iHz)', (hz) => {
    const clock = new FixedStepClock();
    let updates = 0;
    const off = clock.addSystem({ id: 'fixture', phase: 'simulation', update: () => { updates++; } });
    for (let frame = 0; frame < hz; frame++) clock.advance(1 / hz);
    expect(updates).toBe(60);
    off();
    clock.advance(1 / 60);
    expect([updates, clock.systemCount]).toEqual([60, 0]);
  });

  test('가구 회피·경로 탐색', async () => {
    const navigation = new NavigationSystem({ cellSize: 0.25, worldMinX: -4, worldMaxX: 4, worldMinZ: -4, worldMaxZ: 4 });
    try {
      await navigation.init();
      navigation.setBlocked(0, 0, 1, 2);
      const path = navigation.findPath(-2, 0, 2, 0, { y: 0, agentRadius: 0.18 });
      const smooth = navigation.smoothPath(path, [-2, 0, 0], [2, 0, 0], { agentRadius: 0.18 });
      expect(navigation.isWalkable(0, 0)).toBe(false);
      expect(smooth.length).toBeGreaterThan(2);
      for (let i = 1; i < smooth.length; i++) {
        expect(navigation.canTraverseSegment(smooth[i - 1]![0], smooth[i - 1]![2], smooth[i]![0], smooth[i]![2], { agentRadius: 0.18 })).toBe(true);
      }
    } finally {
      navigation.dispose();
    }
  });
});
