import { DEFAULT_NETWORK_CONFIG, defaultMultiplayerConfig } from '../config/defaultConfig';

test('multiplayer starts from the one frozen NetworkConfig default', () => {
  expect(Object.isFrozen(DEFAULT_NETWORK_CONFIG)).toBe(true);
  expect(defaultMultiplayerConfig).toMatchObject(DEFAULT_NETWORK_CONFIG);
});
