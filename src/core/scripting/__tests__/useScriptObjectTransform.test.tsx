import { useRef } from 'react';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { FrameSchedulerHost } from '../../runtime/frame';
import { SCENE_COMPONENT_TYPES } from '../../scene-object/components';
import { createSceneDocumentController } from '../../scene-object/controller';
import { createSceneComponent, createSceneDocument } from '../../scene-object/core';
import type { SceneTransform } from '../../scene-object/types';
import { BUILTIN_SCRIPT_IDS, registerBuiltinScripts } from '../builtins';
import type { ScriptPlayMode, ScriptPlayModeSource } from '../react/types';
import { useScriptObjectTransform } from '../react/useScriptObjectTransform';
import { useScriptRuntime } from '../react/useScriptRuntime';

const SOURCE: SceneTransform = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };

function createPlayMode(initial: ScriptPlayMode): ScriptPlayModeSource & { set: (mode: ScriptPlayMode) => void } {
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

function Rotating({ playMode, meshRef }: { playMode: ScriptPlayModeSource; meshRef: { current: THREE.Mesh | null } }) {
  const controller = useRef(
    createSceneDocumentController(
      createSceneDocument({
        id: 'scene',
        objects: [{
          id: 'spinner',
          name: 'Spinner',
          components: [createSceneComponent({
            id: 'rotator',
            type: SCENE_COMPONENT_TYPES.script,
            data: { scriptId: BUILTIN_SCRIPT_IDS.rotator, props: { degreesPerSecond: 90 } },
          })],
        }],
      }),
    ),
  ).current;
  const runtime = useScriptRuntime({ controller, playMode });
  useScriptObjectTransform(runtime, 'spinner', meshRef, SOURCE);
  return <mesh ref={(mesh) => { meshRef.current = mesh; }} />;
}

test('실행 중에는 스크립트 회전을 반영하고 edit로 돌아오면 문서 transform으로 복원한다', async () => {
  const unregister = registerBuiltinScripts();
  const playMode = createPlayMode('play');
  const meshRef: { current: THREE.Mesh | null } = { current: null };
  try {
    const renderer = await ReactThreeTestRenderer.create(
      <>
        <FrameSchedulerHost />
        <Rotating playMode={playMode} meshRef={meshRef} />
      </>,
    );
    await renderer.advanceFrames(10, 0.1);
    expect(meshRef.current?.rotation.y).toBeGreaterThan(0.5);

    await ReactThreeTestRenderer.act(async () => playMode.set('edit'));
    await renderer.advanceFrames(1, 0.1);
    expect(meshRef.current?.rotation.y).toBe(0);
    await renderer.unmount();
  } finally {
    unregister();
  }
});
