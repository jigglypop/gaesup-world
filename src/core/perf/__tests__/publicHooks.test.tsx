import { act, cleanup, renderHook } from '@testing-library/react';

import { useInventory } from '../../inventory/hooks/useInventory';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useTimeOfDay } from '../../time/hooks/useGameTime';
import { useTimeStore } from '../../time/stores/timeStore';

describe('public store hook snapshots', () => {
  const time = useTimeStore.getState();
  const inventory = useInventoryStore.getState();
  afterEach(() => {
    cleanup();
    useTimeStore.setState(time, true);
    useInventoryStore.setState(inventory, true);
  });

  it('keeps the time result stable within a minute and reacts to an actual minute change', () => {
    useTimeStore.getState().setTotalMinutes(480);
    let renders = 0;
    const { result } = renderHook(() => { renders++; return useTimeOfDay(); });
    const initial = result.current;
    const initialRenders = renders;
    act(() => { for (let i = 0; i < 100; i++) useTimeStore.getState().tick(1); });
    expect(result.current).toBe(initial);
    expect(renders).toBe(initialRenders);
    act(() => useTimeStore.getState().setTotalMinutes(481));
    expect(result.current).toEqual({ hour: 8, minute: 1 });
    expect(renders).toBe(initialRenders + 1);
  });

  it('ignores hotbar selection but publishes changed inventory slots', () => {
    let renders = 0;
    const { result } = renderHook(() => { renders++; return useInventory(); });
    const initial = result.current;
    const initialRenders = renders;
    act(() => useInventoryStore.getState().setEquippedHotbar(1));
    expect(result.current).toBe(initial);
    expect(renders).toBe(initialRenders);
    const slots = [...inventory.slots];
    act(() => useInventoryStore.setState({ slots }));
    expect(result.current.slots).toBe(slots);
    expect(renders).toBe(initialRenders + 1);
    expect(result.current.add).toBe(initial.add);
  });
});
