import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useWalletStore } from '../../economy/stores/walletStore';
import { useMailStore } from '../stores/mailStore';
import type { MailSerialized } from '../types';

beforeAll(() => {
  getItemRegistry().register({
    id: 'apple', name: '사과', icon: '', category: 'food', stackable: true, maxStack: 10,
  });
});

beforeEach(() => {
  useMailStore.setState({ messages: [] });
  useInventoryStore.setState({
    slots: new Array(useInventoryStore.getState().slots.length).fill(null),
  });
  useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
});

describe('mailStore', () => {
  test('releases the claim guard when reward delivery throws before changing state', () => {
    const id = useMailStore.getState().send({ from: 'A', subject: 'gift', body: '', sentDay: 0,
      attachments: [{ bells: 100 }] });
    const add = jest.spyOn(useWalletStore.getState(), 'add').mockImplementationOnce(() => { throw new Error('delivery failed'); });
    try {
      expect(() => useMailStore.getState().claim(id)).toThrow('delivery failed');
      expect(useWalletStore.getState().bells).toBe(0);
      expect(useMailStore.getState().messages[0]?.claimed).toBe(false);
    } finally {
      add.mockRestore();
    }
    expect(useMailStore.getState().claim(id)).toBe(true);
    expect(useWalletStore.getState().bells).toBe(100);
  });

  test.each(['wallet', 'inventory'] as const)('rejects reentrant claims from %s subscribers', (source) => {
    const id = useMailStore.getState().send({ from: 'A', subject: 'gift', body: '', sentDay: 0,
      attachments: [{ bells: 100 }, { itemId: 'apple', count: 2 }] });
    const attempts: boolean[] = [];
    const listener = () => { attempts.push(useMailStore.getState().claim(id)); };
    const unsubscribe = source === 'wallet' ? useWalletStore.subscribe(listener) : useInventoryStore.subscribe(listener);
    try {
      expect(useMailStore.getState().claim(id)).toBe(true);
      expect(attempts).toEqual([false]);
      expect(useWalletStore.getState().bells).toBe(100);
      expect(useInventoryStore.getState().countOf('apple')).toBe(2);
      expect(useMailStore.getState().messages[0]?.claimed).toBe(true);
    } finally {
      unsubscribe();
    }
  });

  test.each([
    { bells: NaN }, { bells: -1 }, { itemId: '', count: 1 }, { itemId: 'apple', count: 0 },
    { itemId: 'apple', count: 1.5 }, { itemId: 'apple', bells: 1 }, null, [], {},
  ])('rejects corrupt attachments without replacing messages: %j', (attachment) => {
    const before = useMailStore.getState();
    const data = { version: 1, messages: [{ id: 'mail', from: '', subject: '', body: '', sentDay: 0, attachments: [attachment] }] };
    expect(() => before.hydrate(data as unknown as MailSerialized)).toThrow(TypeError);
    expect(useMailStore.getState()).toBe(before);
  });

  test('preparation owns attachments and preserves optional flags and custom item IDs', () => {
    const before = useMailStore.getState();
    const data: MailSerialized = { version: 1, messages: [{ id: 'custom', from: '', subject: '', body: '', sentDay: 0,
      attachments: [{ itemId: 'custom-item', count: 2 }, { bells: 0 }] }] };
    const apply = before.prepareHydrate(data);
    expect(useMailStore.getState()).toBe(before);
    data.messages[0]!.attachments![0] = { bells: 999 };
    data.messages[0]!.subject = 'changed';
    apply();
    expect(useMailStore.getState().messages[0]).toEqual({ id: 'custom', from: '', subject: '', body: '', sentDay: 0,
      attachments: [{ itemId: 'custom-item', count: 2 }, { bells: 0 }] });
    const current = useMailStore.getState();
    current.hydrate(null);
    expect(useMailStore.getState()).toBe(current);
    current.hydrate({ version: 1, messages: [] });
    expect(useMailStore.getState().messages).toEqual([]);
  });

  test.each([
    { version: 2, messages: [] }, { version: 1, messages: {} },
    { version: 1, messages: [{ id: 'mail', from: '', subject: '', body: '', sentDay: -1 }] },
    { version: 1, messages: [{ id: 'mail', from: '', subject: '', body: '', sentDay: 0, read: 'false' }] },
    { version: 1, messages: Array(2).fill({ id: 'duplicate', from: '', subject: '', body: '', sentDay: 0 }) },
  ])('rejects malformed envelopes and messages: %j', (data) => {
    const before = useMailStore.getState();
    expect(() => before.prepareHydrate(data as unknown as MailSerialized)).toThrow(TypeError);
    expect(useMailStore.getState()).toBe(before);
  });

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

  test('retrying a delivered message preserves its claim and remains loadable', () => {
    const message = { id: 'delivery', from: 'A', subject: 'gift', body: 'hello', sentDay: 0,
      attachments: [{ bells: 100 }] };
    useMailStore.getState().send(message);
    useMailStore.getState().claim(message.id);
    const received = useMailStore.getState();
    expect(received.send({ ...message, subject: 'retry' })).toBe(message.id);
    expect(useMailStore.getState()).toBe(received);
    const snapshot = received.serialize();
    useMailStore.setState({ messages: [] });
    useMailStore.getState().hydrate(snapshot);
    expect(useMailStore.getState().messages).toHaveLength(1);
    expect(useMailStore.getState().messages[0]).toMatchObject({ subject: 'gift', claimed: true });
    expect(useMailStore.getState().claim(message.id)).toBe(false);
    expect(useWalletStore.getState().bells).toBe(100);
  });

  test('partial claims preserve only outstanding rewards across retries and reloads', () => {
    const maxStack = getItemRegistry().require('apple').maxStack;
    const slots = useInventoryStore.getState().slots.map(() => ({ itemId: 'apple', count: maxStack }));
    slots[0] = { itemId: 'apple', count: maxStack - 1 };
    useInventoryStore.setState({ slots });
    const initialCount = useInventoryStore.getState().countOf('apple');
    const id = useMailStore.getState().send({
      from: 'A', subject: 'gift', body: 'b', sentDay: 0,
      attachments: [{ bells: 100 }, { itemId: 'apple', count: 2 }, { bells: 50 }],
    });

    expect(useMailStore.getState().claim(id)).toBe(false);
    expect(useWalletStore.getState().bells).toBe(100);
    expect(useInventoryStore.getState().countOf('apple')).toBe(initialCount + 1);
    expect(useMailStore.getState().messages[0]).toMatchObject({
      claimed: false, read: true,
      attachments: [{ itemId: 'apple', count: 1 }, { bells: 50 }],
    });
    expect(useMailStore.getState().claim(id)).toBe(false);
    expect(useWalletStore.getState().bells).toBe(100);

    const saved = useMailStore.getState().serialize();
    useMailStore.setState({ messages: [] });
    useMailStore.getState().hydrate(saved);
    useInventoryStore.getState().remove(0, 1);
    expect(useMailStore.getState().claim(id)).toBe(true);
    expect(useInventoryStore.getState().countOf('apple')).toBe(initialCount + 1);
    expect(useWalletStore.getState().bells).toBe(150);
    expect(useMailStore.getState().hasUnclaimedAttachments()).toBe(false);
    expect(useMailStore.getState().claim(id)).toBe(false);
    expect(useWalletStore.getState().bells).toBe(150);
  });
});
