import { useEffect, useMemo } from 'react';

import { useEngineFrame } from '../../runtime/frame/react/useEngineFrame';
import { ScriptRuntime } from '../ScriptRuntime';
import type { UseScriptRuntimeOptions } from './types';

export function useScriptRuntime({ controller, services, active = true, scheduler }: UseScriptRuntimeOptions): ScriptRuntime {
  const runtime = useMemo(
    () => new ScriptRuntime({ controller, ...(services ? { services } : {}) }),
    [controller, services],
  );

  useEffect(() => {
    if (!active) return undefined;
    runtime.start();
    return () => runtime.stop();
  }, [active, runtime]);

  const frameOptions = { active, ...(scheduler ? { scheduler } : {}) };
  useEngineFrame('script', (delta) => runtime.update(delta), { ...frameOptions, label: 'scripts:update' });
  useEngineFrame('prePhysics', (delta) => runtime.fixedUpdate(delta), { ...frameOptions, label: 'scripts:fixed' });
  useEngineFrame('lateUpdate', (delta) => runtime.lateUpdate(delta), { ...frameOptions, label: 'scripts:late' });

  return runtime;
}
