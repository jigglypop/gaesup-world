import { act, renderHook } from '@testing-library/react';

import { body, resting, streamUpdates, installWireSocket, walking, WireSocket } from '../../../../test/support/multiplayerWire';
import { defaultMultiplayerConfig } from '../config/defaultConfig';
import { useMultiplayer } from '../hooks/useMultiplayer';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: object) => unknown) => selector({}),
}));

installWireSocket();

test('a resting player with physics noise sends a 1 Hz keepalive instead of a 20 Hz stream', () => {
  const updates = streamUpdates(body(resting));
  // First snapshot plus one keepalive per second over 10 s.
  expect(updates).toHaveLength(10);
});

test('a moving player streams slim transforms; identity and animation ride only on the first Update', () => {
  const updates = streamUpdates(body(walking));
  expect(updates).toHaveLength(200);
  const [first, ...rest] = updates.map((raw) => JSON.parse(raw).state as Record<string, unknown>);
  expect(first).toMatchObject({ name: 'player', color: '#ff8800', modelUrl: '/gltf/ally.glb', animation: 'idle' });
  for (const state of rest) expect(Object.keys(state).sort()).toEqual(['position', 'rotation', 'velocity']);
  expect(Math.max(...updates.slice(1).map((raw) => raw.length))).toBeLessThanOrEqual(120);
});

test('sendRateLimit is the only send cap: 20 Hz samples leave at 10 Hz when it is 100 ms', () => {
  const tracking = { ...defaultMultiplayerConfig.tracking, sendRateLimit: 100 };
  const updates = streamUpdates(body(walking), { ...defaultMultiplayerConfig, tracking });
  expect(updates).toHaveLength(100);
});

test('a peer flooding 1000 chats in a second causes a bounded number of state updates', () => {
  jest.useFakeTimers();
  let renders = 0;
  const view = renderHook(() => {
    renders++;
    return useMultiplayer({ config: defaultMultiplayerConfig });
  });
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#ff8800' }));
    act(() => { jest.advanceTimersByTime(1); });
    const socket = WireSocket.last!;
    const before = renders;
    // Each message is its own task, as it would be off a real socket.
    for (let index = 0; index < 1000; index++) {
      act(() => {
        socket.receive({ type: 'Chat', client_id: 'spammer', text: `spam ${index}`, timestamp: index });
        jest.advanceTimersByTime(1);
      });
    }
    // Chat budget per peer: a burst of 4 plus 4 per second.
    expect(renders - before).toBeLessThanOrEqual(8);
    expect(view.result.current.speechByPlayerId.get('spammer')).toMatch(/^spam \d+$/);
  } finally {
    view.unmount();
    jest.useRealTimers();
  }
});
