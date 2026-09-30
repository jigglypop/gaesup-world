import { act, render, screen } from '@testing-library/react';

import { useGameClock, useTimeOfDay } from '../../time/hooks/useGameTime';
import { useTimeStore, useTimeStoreApi } from '../../time/stores/timeStore';
import { GaesupRuntimeProvider, useGaesupRuntime, useGaesupRuntimeRevision } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

describe('runtime time scope', () => {
  it('inherits omitted providers, supports explicit legacy scope and rebinds on world replacement', () => {
    const a = createGaesupRuntime({ worldId: 'a' }); const b = createGaesupRuntime({ worldId: 'b' });
    a.timeStore.getState().setTotalMinutes(610); b.timeStore.getState().setTotalMinutes(720);
    const saved = useTimeStore.getState().serialize(); useTimeStore.getState().setTotalMinutes(480);
    function Consumer({ id }: { id: string }) {
      const runtime = useGaesupRuntime(); const revision = useGaesupRuntimeRevision();
      const time = useTimeOfDay(); const store = useTimeStoreApi(); useGameClock();
      return <button data-testid={id} onClick={() => store.getState().setTotalMinutes(900)}>{runtime?.worldId ?? 'legacy'}:{revision}:{time.hour}:{time.minute}</button>;
    }
    const tree = (runtime: typeof a) => <GaesupRuntimeProvider runtime={runtime} revision={3}>
      <GaesupRuntimeProvider><Consumer id="world" /></GaesupRuntimeProvider>
      <GaesupRuntimeProvider runtime={null}><Consumer id="legacy" /></GaesupRuntimeProvider>
    </GaesupRuntimeProvider>;
    const view = render(tree(a));
    try {
      expect(screen.getByTestId('world').textContent).toBe('a:3:10:10');
      expect(screen.getByTestId('legacy').textContent).toBe('legacy:0:8:0');
      expect(a.clockLoop.consumerCount).toBe(1); expect(a.clockLoop.ownerCount).toBe(0);
      view.rerender(tree(b));
      expect(screen.getByTestId('world').textContent).toBe('b:3:12:0');
      expect(a.clockLoop.consumerCount).toBe(0); expect(b.clockLoop.consumerCount).toBe(1);
      act(() => screen.getByTestId('world').click());
      expect(b.timeStore.getState().totalMinutes).toBe(900);
      expect(a.timeStore.getState().totalMinutes).toBe(610);
      expect(useTimeStore.getState().totalMinutes).toBe(480);
    } finally { view.unmount(); useTimeStore.getState().hydrate(saved); }
    expect(a.clockLoop.consumerCount).toBe(0); expect(b.clockLoop.consumerCount).toBe(0);
  });
});
