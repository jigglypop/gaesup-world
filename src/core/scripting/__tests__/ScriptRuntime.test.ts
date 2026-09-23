import { SCENE_COMPONENT_TYPES } from '../../scene-object/components';
import { createSceneDocumentController } from '../../scene-object/controller';
import { createSceneComponent, createSceneDocument } from '../../scene-object/core';
import type { SceneComponent } from '../../scene-object/types';
import { BUILTIN_SCRIPT_IDS, registerBuiltinScripts } from '../builtins';
import { scriptProp } from '../props';
import { defineScript, registerScript } from '../registry';
import { ScriptRuntime } from '../ScriptRuntime';

function scriptComponent(
  id: string,
  scriptId: string,
  props: Record<string, number | string | boolean> = {},
): SceneComponent {
  return createSceneComponent({ id, type: SCENE_COMPONENT_TYPES.script, data: { scriptId, props } });
}

function createController(components: SceneComponent[], tags: string[] = []) {
  return createSceneDocumentController(
    createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'target', name: 'Target', components, tags },
        { id: 'player', name: 'Player', tags: ['player'] },
      ],
    }),
  );
}

describe('ScriptRuntime', () => {
  test('수명주기를 awake, enable, start, update, late, destroy 순서로 호출한다', () => {
    const calls: string[] = [];
    const unregister = registerScript(
      defineScript({
        id: 'test.lifecycle',
        props: { speed: scriptProp.number({ default: 2 }) },
        create: (_ctx, props) => ({
          onAwake: () => calls.push(`awake:${props.speed}`),
          onEnable: () => calls.push('enable'),
          onStart: () => calls.push('start'),
          onUpdate: () => calls.push('update'),
          onLateUpdate: () => calls.push('late'),
          onDisable: () => calls.push('disable'),
          onDestroy: () => calls.push('destroy'),
        }),
      }),
    );
    const controller = createController([scriptComponent('script', 'test.lifecycle', { speed: 5 })]);
    const runtime = new ScriptRuntime({ controller });
    try {
      runtime.start();
      runtime.update(0.016);
      runtime.lateUpdate(0.016);
      runtime.update(0.016);
      runtime.stop();
      expect(calls).toEqual(['awake:5', 'enable', 'start', 'update', 'late', 'update', 'disable', 'destroy']);
    } finally {
      unregister();
    }
  });

  test('예외가 난 인스턴스만 중지하고 오류를 기록한다', () => {
    const healthy = jest.fn();
    const unregisterBroken = registerScript(
      defineScript({ id: 'test.broken', props: {}, create: () => ({ onUpdate: () => { throw new Error('boom'); } }) }),
    );
    const unregisterHealthy = registerScript(
      defineScript({ id: 'test.healthy', props: {}, create: () => ({ onUpdate: healthy }) }),
    );
    const controller = createController([
      scriptComponent('broken', 'test.broken'),
      scriptComponent('healthy', 'test.healthy'),
    ]);
    const runtime = new ScriptRuntime({ controller });
    try {
      runtime.start();
      runtime.update(0.016);
      runtime.update(0.016);
      expect(healthy).toHaveBeenCalledTimes(2);
      expect(runtime.getErrors()).toEqual([
        expect.objectContaining({ scriptId: 'test.broken', hook: 'onUpdate', message: 'boom' }),
      ]);
    } finally {
      runtime.stop();
      unregisterBroken();
      unregisterHealthy();
    }
  });

  test('회전체는 런타임 transform만 바꾸고 문서는 바꾸지 않는다', () => {
    const unregister = registerBuiltinScripts();
    const controller = createController([
      scriptComponent('spin', BUILTIN_SCRIPT_IDS.rotator, { degreesPerSecond: 180 }),
    ]);
    const runtime = new ScriptRuntime({ controller });
    try {
      runtime.start();
      runtime.update(1);
      expect(runtime.getObjectHandle('target')?.rotation.y).toBeCloseTo(Math.PI);
      expect(controller.getSnapshot().objects[0]?.transform.rotation[1]).toBe(0);
    } finally {
      runtime.stop();
      unregister();
    }
  });

  test('수집 아이템은 태그가 맞는 상대의 트리거에만 반응하고 문서에서 스스로 삭제한다', () => {
    const unregister = registerBuiltinScripts();
    const add = jest.fn(() => 0);
    const controller = createController([
      scriptComponent('pickup', BUILTIN_SCRIPT_IDS.collectible, { itemId: 'apple', count: 2 }),
    ]);
    const runtime = new ScriptRuntime({
      controller,
      services: { get: <T,>(key: string) => (key === 'inventory' ? ({ add } as unknown as T) : undefined) },
    });
    try {
      runtime.start();
      runtime.dispatchPhysicsEvent('triggerEnter', 'target', 'target');
      expect(add).not.toHaveBeenCalled();
      runtime.dispatchPhysicsEvent('triggerEnter', 'target', 'player');
      expect(add).toHaveBeenCalledWith('apple', 2);
      expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['player']);
      expect(runtime.getInstanceCount()).toBe(0);
    } finally {
      runtime.stop();
      unregister();
    }
  });

  test('문은 상호작용으로 열림 각도까지 회전하고 다시 닫힌다', () => {
    const unregister = registerBuiltinScripts();
    const controller = createController([
      scriptComponent('door', BUILTIN_SCRIPT_IDS.door, { openDegrees: 90, degreesPerSecond: 90 }),
    ]);
    const runtime = new ScriptRuntime({ controller });
    try {
      runtime.start();
      expect(runtime.dispatchInteract('target')).toBe(1);
      runtime.update(0.5);
      expect(runtime.getObjectHandle('target')?.rotation.y).toBeCloseTo(Math.PI / 4);
      runtime.update(1);
      expect(runtime.getObjectHandle('target')?.rotation.y).toBeCloseTo(Math.PI / 2);
      runtime.dispatchInteract('target');
      runtime.update(2);
      expect(runtime.getObjectHandle('target')?.rotation.y).toBeCloseTo(0);
    } finally {
      runtime.stop();
      unregister();
    }
  });

  test('컴포넌트 비활성화는 onDisable을 부르고 업데이트를 멈춘다', () => {
    const update = jest.fn();
    const disable = jest.fn();
    const unregister = registerScript(
      defineScript({ id: 'test.toggle', props: {}, create: () => ({ onUpdate: update, onDisable: disable }) }),
    );
    const controller = createController([scriptComponent('toggle', 'test.toggle')]);
    const runtime = new ScriptRuntime({ controller });
    try {
      runtime.start();
      runtime.update(0.016);
      controller.dispatch({ type: 'scene-object.component.update', objectId: 'target', componentId: 'toggle', enabled: false });
      runtime.update(0.016);
      expect(disable).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(1);
    } finally {
      runtime.stop();
      unregister();
    }
  });
});
