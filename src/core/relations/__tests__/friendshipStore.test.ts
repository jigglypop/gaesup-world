import { registerSeedItems } from '../../items/data/items';
import { useFriendshipStore } from '../stores/friendshipStore';
import { DAILY_FRIENDSHIP_CAP } from '../types';

beforeAll(() => {
  registerSeedItems();
});

beforeEach(() => {
  useFriendshipStore.setState({ entries: {} });
});

describe('friendshipStore', () => {
  test('add increases score', () => {
    useFriendshipStore.getState().add('npc1', 10, 0);
    expect(useFriendshipStore.getState().scoreOf('npc1')).toBe(10);
  });

  test('daily cap blocks gains beyond cap', () => {
    const day = 0;
    const gained1 = useFriendshipStore.getState().add('npc1', DAILY_FRIENDSHIP_CAP - 5, day);
    const gained2 = useFriendshipStore.getState().add('npc1', 20, day);
    expect(gained1).toBe(DAILY_FRIENDSHIP_CAP - 5);
    expect(gained2).toBe(5);
    expect(useFriendshipStore.getState().scoreOf('npc1')).toBe(DAILY_FRIENDSHIP_CAP);
  });

  test('next day resets daily gain', () => {
    useFriendshipStore.getState().add('npc1', DAILY_FRIENDSHIP_CAP, 0);
    const gained = useFriendshipStore.getState().add('npc1', 10, 1);
    expect(gained).toBe(10);
    expect(useFriendshipStore.getState().scoreOf('npc1')).toBe(DAILY_FRIENDSHIP_CAP + 10);
  });

  test('giveGift adds value based on item rarity', () => {
    const result = useFriendshipStore.getState().giveGift('npc1', 'fish-tuna', 0);
    expect(result.gained).toBeGreaterThan(0);
    const cur = useFriendshipStore.getState().entries['npc1']!;
    expect(cur.giftHistory['fish-tuna']).toBe(1);
  });

  test('level scales with score', () => {
    useFriendshipStore.setState({
      entries: { npc1: { npcId: 'npc1', score: 60, todayGained: 0, lastGiftDay: -1, giftHistory: {} } },
    });
    expect(useFriendshipStore.getState().levelOf('npc1')).toBe('acquaintance');
    useFriendshipStore.setState({
      entries: { npc1: { npcId: 'npc1', score: 200, todayGained: 0, lastGiftDay: -1, giftHistory: {} } },
    });
    expect(useFriendshipStore.getState().levelOf('npc1')).toBe('friend');
  });

  test('serialize/hydrate roundtrip', () => {
    useFriendshipStore.getState().add('npc1', 12, 0);
    useFriendshipStore.getState().giveGift('npc1', 'apple', 0);
    const blob = useFriendshipStore.getState().serialize();
    useFriendshipStore.setState({ entries: {} });
    useFriendshipStore.getState().hydrate(blob);
    const cur = useFriendshipStore.getState().entries['npc1']!;
    expect(cur.score).toBeGreaterThanOrEqual(12);
    expect(cur.giftHistory['apple']).toBe(1);
  });
});
