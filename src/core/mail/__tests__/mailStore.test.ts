import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { useWalletStore } from '../../economy/stores/walletStore';
import { useMailStore } from '../stores/mailStore';

beforeAll(() => {
  registerSeedItems();
});

beforeEach(() => {
  useMailStore.setState({ messages: [] });
  useInventoryStore.setState({
    slots: new Array(useInventoryStore.getState().slots.length).fill(null),
  });
  useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
});

describe('mailStore', () => {
  test('send appends new message', () => {
    const id = useMailStore.getState().send({ from: 'A', subject: 'hi', body: 'hello', sentDay: 0 });
    expect(useMailStore.getState().messages.length).toBe(1);
    expect(useMailStore.getState().messages[0]!.id).toBe(id);
  });

  test('unreadCount tracks unread', () => {
    useMailStore.getState().send({ from: 'A', subject: 's', body: 'b', sentDay: 0 });
    useMailStore.getState().send({ from: 'B', subject: 's', body: 'b', sentDay: 0 });
    expect(useMailStore.getState().unreadCount()).toBe(2);
    const id = useMailStore.getState().messages[0]!.id;
    useMailStore.getState().markRead(id);
    expect(useMailStore.getState().unreadCount()).toBe(1);
  });

  test('claim grants attached items and bells', () => {
    const id = useMailStore.getState().send({
      from: 'A', subject: 'gift', body: 'b', sentDay: 0,
      attachments: [{ itemId: 'apple', count: 2 }, { bells: 100 }],
    });
    const ok = useMailStore.getState().claim(id);
    expect(ok).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(2);
    expect(useWalletStore.getState().bells).toBe(100);
    expect(useMailStore.getState().messages[0]!.claimed).toBe(true);
  });

  test('claim is idempotent', () => {
    const id = useMailStore.getState().send({
      from: 'A', subject: 'gift', body: 'b', sentDay: 0,
      attachments: [{ bells: 50 }],
    });
    useMailStore.getState().claim(id);
    const second = useMailStore.getState().claim(id);
    expect(second).toBe(false);
    expect(useWalletStore.getState().bells).toBe(50);
  });

  test('serialize/hydrate roundtrip', () => {
    useMailStore.getState().send({ from: 'A', subject: 'hi', body: 'hello', sentDay: 3 });
    const blob = useMailStore.getState().serialize();
    useMailStore.setState({ messages: [] });
    useMailStore.getState().hydrate(blob);
    expect(useMailStore.getState().messages.length).toBe(1);
    expect(useMailStore.getState().messages[0]!.subject).toBe('hi');
  });
});
