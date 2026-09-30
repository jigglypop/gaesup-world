import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { useEngineFrame } from '../../runtime/frame/react/useEngineFrame';
import { ScriptRuntime } from '../ScriptRuntime';
import type { ScriptPlayMode, ScriptPlayModeSource, UseScriptRuntimeOptions } from './types';

const ALWAYS_PLAY: ScriptPlayModeSource = {
  getState: () => ({ mode: 'play' }),
  subscribe: () => () => undefined,
};

function usePlayMode(source: ScriptPlayModeSource): ScriptPlayMode {
  return useSyncExternalStore(source.subscribe, () => source.getState().mode, () => source.getState().mode);
}

export function useScriptRuntime({
  controller,
  services,
  active = true,
  playMode = ALWAYS_PLAY,
  scheduler,
}: UseScriptRuntimeOptions): ScriptRuntime {
  const runtime = useMemo(
    () => new ScriptRuntime({ controller, ...(services ? { services } : {}) }),
    [controller, services],
  );

  const mode = usePlayMode(playMode);
  const alive = active && mode !== 'edit';
  const running = alive && mode === 'play';

  useEffect(() => {
    if (!alive) return undefined;
    runtime.start();
    return () => runtime.stop();
  }, [alive, runtime]);

  const frameOptions = { active: running, ...(scheduler ? { scheduler } : {}) };
  useEngineFrame('script', (delta) => runtime.update(delta), { ...frameOptions, label: 'scripts:update' });
  useEngineFrame('prePhysics', (delta) => runtime.fixedUpdate(delta), { ...frameOptions, label: 'scripts:fixed' });
  useEngineFrame('lateUpdate', (delta) => runtime.lateUpdate(delta), { ...frameOptions, label: 'scripts:late' });

  return runtime;
}
