import { Profiler, type RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { act, renderHook } from '@testing-library/react';

import type { RemoteAvatarProps } from '../components/RemotePlayer';
import { RemotePlayers } from '../components/RemotePlayers';
import { defaultMultiplayerConfig } from '../config/defaultConfig';
import { LivePlayerMap } from '../core/LivePlayerMap';
import { PlayerNetworkManager, type PlayerNetworkManagerOptions } from '../core/PlayerNetworkManager';
import type { RemoteMotion } from '../core/remoteMotion';
import { useMultiplayer } from '../hooks/useMultiplayer';
import type { PlayerState } from '../types';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: object) => unknown) => selector({}),
}));
jest.mock('../core/PlayerNetworkManager', () => ({
  PlayerNetworkManager: jest.fn((options: PlayerNetworkManagerOptions) => ({
    connect: () => options.onConnect?.(),
    disconnect: () => options.onDisconnect?.(),
    updateLocalPlayer: jest.fn(),
    sendChat: jest.fn(),
  })),
}));

const remoteRenders: string[] = [];
const motions = new Map<string, RemoteMotion>();
jest.mock('../components/RemotePlayer', () => ({
  RemoteAvatar: ({ motion, appearance }: RemoteAvatarProps) => {
    remoteRenders.push(appearance.name);
    motions.set(appearance.name, motion);
    return <group name={`remote-${appearance.name}`} />;
  },
}));

function player(x: number, name = 'peer'): PlayerState {
  return { name, color: '#fff', position: [x, 0, 0], rotation: [1, 0, 0, 0] };
}

function lastManagerOptions(): PlayerNetworkManagerOptions {
  const options = jest.mocked(PlayerNetworkManager).mock.calls.at(-1)?.[0];
  if (!options) throw new Error('useMultiplayer did not create a PlayerNetworkManager');
  return options;
}

beforeEach(() => {
  remoteRenders.length = 0;
  motions.clear();
  jest.mocked(PlayerNetworkManager).mockClear();
});

describe('LivePlayerMap', () => {
  test('publishing notifies only the updated player and ignores non-members', () => {
    const map = new LivePlayerMap([['a', player(0)], ['b', player(1)]]);
    const onA = jest.fn();
    const onB = jest.fn();
    map.subscribePlayer('a', onA);
    map.subscribePlayer('b', onB);

    expect(map.publish('a', player(5))).toBe(true);
    expect(map.publish('ghost', player(9))).toBe(false);

    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).not.toHaveBeenCalled();
    expect(map.get('a')?.position[0]).toBe(5);
    expect(map.has('ghost')).toBe(false);
  });

  test('membership copies keep subscriptions and see states published on either instance', () => {
    const original = new LivePlayerMap([['a', player(0)]]);
    const listener = jest.fn();
    const unsubscribe = original.subscribePlayer('a', listener);
    const copy = new LivePlayerMap(original);
    copy.set('b', player(3));

    original.publish('a', player(7));
    expect(copy.get('a')?.position[0]).toBe(7);
    copy.publish('a', player(8));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(original.has('b')).toBe(false);
    expect(copy.get('b')?.position[0]).toBe(3);

    unsubscribe();
    copy.publish('a', player(9));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('deleting a member hides its latest state from that instance', () => {
    const map = new LivePlayerMap([['a', player(0)]]);
    map.publish('a', player(4));
    map.delete('a');
    expect(map.get('a')).toBeUndefined();
    expect([...map.keys()]).toEqual([]);
  });
});

describe('useMultiplayer remote state', () => {
  test('transform updates stay out of React until the throttled status refresh', () => {
    jest.useFakeTimers();
    let renders = 0;
    const view = renderHook(() => {
      renders++;
      return useMultiplayer({ config: defaultMultiplayerConfig });
    });
    try {
      act(() => view.result.current.connect({ roomId: 'room', playerName: 'me', playerColor: '#000' }));
      const options = lastManagerOptions();
      act(() => options.onPlayerJoin?.('peer', player(0)));
      const joined = view.result.current.players;
      expect(joined.get('peer')?.position[0]).toBe(0);
      const listener = jest.fn();
      joined.subscribePlayer('peer', listener);

      const rendersBeforeStream = renders;
      act(() => {
        for (let i = 1; i <= 20; i++) options.onPlayerUpdate?.('peer', player(i));
      });
      expect(renders).toBe(rendersBeforeStream);
      expect(listener).toHaveBeenCalledTimes(20);
      expect(view.result.current.players).toBe(joined);
      expect(view.result.current.players.get('peer')?.position[0]).toBe(20);

      const lastUpdateBefore = view.result.current.lastUpdate;
      act(() => {
        jest.advanceTimersByTime(250);
      });
      expect(renders).toBe(rendersBeforeStream + 1);
      expect(view.result.current.lastUpdate).toBeGreaterThanOrEqual(lastUpdateBefore);

      act(() => options.onPlayerLeave?.('peer'));
      expect(view.result.current.players).not.toBe(joined);
      expect(view.result.current.players.has('peer')).toBe(false);
    } finally {
      view.unmount();
      jest.useRealTimers();
    }
  });

  test('an update for an unknown player is treated as a join', () => {
    const view = renderHook(() => useMultiplayer({ config: defaultMultiplayerConfig }));
    try {
      act(() => view.result.current.connect({ roomId: 'room', playerName: 'me', playerColor: '#000' }));
      const before = view.result.current.players;
      act(() => lastManagerOptions().onPlayerUpdate?.('late', player(2)));
      expect(view.result.current.players).not.toBe(before);
      expect(view.result.current.players.get('late')?.position[0]).toBe(2);
    } finally {
      view.unmount();
    }
  });

  test('disconnect clears remote players and cancels a pending status refresh', () => {
    jest.useFakeTimers();
    const view = renderHook(() => useMultiplayer({ config: defaultMultiplayerConfig }));
    try {
      act(() => view.result.current.connect({ roomId: 'room', playerName: 'me', playerColor: '#000' }));
      const options = lastManagerOptions();
      act(() => options.onPlayerJoin?.('peer', player(0)));
      act(() => options.onPlayerUpdate?.('peer', player(1)));
      act(() => view.result.current.disconnect());
      expect(view.result.current.players.size).toBe(0);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      view.unmount();
      jest.useRealTimers();
    }
  });
});

describe('RemotePlayers', () => {
  test('transform messages from 24 peers commit nothing; an appearance change renders only that avatar', async () => {
    const ids = Array.from({ length: 24 }, (_, index) => `p${index}`);
    const players = new LivePlayerMap(ids.map((id, index) => [id, player(index, id)]));
    let commits = 0;
    const renderer = await ReactThreeTestRenderer.create(
      <Profiler id="remote-players" onRender={() => { commits++; }}>
        <RemotePlayers players={players} />
      </Profiler>,
    );
    try {
      expect(remoteRenders).toHaveLength(24);
      remoteRenders.length = 0;
      commits = 0;

      // One act per message, as each WebSocket message arrives in its own task. Speeds stay at a walk
      // (at most the run threshold), so the derived animation stays idle.
      for (let tick = 1; tick <= 5; tick++) {
        for (const id of ids) {
          await ReactThreeTestRenderer.act(async () => {
            players.publish(id, { ...player(tick, id), rotation: [0, 0, 1, 0], velocity: [tick / 10, 0, 0] });
          });
        }
      }
      expect(commits).toBe(0);
      expect(remoteRenders).toEqual([]);
      const motion = motions.get('p3')!;
      expect(motion.target.x).toBe(5);
      expect(motion.velocity.x).toBe(0.5);
      expect(motion.targetRotation.toArray()).toEqual([0, 1, 0, 0]);

      await ReactThreeTestRenderer.act(async () => {
        players.publish('p3', { ...player(6, 'p3'), animation: 'wave' });
      });
      expect(commits).toBe(1);
      expect(remoteRenders).toEqual(['p3']);
      expect(motion.appearance.animation).toBe('wave');
      expect(motion.target.x).toBe(6);
    } finally {
      await renderer.unmount();
    }
  });

  test('proximity is sampled in the frame loop and only changes membership when the set changes', async () => {
    const players = new LivePlayerMap([['near', player(2, 'near')], ['far', player(3, 'far')]]);
    const local = { x: 0, y: 0, z: 0 };
    const body = { translation: () => local } as unknown as RapierRigidBody;
    const playerRef: RefObject<RapierRigidBody | null> = { current: body };

    const renderer = await ReactThreeTestRenderer.create(
      <RemotePlayers players={players} playerRef={playerRef} proximityRange={10} />,
    );
    try {
      expect(renderer.scene.findAll((node) => String(node.props['name']).startsWith('remote-'))).toHaveLength(2);
      remoteRenders.length = 0;

      await renderer.advanceFrames(12, 1 / 60);
      expect(remoteRenders).toEqual([]);

      players.publish('far', player(50, 'far'));
      remoteRenders.length = 0;
      await ReactThreeTestRenderer.act(async () => {
        await renderer.advanceFrames(6, 1 / 60);
      });
      expect(renderer.scene.findAll((node) => node.props['name'] === 'remote-far')).toHaveLength(0);
      expect(renderer.scene.findAll((node) => node.props['name'] === 'remote-near')).toHaveLength(1);
      expect(remoteRenders).toEqual([]);

      local.x = 48;
      await ReactThreeTestRenderer.act(async () => {
        await renderer.advanceFrames(6, 1 / 60);
      });
      expect(renderer.scene.findAll((node) => node.props['name'] === 'remote-far')).toHaveLength(1);
      expect(renderer.scene.findAll((node) => node.props['name'] === 'remote-near')).toHaveLength(0);
    } finally {
      await renderer.unmount();
    }
  });
});
