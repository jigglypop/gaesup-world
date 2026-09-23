import { useEffect, useMemo, useRef } from 'react';

import { useEngineFrame } from '../../../runtime/frame/react/useEngineFrame';
import { createBrowserInputDevices } from '../browserDevices';
import { createDefaultInputActions } from '../defaults';
import { InputActionMap } from '../InputActionMap';
import type { BrowserInputDevices, UseInputActionsOptions } from '../types';

export function useInputActions({ definitions, active = true, onFrame }: UseInputActionsOptions = {}): InputActionMap {
  const map = useMemo(() => new InputActionMap(definitions ?? createDefaultInputActions()), [definitions]);
  const devicesRef = useRef<BrowserInputDevices | null>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined;
    const devices = createBrowserInputDevices(window);
    devicesRef.current = devices;
    return () => {
      devicesRef.current = null;
      devices.dispose();
      map.reset();
    };
  }, [active, map]);

  useEngineFrame(
    'input',
    () => {
      const devices = devicesRef.current;
      if (!devices) return;
      devices.poll();
      map.evaluate(devices.state);
      onFrameRef.current?.(map);
    },
    { active, label: 'input:actions' },
  );

  return map;
}
