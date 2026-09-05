import type { RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { act, renderHook } from '@testing-library/react';

import { defaultMultiplayerConfig } from '../../config/defaultConfig';
import { PlayerNetworkManager } from '../../core/PlayerNetworkManager';
import type { PlayerNetworkManagerOptions } from '../../core/PlayerNetworkManager';
import { useMultiplayer } from '../useMultiplayer';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: object) => unknown) => selector({}),
}));
jest.mock('../../core/PlayerNetworkManager', () => ({
  PlayerNetworkManager: jest.fn((options: PlayerNetworkManagerOptions) => ({
    connect: () => options.onConnect?.(),
    disconnect: () => options.onDisconnect?.(),
    updateLocalPlayer: jest.fn(),
    sendChat: jest.fn(),
  })),
}));

test('runtime connection overrides survive equivalent renders and apply to the next connection', () => {
  jest.clearAllMocks();
  const view = renderHook(({ url }) => useMultiplayer({ config: {
    ...defaultMultiplayerConfig,
    websocket: { ...defaultMultiplayerConfig.websocket, url },
  } }), { initialProps: { url: 'ws://first' } });
  const options = { roomId: 'room', playerName: 'player', playerColor: '#fff' };
  try {
    act(() => view.result.current.connect(options));
    view.rerender({ url: 'ws://props' });
    act(() => view.result.current.connect(options));
    expect(jest.mocked(PlayerNetworkManager).mock.calls.at(-1)?.[0].url).toBe('ws://props');
    act(() => view.result.current.updateConfig({
      websocket: { ...defaultMultiplayerConfig.websocket, url: 'ws://override', reconnectAttempts: 7, reconnectDelay: 321, pingInterval: 4321 },
      enableAck: false,
      reliableTimeout: 1234,
      reliableRetryCount: 4,
      logLevel: 'error',
      logToConsole: false,
    }));
    view.rerender({ url: 'ws://props' });
    expect(PlayerNetworkManager).toHaveBeenCalledTimes(2);
    act(() => view.result.current.connect(options));
    expect(jest.mocked(PlayerNetworkManager).mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({
      url: 'ws://override', reconnectAttempts: 7, reconnectDelay: 321, pingInterval: 4321,
      enableAck: false, reliableTimeout: 1234, reliableRetryCount: 4, logLevel: 'error', logToConsole: false,
    }));
    act(() => view.result.current.updateConfig({ enableAck: true }));
    act(() => view.result.current.connect(options));
    expect(jest.mocked(PlayerNetworkManager).mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({ url: 'ws://override', enableAck: true }));
  } finally { view.unmount(); }
});

test('chat range follows prop changes until explicitly overridden and accepts zero', () => {
  jest.clearAllMocks();
  const view = renderHook(({ proximityRange }) => useMultiplayer({
    config: { ...defaultMultiplayerConfig, proximityRange },
  }), { initialProps: { proximityRange: 10 } });
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#fff' }));
    const manager = jest.mocked(PlayerNetworkManager).mock.results[0]!.value as PlayerNetworkManager;
    act(() => view.result.current.sendChat('first'));
    expect(manager.sendChat).toHaveBeenLastCalledWith('first', { range: 10 });
    view.rerender({ proximityRange: 20 });
    act(() => view.result.current.sendChat('updated'));
    expect(manager.sendChat).toHaveBeenLastCalledWith('updated', { range: 20 });
    act(() => view.result.current.updateConfig({ proximityRange: 0 }));
    view.rerender({ proximityRange: 30 });
    act(() => view.result.current.sendChat('override'));
    expect(manager.sendChat).toHaveBeenLastCalledWith('override', { range: 0 });
    act(() => view.result.current.sendChat('message option', { range: 5 }));
    expect(manager.sendChat).toHaveBeenLastCalledWith('message option', { range: 5 });
  } finally { view.unmount(); }
});

test.each(['method', 'props'] as const)('tracking frequency changes through %s replace the active timer', (source) => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  const translation = jest.fn(() => ({ x: Date.now(), y: 0, z: 0 }));
  const rigidBodyRef = { current: {
    translation,
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    linvel: () => ({ x: 1, y: 0, z: 0 }),
  } } as unknown as RefObject<RapierRigidBody>;
  const config = { ...defaultMultiplayerConfig, tracking: { ...defaultMultiplayerConfig.tracking, sendRateLimit: 0 } };
  const view = renderHook(({ currentConfig }) => useMultiplayer({ config: currentConfig, rigidBodyRef }), {
    initialProps: { currentConfig: config },
  });
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#fff' }));
    act(() => jest.advanceTimersByTime(1000));
    expect(translation).toHaveBeenCalledTimes(20);
    for (const updateRate of [2, 10]) {
      const tracking = { ...config.tracking, updateRate };
      act(() => {
        if (source === 'method') view.result.current.updateConfig({ tracking });
        else view.rerender({ currentConfig: { ...config, tracking } });
      });
      translation.mockClear();
      act(() => jest.advanceTimersByTime(1000));
      expect(translation).toHaveBeenCalledTimes(updateRate);
      expect(jest.getTimerCount()).toBe(1);
    }
    act(() => view.result.current.disconnect());
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    view.unmount();
    jest.useRealTimers();
  }
});

describe('speech expiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  test('expires without a rigid body and after a network disconnect', () => {
    const { result, unmount } = renderHook(() => useMultiplayer({ config: defaultMultiplayerConfig }));
    try {
      act(() => result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#fff' }));
      const callbacks = jest.mocked(PlayerNetworkManager).mock.calls[0]![0];
      act(() => callbacks.onChat?.('remote', 'hello', Date.now()));
      expect(result.current.speechByPlayerId.get('remote')).toBe('hello');
      act(() => callbacks.onDisconnect?.());
      act(() => jest.advanceTimersByTime(2500));
      expect(result.current.speechByPlayerId.size).toBe(0);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      unmount();
    }
  });

  test('replaces the expiry deadline and releases its timer on unmount', () => {
    const { result, unmount } = renderHook(() => useMultiplayer({ config: defaultMultiplayerConfig }));
    act(() => result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#fff' }));
    const callbacks = jest.mocked(PlayerNetworkManager).mock.calls[0]![0];
    act(() => callbacks.onChat?.('remote', 'first', Date.now()));
    act(() => jest.advanceTimersByTime(1000));
    act(() => callbacks.onChat?.('remote', 'second', Date.now()));
    act(() => jest.advanceTimersByTime(1500));
    expect(result.current.speechByPlayerId.get('remote')).toBe('second');
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.speechByPlayerId.size).toBe(0);
    act(() => callbacks.onChat?.('remote', 'pending', Date.now()));
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});

test('equivalent config rerenders preserve tracking history and a runtime frequency override', () => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  const translation = jest.fn(() => ({ x: 7, y: 0, z: 4 }));
  const rigidBodyRef = { current: {
    translation,
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    linvel: () => ({ x: 0, y: 0, z: 0 }),
  } } as unknown as RefObject<RapierRigidBody>;
  const view = renderHook(({ velocityThreshold }) => useMultiplayer({
    config: { ...defaultMultiplayerConfig, tracking: { ...defaultMultiplayerConfig.tracking, velocityThreshold } },
    rigidBodyRef,
  }), { initialProps: { velocityThreshold: 0.5 } });
  try {
    act(() => view.result.current.connect({ roomId: 'room', playerName: 'player', playerColor: '#fff' }));
    act(() => jest.advanceTimersByTime(100));
    const manager = jest.mocked(PlayerNetworkManager).mock.results[0]!.value as PlayerNetworkManager;
    expect(manager.updateLocalPlayer).toHaveBeenCalledTimes(1);
    for (let index = 0; index < 5; index++) {
      view.rerender({ velocityThreshold: 0.5 });
      act(() => jest.advanceTimersByTime(100));
    }
    expect(manager.updateLocalPlayer).toHaveBeenCalledTimes(1);
    view.rerender({ velocityThreshold: 0.8 });
    act(() => jest.advanceTimersByTime(100));
    expect(manager.updateLocalPlayer).toHaveBeenCalledTimes(1);
    act(() => view.result.current.updateConfig({ tracking: { ...defaultMultiplayerConfig.tracking, updateRate: 2 } }));
    view.rerender({ velocityThreshold: 0.8 });
    translation.mockClear();
    act(() => jest.advanceTimersByTime(1000));
    expect(translation).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(1);
  } finally {
    view.unmount();
    jest.useRealTimers();
  }
});

test('manual reconnect resumes position updates with the same rigid body ref', () => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  const rigidBodyRef = { current: {
    translation: () => ({ x: 7, y: 0, z: 4 }),
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    linvel: () => ({ x: 0, y: 0, z: 0 }),
  } } as unknown as RefObject<RapierRigidBody>;
  const { result, unmount } = renderHook(() =>
    useMultiplayer({ config: defaultMultiplayerConfig, rigidBodyRef }),
  );
  try {
    const options = { roomId: 'room', playerName: 'player', playerColor: '#fff' };
    act(() => result.current.connect(options));
    act(() => jest.advanceTimersByTime(100));
    const constructor = jest.mocked(PlayerNetworkManager);
    const first = constructor.mock.results[0]?.value as PlayerNetworkManager;
    expect(first.updateLocalPlayer).toHaveBeenCalledTimes(1);
    const callbacks = constructor.mock.calls[0]![0];
    act(() => callbacks.onDisconnect?.());
    act(() => callbacks.onConnect?.());
    act(() => jest.advanceTimersByTime(100));
    expect(first.updateLocalPlayer).toHaveBeenCalledTimes(2);
    act(() => result.current.connect({ ...options, roomId: 'another-room' }));
    act(() => jest.advanceTimersByTime(100));
    const anotherRoom = constructor.mock.results[1]?.value as PlayerNetworkManager;
    expect(anotherRoom.updateLocalPlayer).toHaveBeenCalledWith(expect.objectContaining({ position: [7, 0, 4] }));
    act(() => {
      result.current.stopTracking();
      result.current.disconnect();
    });
    act(() => result.current.connect(options));
    act(() => jest.advanceTimersByTime(100));
    const second = constructor.mock.results[2]?.value as PlayerNetworkManager;
    expect(second.updateLocalPlayer).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    jest.useRealTimers();
  }
});
