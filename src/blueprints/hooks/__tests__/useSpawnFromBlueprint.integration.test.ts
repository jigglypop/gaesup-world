import { act, renderHook } from '@testing-library/react';

import { BridgeFactory } from '../../../core/boilerplate';
import { useGaesupStore } from '../../../core/stores/gaesupStore';
import { WorldBridge } from '../../../core/world/bridge/WorldBridge';
import { WARRIOR_BLUEPRINT } from '../../characters/warrior';
import { useSpawnFromBlueprint } from '../useSpawnFromBlueprint';

test('a real world bridge rejects spawning before registration and retains the object after retry', async () => {
  const bridge = new WorldBridge();
  const factory = jest.spyOn(BridgeFactory, 'getOrCreate').mockReturnValue(bridge);
  const { mode, urls } = useGaesupStore.getState();
  const { result, unmount } = renderHook(() => useSpawnFromBlueprint());
  try {
    await act(async () => {
      expect(await result.current.spawnEntity(WARRIOR_BLUEPRINT.id)).toBeNull();
    });
    expect(useGaesupStore.getState().mode).toBe(mode);
    expect(useGaesupStore.getState().urls).toBe(urls);
    bridge.register('default');
    await act(async () => {
      const entity = await result.current.spawnEntity(WARRIOR_BLUEPRINT.id, { position: [3, 2, 1] });
      expect(entity).not.toBeNull();
      const object = bridge.getEngine('default')?.system.getObject(entity!.id);
      expect(object?.position.toArray()).toEqual([3, 2, 1]);
      expect(object?.metadata?.['characterUrl']).toBe('gltf/ally_body.glb');
    });
    expect(useGaesupStore.getState().urls.characterUrl).toBe('gltf/ally_body.glb');
    expect(result.current.lastSpawnedEntity).not.toBeNull();
  } finally {
    unmount();
    bridge.dispose();
    factory.mockRestore();
    useGaesupStore.setState({ mode, urls });
  }
});
