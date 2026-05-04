import { useEffect } from 'react';

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
  type GaesupRuntime,
} from '../../../src';
import { dispatchWorldGameplayEvent, loadWorldRuntime } from '../runtime';
import { WORLD_WEATHER_ENABLED } from './data';

export interface WorldSystemsProps {
  runtime: GaesupRuntime;
  onRuntimeReady?: () => void;
}

export function WorldSystems({ runtime, onRuntimeReady }: WorldSystemsProps) {
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
    let cancelled = false;
    void loadWorldRuntime(runtime).then(() => {
      if (!cancelled) {
        onRuntimeReady?.();
      }
    });
    return () => {
      cancelled = true;
      void runtime.dispose();
    };
  }, [onRuntimeReady, runtime]);

  return null;
}
