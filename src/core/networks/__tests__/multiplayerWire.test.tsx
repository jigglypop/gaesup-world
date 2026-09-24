import type { RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { act, renderHook } from '@testing-library/react';

import { defaultMultiplayerConfig } from '../config/defaultConfig';
import { useMultiplayer } from '../hooks/useMultiplayer';
import type { MultiplayerConfig } from '../types';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: object) => unknown) => selector({}),
}));

type Vec = { x: number; y: number; z: number };

class WireSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static last: WireSocket | null = null;
  readyState = WireSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  readonly sent: string[] = [];

  constructor(readonly url: string) {
    WireSocket.last = this;
    setTimeout(() => {
      this.readyState = WireSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  send(raw: string): void {
    this.sent.push(raw);
  }

  receive(message: object): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  close(): void {
    this.readyState = 3;
  }
}

const originalWebSocket = globalThis.WebSocket;
beforeAll(() => {
  globalThis.WebSocket = WireSocket as unknown as typeof WebSocket;
});
afterAll(() => {
  globalThis.WebSocket = originalWebSocket;
});

/** A body whose pose advances once per tracking sample, like a Rapier body read at 20 Hz. */
function body(sample: (tick: number) => { position: Vec; velocity: Vec }): RefObject<RapierRigidBody> {
  let tick = 0;
  let current = sample(0);
  return {
    current: {
      translation: () => (current = sample(tick++)).position,
      rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
      linvel: () => current.velocity,
    } as unknown as RapierRigidBody,
  };
}

/** Streams ten seconds of tracking through the real hook, manager and tracker; returns the sent Updates. */
function streamUpdates(rigidBodyRef: RefObject<RapierRigidBody>, config: MultiplayerConfig = defaultMultiplayerConfig): string[] {
  jest.useFakeTimers();
  const view = renderHook(() => useMultiplayer({ config, rigidBodyRef, characterUrl: '/gltf/ally.glb' }));
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#ff8800' }));
    act(() => { jest.advanceTimersByTime(1); });
    act(() => { jest.advanceTimersByTime(10_000); });
    return WireSocket.last!.sent.filter((raw) => raw.startsWith('{"type":"Update"'));
  } finally {
    view.unmount();
    jest.useRealTimers();
  }
}

const noise = (tick: number) => (((tick * 7919) % 13) - 6) * 1e-4;
const walking = (tick: number) => ({
  position: { x: -123.456 + tick * 0.1, y: 0.52, z: 87.654321 },
  velocity: { x: 2, y: 0, z: 0 },
});

test('a resting player with physics noise sends a 1 Hz keepalive instead of a 20 Hz stream', () => {
  const updates = streamUpdates(body((tick) => ({
    position: { x: 12.345678, y: 0.52 + noise(tick), z: -5.4321 },
    velocity: { x: noise(tick), y: noise(tick + 1), z: noise(tick + 2) },
  })));
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
