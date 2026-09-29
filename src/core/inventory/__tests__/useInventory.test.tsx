import { act, renderHook } from '@testing-library/react';

import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useInventory } from '../hooks/useInventory';
import { useInventoryStore } from '../stores/inventoryStore';

beforeAll(() => {
  getItemRegistry().registerAll([
    { id: 'apple', name: 'apple', icon: 'apple', category: 'food', stackable: true, maxStack: 99 },
  ]);
});

beforeEach(() => {
  useInventoryStore.getState().clear();
});

describe('useInventory', () => {
  it('렌더를 반복해도 같은 참조를 반환하고 무한 렌더에 빠지지 않는다', () => {
    const { result, rerender } = renderHook(() => useInventory());
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
    expect(first.slots.length).toBeGreaterThan(0);
  });

  it('슬롯이 바뀌면 새 값을 반환하고 반환된 함수로 아이템을 넣을 수 있다', () => {
    const { result } = renderHook(() => useInventory());
    const first = result.current;

    act(() => {
      result.current.add('apple', 3);
    });

    expect(result.current).not.toBe(first);
    expect(result.current.countOf('apple')).toBe(3);
  });
});
