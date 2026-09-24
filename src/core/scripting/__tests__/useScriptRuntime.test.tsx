import { act, renderHook } from '@testing-library/react';

import { frameScheduler } from '../../runtime/frame';
import { SCENE_COMPONENT_TYPES } from '../../scene-object/components';
import { createSceneDocumentController } from '../../scene-object/controller';
import { createSceneComponent, createSceneDocument } from '../../scene-object/core';
import type { ScriptPlayMode, ScriptPlayModeSource } from '../react/types';
import { useScriptRuntime } from '../react/useScriptRuntime';
import { defineScript, registerScript } from '../registry';

function createPlayModeSource(initial: ScriptPlayMode): ScriptPlayModeSource & { set: (mode: ScriptPlayMode) => void } {
  let mode = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => ({ mode }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (next) => {
      mode = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe('useScriptRuntime play mode', () => {
  afterEach(() => {
    frameScheduler.clear();
  });

  test('edit에서는 인스턴스가 없고 play에서만 갱신하며 paused는 인스턴스를 유지한다', () => {
    const calls: string[] = [];
    const unregister = registerScript(
      defineScript({
        id: 'test.play-mode',
        props: {},
        create: () => ({
          onStart: () => calls.push('start'),
          onUpdate: () => calls.push('update'),
          onDestroy: () => calls.push('destroy'),
        }),
      }),
    );
    const controller = createSceneDocumentController(
      createSceneDocument({
        id: 'scene',
        objects: [{
          id: 'target',
          name: 'Target',
          components: [createSceneComponent({
            id: 'script',
            type: SCENE_COMPONENT_TYPES.script,
            data: { scriptId: 'test.play-mode', props: {} },
          })],
        }],
      }),
    );
    const playMode = createPlayModeSource('edit');
    const tick = () => frameScheduler.tick(1 / 60, 0);
    try {
      const view = renderHook(() => useScriptRuntime({ controller, playMode }));
      tick();
      expect(view.result.current.getInstanceCount()).toBe(0);
      expect(calls).toEqual([]);

      act(() => playMode.set('play'));
      tick();
      expect(calls).toEqual(['start', 'update']);

      act(() => playMode.set('paused'));
      tick();
      expect(view.result.current.getInstanceCount()).toBe(1);
      expect(calls).toEqual(['start', 'update']);

      act(() => playMode.set('edit'));
      expect(calls).toEqual(['start', 'update', 'destroy']);
      expect(view.result.current.getInstanceCount()).toBe(0);
      view.unmount();
    } finally {
      unregister();
    }
  });
});
