import { act, renderHook } from '@testing-library/react';

import { useSpawnFromBlueprint } from '../useSpawnFromBlueprint';
import { WARRIOR_BLUEPRINT } from '../../characters/warrior';
import { blueprintRegistry } from '../../registry';
import type { WorldBridge } from '../../../core/world/bridge/WorldBridge';

const mockAddObject = jest.fn<string, Parameters<WorldBridge['addObject']>>(() => 'spawned');
const mockSetUrls = jest.fn();
const mockSetMode = jest.fn();
const mockGetEngine = jest.fn<unknown, [string]>(() => ({}));
jest.mock('../../../core/boilerplate', () => ({
  BridgeFactory: { getOrCreate: () => ({ addObject: mockAddObject, getEngine: mockGetEngine }) },
}));
jest.mock('../../../core/stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: unknown) => unknown) => selector({ setUrls: mockSetUrls, setMode: mockSetMode }),
}));

beforeEach(() => jest.clearAllMocks());

test('an unregistered world reports failure without changing the controller or publishing an entity', async () => {
  mockGetEngine.mockReturnValueOnce(undefined);
  const { result } = renderHook(() => useSpawnFromBlueprint());
  await act(async () => {
    expect(await result.current.spawnEntity(WARRIOR_BLUEPRINT.id)).toBeNull();
  });
  expect(mockAddObject).not.toHaveBeenCalled();
  expect(mockSetUrls).not.toHaveBeenCalled();
  expect(mockSetMode).not.toHaveBeenCalled();
  expect(result.current.lastSpawnedEntity).toBeNull();
  expect(result.current.isSpawning).toBe(false);
});

test('spawning a parts-based character uses its body model for both world metadata and the controller', async () => {
  const { result } = renderHook(() => useSpawnFromBlueprint());
  await act(async () => {
    expect(await result.current.spawnEntity(WARRIOR_BLUEPRINT.id)).not.toBeNull();
  });
  expect(mockAddObject.mock.calls[0]?.[1].metadata).toEqual(expect.objectContaining({ characterUrl: 'gltf/ally_body.glb' }));
  expect(mockSetUrls).toHaveBeenCalledWith({ characterUrl: 'gltf/ally_body.glb' });
  expect(blueprintRegistry.get(WARRIOR_BLUEPRINT.id)).toBe(WARRIOR_BLUEPRINT);
});

test.each([
  { model: ' /legacy.glb ', metadata: '/metadata.glb', body: true, expected: '/legacy.glb' },
  { model: ' ', metadata: '/metadata.glb', body: true, expected: 'gltf/ally_body.glb' },
  { model: '', metadata: ' /metadata.glb ', body: false, expected: '/metadata.glb' },
  { model: '', metadata: '', body: false, expected: '' },
])('resolves model precedence for $expected', async ({ model, metadata, body, expected }) => {
  const blueprint = {
    ...WARRIOR_BLUEPRINT, id: 'model-resolution',
    visuals: { model, parts: body ? WARRIOR_BLUEPRINT.visuals?.parts ?? [] : [] },
    metadata: { modelUrl: metadata },
  };
  blueprintRegistry.register(blueprint);
  const { result, unmount } = renderHook(() => useSpawnFromBlueprint());
  try {
    await act(async () => { await result.current.spawnEntity(blueprint.id); });
    expect(mockAddObject.mock.calls[0]?.[1].metadata?.['characterUrl']).toBe(expected);
    expect(mockSetUrls).toHaveBeenCalledWith({ characterUrl: expected });
  } finally {
    unmount();
    blueprintRegistry.remove(blueprint.id);
  }
});
