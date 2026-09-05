import { useRef, useEffect, useCallback } from 'react';

import { useFrame } from '@react-three/fiber';

import { BaseCameraSystem } from './BaseCameraSystem';
import type { CameraSystemConfig, CameraSystemEvents, CameraSystemState, CameraSystemEmitter, ICameraSystemMonitor } from './types';

export function useCameraBridge<T extends BaseCameraSystem>(
  SystemClass: new (config: CameraSystemConfig) => T,
  initialConfig: CameraSystemConfig,
  eventHandlers?: Partial<{
    [K in keyof CameraSystemEvents]: (data: CameraSystemEvents[K]) => void;
  }>
): {
  system: T;
  updateConfig: (config: Partial<CameraSystemConfig>) => void;
  getState: () => CameraSystemState;
  getMetrics: () => ReturnType<ICameraSystemMonitor['getMetrics']>;
} {
  const systemRef = useRef<T>(null);
  if (!systemRef.current) {
    systemRef.current = new SystemClass(initialConfig);
  }
  const system = systemRef.current;
  useFrame((_, delta) => {
    system?.update(delta);
  });

  useEffect(() => {
    if (!eventHandlers || !system) return;
    const unsubscribers: Array<() => void> = [];
    const emitter: CameraSystemEmitter = system.emitter;
    const subscribe = <K extends keyof CameraSystemEvents>(eventName: K) => {
      const handler = eventHandlers[eventName];
      if (!handler) return;
      emitter.on(eventName, handler);
      unsubscribers.push(() => emitter.off(eventName, handler));
    };

    (Object.keys(eventHandlers) as Array<keyof CameraSystemEvents>).forEach(subscribe);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [eventHandlers, system]);

  useEffect(() => {
    return () => {
      system?.destroy();
    };
  }, [system]);

  const updateConfig = useCallback((config: Partial<CameraSystemConfig>) => {
    system?.updateConfig(config);
  }, [system]);

  const getState = useCallback(() => {
    return system?.getState();
  }, [system]);

  const getMetrics = useCallback(() => {
    return system?.getMetrics();
  }, [system]);

  return {
    system ,
    updateConfig,
    getState,
    getMetrics,
  };
} 
