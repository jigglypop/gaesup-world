import { useEffect, useRef } from 'react';

import { mountEngine } from './scene';
import type { EngineSettings, EngineStats } from './types';

export default function EngineCanvas({
  settings,
  onStats,
  onError,
}: {
  settings: EngineSettings;
  onStats: (stats: EngineStats) => void;
  onError: (message: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Awaited<ReturnType<typeof mountEngine>>>(null);
  const currentSettings = useRef(settings);
  currentSettings.current = settings;
  useEffect(() => {
    if (!canvas.current) return;
    const abort = new AbortController();
    onError('');
    void mountEngine(canvas.current, currentSettings.current, onStats, abort.signal)
      .then((instance) => {
        if (abort.signal.aborted) {
          instance?.dispose();
          return;
        }
        engine.current = instance;
        instance?.update(currentSettings.current);
      })
      .catch((error: unknown) => {
        if (!abort.signal.aborted) onError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      abort.abort();
      engine.current = null;
    };
  }, [settings.count, onStats, onError]);
  useEffect(() => {
    engine.current?.update(settings);
  }, [settings]);
  return <canvas key={settings.count} ref={canvas} aria-label="마우스로 탐험할 수 있는 3D 숲" />;
}
