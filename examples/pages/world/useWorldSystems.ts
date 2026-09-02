import { useEffect, useRef } from 'react';

import {
  useAudioStore,
  useAutoSave,
  useCatalogTracker,
  useDayChange,
  useDecorationScore,
  useEventsTicker,
  useFriendshipStore,
  useGameClock,
  useHotbarKeyboard,
  useMailStore,
  useQuestObjectiveTracker,
  useWeatherStore,
  useWeatherTicker,
  logger,
  type GaesupRuntime,
  type SaveSystem,
} from 'gaesup-world';

import { dispatchWorldGameplayEvent, loadWorldRuntime } from '../runtime';
import { WORLD_WEATHER_ENABLED } from './data';

export interface WorldSystemsProps {
  runtime: GaesupRuntime;
  onRuntimeReady?: () => void;
}

const RESOLVED_WORLD_RUNTIME_OPERATION = Promise.resolve();
const WORLD_RUNTIME_OPERATION_QUEUES = new WeakMap<SaveSystem, Promise<void>>();

function reportWorldRuntimeOperationFailure(operation: 'load' | 'dispose', error: unknown): void {
  try {
    logger.error(
      `[WorldSystems] Runtime ${operation} failed.`,
      error instanceof Error ? error : String(error),
    );
  } catch {
    // Runtime lifecycle failures stay handled even when the diagnostics boundary fails.
  }
}

function enqueueWorldRuntimeOperation(
  runtime: GaesupRuntime,
  operation: 'load' | 'dispose',
  run: () => Promise<void>,
): Promise<void> {
  const previous =
    WORLD_RUNTIME_OPERATION_QUEUES.get(runtime.save) ?? RESOLVED_WORLD_RUNTIME_OPERATION;
  const recovered = previous.then(run).catch((error: unknown) => {
    reportWorldRuntimeOperationFailure(operation, error);
  });
  WORLD_RUNTIME_OPERATION_QUEUES.set(runtime.save, recovered);
  void recovered.then(() => {
    if (WORLD_RUNTIME_OPERATION_QUEUES.get(runtime.save) === recovered) {
      WORLD_RUNTIME_OPERATION_QUEUES.delete(runtime.save);
    }
  });
  return recovered;
}

export function WorldSystems({ runtime, onRuntimeReady }: WorldSystemsProps) {
  const generationRef = useRef(0);
  useGameClock(false);
  useHotbarKeyboard(true);
  useAutoSave({ intervalMs: 60_000 });
  useQuestObjectiveTracker(true);
  useCatalogTracker(true);
  useWeatherTicker(WORLD_WEATHER_ENABLED);
  useEventsTicker(true, {
    onStarted: (ids) => {
      for (const id of ids) {
        void dispatchWorldGameplayEvent({ type: 'calendarEventStarted', eventId: id });
      }
    },
  });
  useDecorationScore(true);

  useEffect(() => {
    useAudioStore.setState({
      masterMuted: true,
      bgmMuted: true,
      sfxMuted: true,
      currentBgmId: null,
    });
    useAudioStore.getState().stopBgm();
    useAudioStore.getState().apply();
  }, []);

  useDayChange((time) => {
    const day = Math.floor(time.totalMinutes / (60 * 24));
    useFriendshipStore.getState().resetDaily();
    useWeatherStore.getState().rollForDay(day, time.season);
    if (day > 0 && useMailStore.getState().messages.length < 3) {
      useMailStore.getState().send({
        from: '메이',
        subject: `${time.month}월 ${time.day}일의 편지`,
        body: '오늘도 평화로운 하루예요. 한번 들러주세요!\n\n- 메이 드림',
        sentDay: day,
        attachments: [{ bells: 100 }],
      });
    }
  });

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let cancelled = false;
    void enqueueWorldRuntimeOperation(runtime, 'load', async () => {
      if (cancelled || generationRef.current !== generation) return;
      await loadWorldRuntime(runtime);
      if (!cancelled && generationRef.current === generation) {
        onRuntimeReady?.();
      }
    });

    return () => {
      cancelled = true;
      if (generationRef.current === generation) {
        generationRef.current = generation + 1;
      }
      void enqueueWorldRuntimeOperation(runtime, 'dispose', async () => {
        await runtime.dispose();
      });
    };
  }, [onRuntimeReady, runtime]);

  return null;
}
