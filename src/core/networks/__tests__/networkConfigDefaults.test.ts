import { NetworkBridge } from '../bridge/NetworkBridge';
import { DEFAULT_NETWORK_CONFIG, defaultMultiplayerConfig } from '../config/defaultConfig';
import { useNetworkConfigStore } from '../stores/networkConfigStore';

test('the config store, the main engine and multiplayer start from one NetworkConfig default', () => {
  expect(Object.isFrozen(DEFAULT_NETWORK_CONFIG)).toBe(true);
  expect(defaultMultiplayerConfig).toMatchObject(DEFAULT_NETWORK_CONFIG);

  expect(useNetworkConfigStore.getState().config).toEqual(DEFAULT_NETWORK_CONFIG);
  useNetworkConfigStore.getState().updateConfig({ updateFrequency: 5 });
  useNetworkConfigStore.getState().resetConfig();
  expect(useNetworkConfigStore.getState().config).toEqual(DEFAULT_NETWORK_CONFIG);

  const bridge = new NetworkBridge();
  try {
    bridge.ensureMainEngine();
    expect(bridge.getEngine('main')?.system.getConfig()).toEqual(DEFAULT_NETWORK_CONFIG);
  } finally {
    bridge.dispose();
  }
});
