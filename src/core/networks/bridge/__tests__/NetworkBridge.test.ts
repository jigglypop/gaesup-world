import * as THREE from 'three';

import { FixedStepClock } from '../../../simulation/FixedStepClock';
import { NetworkSystem } from '../../core/NetworkSystem';
import type { NetworkCommand } from '../../types';
import { NetworkBridge } from '../NetworkBridge';

// Real NetworkSystem engines on a fixed clock: a mocked engine only proved that calls were forwarded.
describe('NetworkBridge', () => {
  let clock: FixedStepClock;
  let bridge: NetworkBridge;

  // The default config updates at 30Hz, so two 60Hz ticks run one network update.
  const settle = () => clock.stepTicks(2);
  const register = (id: string, npcId: string, x: number) =>
    bridge.execute(id, { type: 'registerNPC', npcId, position: new THREE.Vector3(x, 0, 0) });

  beforeEach(() => {
    clock = new FixedStepClock();
    bridge = NetworkBridge.forClock(clock);
    bridge.ensureMainEngine();
  });

  afterEach(() => {
    bridge.dispose();
  });

  test('ensureMainEngine starts one main engine and keeps it', () => {
    const main = bridge.getEngine('main');
    bridge.ensureMainEngine();

    expect(bridge.getEngine('main')).toBe(main);
    expect(bridge.getSystemState('main')?.isRunning).toBe(true);
  });

  test('commands reach the engine and its snapshot after the next update', () => {
    register('main', 'a', 0);
    register('main', 'b', 1);
    bridge.execute('main', { type: 'connect', npcId: 'a', targetId: 'b' });
    settle();

    expect(bridge.snapshot('main')).toMatchObject({ nodeCount: 2, connectionCount: 1 });
    expect(bridge.getNetworkStats('main')).toMatchObject({ nodeCount: 2, connectionCount: 1 });
  });

  test('engines registered under different ids do not share state', () => {
    bridge.register('side');
    register('side', 'x', 0);
    settle();

    expect(bridge.snapshot('side')?.nodeCount).toBe(1);
    expect(bridge.snapshot('main')?.nodeCount).toBe(0);
  });

  test('group and config commands change the engine', () => {
    const now = Date.now();
    bridge.execute('main', {
      type: 'createGroup',
      group: { type: 'party', members: new Set<string>(), maxMembers: 4, range: 50, persistent: false, createdAt: now, lastActivity: now },
    });
    bridge.execute('main', { type: 'updateConfig', data: { config: { maxConnections: 7 } } });
    settle();

    expect(bridge.snapshot('main')?.activeGroups).toBe(1);
    expect(bridge.getEngine('main')?.system.getConfig().maxConnections).toBe(7);
  });

  test('unknown engines and command types are ignored', () => {
    expect(bridge.snapshot('missing')).toBeNull();
    expect(bridge.getNetworkStats('missing')).toBeNull();
    expect(bridge.getSystemState('missing')).toBeNull();
    expect(() => bridge.updateSystem('missing', 1 / 60)).not.toThrow();
    expect(() => bridge.execute('main', { type: 'invalidCommand' } as unknown as NetworkCommand)).not.toThrow();
  });

  test('a failing engine build is logged and registers nothing', () => {
    jest.spyOn(NetworkSystem.prototype, 'start').mockImplementationOnce(() => {
      throw new Error('start failed');
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    bridge.register('broken');

    expect(bridge.getEngine('broken')).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith('[NetworkBridge] Failed to build engine:', expect.any(Error));
  });

  test('unregister and dispose stop the engines they remove', () => {
    bridge.register('temp');
    const temp = bridge.getEngine('temp')!.system;
    const main = bridge.getEngine('main')!.system;

    bridge.unregister('temp');
    expect(bridge.getEngine('temp')).toBeUndefined();
    expect(temp.getState().isRunning).toBe(false);

    bridge.dispose();
    expect(bridge.getEngine('main')).toBeUndefined();
    expect(main.getState().isRunning).toBe(false);
  });
});
