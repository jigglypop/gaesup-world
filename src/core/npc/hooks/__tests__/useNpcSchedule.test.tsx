import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';

import { createTimeStore, TimeStoreProvider, useTimeStore } from '../../../time/stores/timeStore';
import { getNPCScheduler } from '../../core/NPCScheduler';
import { useNpcSchedule } from '../useNpcSchedule';

test('uses the world clock and refreshes a different weekday at the same hour', () => {
  const store = createTimeStore(); store.getState().setTotalMinutes(480);
  const initialDay = store.getState().time.weekday;
  getNPCScheduler().register({ npcId: 'scoped-schedule', defaultEntry: { activity: 'sleep', position: [0, 0, 0] }, entries: [
    { startHour: 8, endHour: 9, weekdays: [initialDay], activity: 'work', position: [1, 0, 0] },
  ] });
  const legacyBefore = useTimeStore.getState().serialize();
  const view = renderHook(() => useNpcSchedule('scoped-schedule'), {
    wrapper: ({ children }: { children: ReactNode }) => <TimeStoreProvider value={store}>{children}</TimeStoreProvider>,
  });
  try {
    expect(view.result.current?.activity).toBe('work');
    act(() => store.getState().setTotalMinutes(480 + 1440));
    expect(view.result.current?.activity).toBe('sleep');
    expect(useTimeStore.getState().serialize()).toEqual(legacyBefore);
  } finally { view.unmount(); getNPCScheduler().unregister('scoped-schedule'); }
});
