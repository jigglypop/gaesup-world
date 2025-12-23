import { useRef, useEffect, useCallback } from 'react';

import { useFrame } from '@react-three/fiber';

import { BaseCameraSystem } from './BaseCameraSystem';
import { CameraSystemConfig, CameraSystemEvents } from './types';

export function useCameraBridge<T extends BaseCameraSystem>(
  SystemClass: new (config: CameraSystemConfig) => T,
  initialConfig: CameraSystemConfig,
  eventHandlers?: Partial<{
    [K in keyof CameraSystemEvents]: (data: CameraSystemEvents[K]) => void;
  }>
): {
  system: T;
  updateConfig: (config: Partial<CameraSystemConfig>) => void;
  getState: () => any;
  getMetrics: () => any;
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
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      if (handler) {
        system.emitter.on(eventName as any, handler as any);
        unsubscribers.push(() => {
          system.emitter.off(eventName as any, handler as any);
        });
      }
    });
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