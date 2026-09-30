import { useEffect, useMemo, useRef } from 'react';

type Keyed = { key: string };

/** `next` with every item that equals the previous item of its key replaced by that previous object. */
export function reuseByKey<T extends Keyed>(next: readonly T[], previous: ReadonlyMap<string, T>, same: (a: T, b: T) => boolean): T[] {
  return next.map((item) => {
    const old = previous.get(item.key);
    return old && same(old, item) ? old : item;
  });
}

/**
 * `reuseByKey` against the last committed items: a rebuild that changed one item hands the same objects to the
 * memoized consumers of the others, so they skip their work. `same` must be a stable function.
 */
export function useReusedByKey<T extends Keyed>(next: readonly T[], same: (a: T, b: T) => boolean): T[] {
  const committed = useRef<ReadonlyMap<string, T>>(new Map());
  const items = useMemo(() => reuseByKey(next, committed.current, same), [next, same]);
  useEffect(() => {
    committed.current = new Map(items.map((item) => [item.key, item]));
  }, [items]);
  return items;
}

/** Same length and the same objects in the same order. */
export function sameItems(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

/**
 * `items`, or the array last returned when it holds the same objects in the same order: a filter over a store list
 * that an edit elsewhere rebuilt keeps its identity, and so do the memos keyed on it.
 */
export function useStableItems<T>(items: readonly T[]): readonly T[] {
  const last = useRef(items);
  if (last.current !== items && !sameItems(last.current, items)) last.current = items;
  return last.current;
}
