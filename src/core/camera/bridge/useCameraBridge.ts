import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { BaseCameraSystem } from './BaseCameraSystem';
import { CameraSystemConfig, CameraSystemEvents } from './types';

export function useCameraBridge<T extends BaseCameraSystem>(
  EngineClass: new (config: CameraSystemConfig) => T,
  initialConfig: CameraSystemConfig,
  eventHandlers?: Partial<{
    [K in keyof CameraSystemEvents]: (data: CameraSystemEvents[K]) => void;
  }>
): {
  engine: T;
  updateConfig: (config: Partial<CameraSystemConfig>) => void;
  getState: () => any;
  getMetrics: () => any;
} {
  const engineRef = useRef<T>(null);
  if (!engineRef.current) {
    engineRef.current = new EngineClass(initialConfig);
  }
  const engine = engineRef.current;
  useFrame((_, delta) => {
    engine?.update(delta);
  });

  useEffect(() => {
    if (!eventHandlers || !engine) return;
    const unsubscribers: Array<() => void> = [];
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      if (handler) {
        engine.emitter.on(eventName as any, handler as any);
        unsubscribers.push(() => {
          engine.emitter.off(eventName as any, handler as any);
        });
      }
    });
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [eventHandlers, engine]);

  useEffect(() => {
    return () => {
      engine?.destroy();
    };
  }, [engine]);

  const updateConfig = useCallback((config: Partial<CameraSystemConfig>) => {
    engine?.updateConfig(config);
  }, [engine]);

  const getState = useCallback(() => {
    return engine?.getState();
  }, [engine]);

  const getMetrics = useCallback(() => {
    return engine?.getMetrics();
  }, [engine]);

  return {
    engine ,
    updateConfig,
    getState,
    getMetrics,
  };
} 