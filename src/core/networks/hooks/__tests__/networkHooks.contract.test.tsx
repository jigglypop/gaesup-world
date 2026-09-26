import { act, renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import { HttpAssetSource } from '../../../assets/api';
import { NetworkBridge } from '../../bridge/NetworkBridge';
import { useNetworkGroup } from '../useNetworkGroup';
import { useNetworkMessage } from '../useNetworkMessage';

describe('network hook contracts', () => {
  let bridge: NetworkBridge;
  beforeEach(() => {
    jest.useFakeTimers();
    bridge = BridgeFactory.getOrCreateFor(NetworkBridge);
    bridge.ensureMainEngine();
    for (const [npcId, x] of [['a', 0], ['b', 1]] as const) {
      bridge.execute('main', { type: 'registerNPC', npcId, position: new THREE.Vector3(x, 0, 0) });
    }
  });
  afterEach(() => {
    BridgeFactory.dispose(NetworkBridge);
    jest.useRealTimers();
  });
  const settle = () => act(() => { jest.advanceTimersByTime(600); });

  test('a direct message reaches its receiver through the filter and never echoes to the sender', () => {
    const received = jest.fn();
    const a = renderHook(() => useNetworkMessage({ senderId: 'a', enableAutoUpdate: false }));
    const b = renderHook(() => useNetworkMessage({
      senderId: 'b', enableAutoUpdate: false, onMessageReceived: received, messageFilter: (message) => message.payload !== 'spam',
    }));
    act(() => {
      a.result.current.sendMessage('b', 'hello');
      a.result.current.sendMessage('b', 'spam');
    });
    settle();
    expect(b.result.current.receivedMessages.map((message) => message.payload)).toEqual(['hello']);
    expect(received).toHaveBeenCalledTimes(1);
    expect(a.result.current.receivedMessages).toEqual([]);
  });

  test('createGroup makes the named group with its creator and members, who then hear its messages', () => {
    const heard = jest.fn();
    const a = renderHook(() => useNetworkGroup({ npcId: 'a', enableAutoUpdate: false }));
    renderHook(() => useNetworkGroup({ npcId: 'b', enableAutoUpdate: false, onGroupMessage: heard }));
    act(() => a.result.current.createGroup('crew', ['b']));
    settle();
    expect([...bridge.getSystemState()?.groups.get('crew')?.members ?? []].sort()).toEqual(['node_a', 'node_b']);
    expect(a.result.current.joinedGroups).toEqual(['crew']);
    act(() => { a.result.current.sendGroupMessage('crew', 'rally'); });
    settle();
    expect(heard).toHaveBeenCalledWith(expect.objectContaining({ from: 'a', payload: 'rally' }), 'crew');
  });
});

test('HttpAssetSource calls the global fetch unbound by default, as browsers require', async () => {
  const original = globalThis.fetch;
  const requested: unknown[] = [];
  globalThis.fetch = function (this: unknown, input: RequestInfo | URL) {
    if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
    requested.push(input);
    return Promise.resolve({ ok: true, status: 200, json: async () => [{ id: 'hat', name: 'Hat', kind: 'characterPart' }] } as Response);
  } as typeof fetch;
  try {
    await expect(new HttpAssetSource('/api/').listAssets()).resolves.toEqual([{ id: 'hat', name: 'Hat', kind: 'characterPart' }]);
    expect(requested).toEqual(['/api/assets']);
  } finally {
    globalThis.fetch = original;
  }
});
