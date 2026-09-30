import { DEFAULT_PROJECT_SETTINGS } from '../../project-settings';
import { createSceneCollisionGroups } from '../collisionGroups';
import {
  canSceneLayersCollide,
  createSceneLayerTagRegistry,
  DEFAULT_SCENE_LAYER_TAG_REGISTRY,
} from '../layers';

const MEMBERSHIP_SHIFT = 16;
const GROUP_MASK = 0xffff;

function interacts(a: number, b: number): boolean {
  return ((a >>> MEMBERSHIP_SHIFT) & b & GROUP_MASK) !== 0 && ((b >>> MEMBERSHIP_SHIFT) & a & GROUP_MASK) !== 0;
}

describe('createSceneCollisionGroups', () => {
  test('모든 충돌 레이어 조합에서 Rapier 그룹 판정이 충돌 매트릭스와 같다', () => {
    const physics = DEFAULT_PROJECT_SETTINGS.physics;
    const groups = createSceneCollisionGroups(DEFAULT_SCENE_LAYER_TAG_REGISTRY, physics);
    const layers = [...groups.keys()];
    expect(layers).toEqual(['default', 'environment', 'player', 'npc', 'interactable']);
    layers.forEach((source) => {
      layers.forEach((target) => {
        expect(interacts(groups.get(source)!, groups.get(target)!)).toBe(
          canSceneLayersCollide(physics, source, target),
        );
      });
    });
    expect(interacts(groups.get('player')!, groups.get('default')!)).toBe(false);
    expect(interacts(groups.get('player')!, groups.get('environment')!)).toBe(true);
  });

  test('충돌 용도가 아니거나 인덱스가 없거나 16 이상인 레이어는 그룹을 만들지 않는다', () => {
    const registry = createSceneLayerTagRegistry({
      layers: [
        { id: 'solid', index: 0, purposes: ['collision'] },
        { id: 'visual', index: 1, purposes: ['rendering'] },
        { id: 'unindexed', purposes: ['collision'] },
        { id: 'overflow', index: 16, purposes: ['collision'] },
      ],
    });
    const groups = createSceneCollisionGroups(registry, { collisionMatrix: { solid: ['solid'] } });
    expect([...groups]).toEqual([['solid', ((1 << MEMBERSHIP_SHIFT) | 1) >>> 0]]);
  });
});
