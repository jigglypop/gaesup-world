import { createWorldRuntime, getWorldGameplayBlueprints } from '../runtime';

describe('examples world runtime', () => {
  test('공개 API로 예제 런타임 플러그인 스택을 설정한다', async () => {
    const runtime = createWorldRuntime();

    try {
      await runtime.setup();
      const blob = runtime.save.createBlob('world-runtime-test');

      expect(Object.keys(blob.domains)).toEqual(
        expect.arrayContaining([
          'building',
          'camera',
          'npc',
          'scene',
          'character',
          'time',
          'weather',
          'audio',
          'inventory',
          'relations',
          'quests',
          'mail',
          'catalog',
          'crafting',
          'farming',
          'events',
          'town',
          'i18n',
        ]),
      );
      expect(getWorldGameplayBlueprints().length).toBeGreaterThan(0);
    } finally {
      await runtime.dispose();
    }
  });
});
