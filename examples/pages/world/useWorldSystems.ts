import { useEffect, useMemo } from 'react';

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
  useShopStore,
  useWeatherStore,
  useWeatherTicker,
} from '../../../src';
import { createWorldRuntime, dispatchWorldGameplayEvent, loadWorldRuntime } from '../runtime';
import { WORLD_WEATHER_ENABLED } from './data';

export function WorldSystems() {
  const runtime = useMemo(() => createWorldRuntime(), []);

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
    useShopStore.getState().rollDailyStock(day);
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
    void loadWorldRuntime(runtime);
    return () => {
      void runtime.dispose();
    };
  }, [runtime]);

  return null;
}
