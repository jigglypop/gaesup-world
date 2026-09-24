import type { ReactNode } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../runtime';
import type { GaesupRuntime } from '../../../runtime/types';
import { NetworkBridge } from '../../bridge/NetworkBridge';
import { useNetworkBridge } from '../useNetworkBridge';

// Real NetworkBridge from BridgeFactory or a runtime; the old test replaced both the factory and the bridge.
function inRuntime(runtime: GaesupRuntime) {
  return function RuntimeWrapper({ children }: { children: ReactNode }) {
    return <GaesupRuntimeProvider runtime={runtime}>{children}</GaesupRuntimeProvider>;
  };
}
const leases = (bridge: NetworkBridge | null) => (bridge ? bridge['updates'].size : 0);

afterEach(() => BridgeFactory.dispose('networks'));

describe('useNetworkBridge', () => {
  test('without a runtime it starts the main engine on the shared networks bridge', async () => {
    const { result, unmount } = renderHook(() => useNetworkBridge({ enableAutoUpdate: false }));
    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.bridge).toBeInstanceOf(NetworkBridge);
    expect(result.current.bridge).toBe(BridgeFactory.get('networks'));
    expect(result.current.getSystemState()?.isRunning).toBe(true);
    unmount();
  });

  test('commands, stats and config go to the engine of its systemId only', async () => {
    const config = { maxConnections: 7 };
    const { result, unmount } = renderHook(() => useNetworkBridge({ systemId: 'guards', config, enableAutoUpdate: false }));
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.executeCommand({ type: 'registerNPC', npcId: 'guard', position: new THREE.Vector3() }));

    const bridge = result.current.bridge!;
    expect(result.current.getNetworkStats()?.nodeCount).toBe(1);
    expect(bridge.getEngine('guards')?.system.getConfig().maxConnections).toBe(7);
    expect(bridge.getEngine('main')).toBeUndefined();
    unmount();
  });

  test('updateSystem publishes the engine snapshot to bridge listeners', async () => {
    const { result, unmount } = renderHook(() => useNetworkBridge({ enableAutoUpdate: false }));
    await waitFor(() => expect(result.current.isReady).toBe(true));
    const listener = jest.fn();
    const unsubscribe = result.current.bridge!.subscribe(listener);

    act(() => result.current.updateSystem(1 / 60));

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ nodeCount: 0 }), 'main');
    unsubscribe();
    unmount();
  });

  test('auto update holds one clock lease while mounted and releases it on unmount', async () => {
    const { result, unmount } = renderHook(() => useNetworkBridge());
    await waitFor(() => expect(leases(result.current.bridge)).toBe(1));
    const bridge = result.current.bridge;

    unmount();
    expect(leases(bridge)).toBe(0);
  });

  test('inside an active runtime it uses that world bridge; an inactive runtime yields no bridge', async () => {
    const runtime = createGaesupRuntime();
    try {
      const inactive = renderHook(() => useNetworkBridge(), { wrapper: inRuntime(runtime) });
      expect(inactive.result.current.isReady).toBe(false);
      expect(inactive.result.current.bridge).toBeNull();
      expect(inactive.result.current.getSnapshot()).toBeNull();
      expect(inactive.result.current.getNetworkStats()).toBeNull();
      inactive.unmount();

      await runtime.setup();
      const active = renderHook(() => useNetworkBridge(), { wrapper: inRuntime(runtime) });
      await waitFor(() => expect(active.result.current.isReady).toBe(true));
      expect(active.result.current.bridge).toBe(runtime.networkBridge);
      expect(BridgeFactory.get('networks')).toBeNull();
      active.unmount();
    } finally {
      await runtime.dispose();
    }
  });
});
