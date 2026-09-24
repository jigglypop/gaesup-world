import { Vector3 } from 'three';

import { createInteractablesStore, type InteractableEntry } from '../interactablesStore';

const entry = (overrides: Partial<InteractableEntry> = {}): InteractableEntry => ({ id: 'same', kind: 'misc', label: 'first', key: 'e', range: 2, position: new Vector3(1, 0, 0), onActivate: jest.fn(), ...overrides });

test('worlds own position copies and same-ID registrations; old cleanup cannot remove a newer owner', () => {
  const a = createInteractablesStore(); const b = createInteractablesStore(); const original = entry();
  const old = a.getState().register(original); b.getState().register(original); original.position.set(9, 0, 0);
  expect(a.getState().entries.get('same')!.position.x).toBe(1);
  const current = a.getState().register(entry({ label: 'new' })); old(); old();
  expect(a.getState().entries.get('same')!.label).toBe('new'); current(); expect(a.getState().entries.size).toBe(0); expect(b.getState().entries.size).toBe(1);
});

test('selected metadata changes immediately and unregister clears a selected target', () => {
  const store = createInteractablesStore(); const state = store.getState(); state.register(entry()); state.track(new Vector3(), 0);
  state.setCurrent({ id: 'same', label: 'changed', key: 'q', distance: 1.01 }); expect(store.getState().current).toMatchObject({ label: 'changed', key: 'q' });
  state.register(entry({ label: 'replaced', key: 'r' })); expect(store.getState().current).toMatchObject({ label: 'replaced', key: 'r' });
  state.unregister('same'); expect(store.getState().current).toBeNull(); expect(state.activateCurrent()).toBe(false);
});

test('two trackers share one scan at the same frame even with zero throttle; clock rewind is allowed', () => {
  const store = createInteractablesStore(); const state = store.getState(); state.register(entry()); state.register(entry({ id: 'far', position: new Vector3(10, 0, 0) }));
  state.track(new Vector3(), 100, 0); state.track(new Vector3(), 100, 0); expect(state.getStats()).toMatchObject({ scans: 1, visited: 2 });
  state.track(new Vector3(), 101, 80); expect(state.getStats().scans).toBe(1); state.track(new Vector3(), 0, 80); expect(state.getStats().scans).toBe(2);
});

test('activation rechecks the latest player and live world target positions between scans', () => {
  const state = createInteractablesStore().getState(); const activate = jest.fn(); const target = new Vector3(1, 0, 0);
  state.register(entry({ position: new Vector3(100, 0, 0), getPosition: () => target, onActivate: activate }));
  state.track(new Vector3(), 0); expect(state.activateCurrent()).toBe(true);
  state.track(new Vector3(9, 0, 0), 1); expect(state.activateCurrent()).toBe(false); expect(activate).toHaveBeenCalledTimes(1);
  target.set(9, 0, 0); state.track(new Vector3(9, 0, 0), 81); expect(state.activateCurrent()).toBe(true);
  target.x = NaN; expect(state.activateCurrent()).toBe(false);
});

test('stopped worlds retain registered definitions but do not select or execute until resumed and scanned', () => {
  const store = createInteractablesStore(false); const state = store.getState(); const activate = jest.fn(); state.register(entry({ onActivate: activate }));
  state.track(new Vector3(), 0); expect(state.getStats().scans).toBe(0); expect(store.getState().current).toBeNull();
  state.resume(); state.track(new Vector3(), 0); expect(state.activateCurrent()).toBe(true);
  state.suspend(); expect(store.getState().current).toBeNull(); expect(state.activateCurrent()).toBe(false); expect(store.getState().entries.size).toBe(1);
  state.resume(); expect(state.activateCurrent()).toBe(false); state.track(new Vector3(), 0); expect(state.activateCurrent()).toBe(true);
});

test('prompt distance updates only when the displayed tenth changes', () => {
  const store = createInteractablesStore(); const state = store.getState(); state.register(entry());
  const listener = jest.fn(); const off = store.subscribe(listener);
  for (const distance of [1.0, 1.02, 1.04, 1.06, 1.08, 1.12]) state.setCurrent({ id: 'same', label: 'first', key: 'e', distance });
  expect(listener).toHaveBeenCalledTimes(2); expect(store.getState().current?.distance).toBe(1.06);
  off();
});
