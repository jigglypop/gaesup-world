import type { RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { act, renderHook } from '@testing-library/react';

import { defaultMultiplayerConfig, useMultiplayer, type MultiplayerConfig } from 'gaesup-world/network';

/**
 * A multiplayer wire harness shared by the network unit tests and the S-H13 acceptance scenario: a fake socket,
 * a body sampled like a Rapier body read at 20 Hz, and a helper that streams ten seconds through the real
 * `useMultiplayer` hook, manager and tracker. Test files still mock `@stores/gaesupStore` themselves.
 */
export type Vec = { x: number; y: number; z: number };

export class WireSocket {
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

/** Swaps the global WebSocket for WireSocket around the calling test file. */
export function installWireSocket(): void {
  const original = globalThis.WebSocket;
  beforeAll(() => {
    globalThis.WebSocket = WireSocket as unknown as typeof WebSocket;
  });
  afterAll(() => {
    globalThis.WebSocket = original;
  });
}

/** A body whose pose advances once per tracking sample, like a Rapier body read at 20 Hz. */
export function body(sample: (tick: number) => { position: Vec; velocity: Vec }): RefObject<RapierRigidBody> {
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

export const WIRE_STREAM_SECONDS = 10;

/** Streams ten seconds of tracking through the real hook, manager and tracker; returns the sent Updates. */
export function streamUpdates(rigidBodyRef: RefObject<RapierRigidBody>, config: MultiplayerConfig = defaultMultiplayerConfig): string[] {
  jest.useFakeTimers();
  const view = renderHook(() => useMultiplayer({ config, rigidBodyRef, characterUrl: '/gltf/ally.glb' }));
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#ff8800' }));
    act(() => { jest.advanceTimersByTime(1); });
    act(() => { jest.advanceTimersByTime(WIRE_STREAM_SECONDS * 1000); });
    return WireSocket.last!.sent.filter((raw) => raw.startsWith('{"type":"Update"'));
  } finally {
    view.unmount();
    jest.useRealTimers();
  }
}

export const noise = (tick: number) => (((tick * 7919) % 13) - 6) * 1e-4;

/** A resting player: fixed position with physics noise on height and velocity. */
export const resting = (tick: number) => ({
  position: { x: 12.345678, y: 0.52 + noise(tick), z: -5.4321 },
  velocity: { x: noise(tick), y: noise(tick + 1), z: noise(tick + 2) },
});

export const walking = (tick: number) => ({
  position: { x: -123.456 + tick * 0.1, y: 0.52, z: 87.654321 },
  velocity: { x: 2, y: 0, z: 0 },
});
