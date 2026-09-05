import { createWebSocketVisitChannel } from '../channel';
import { serializeVisit } from '../serializer';

function createHarness() {
  let receive = (_raw: string): void => {};
  const send = jest.fn();
  const unsubscribe = jest.fn();
  const channel = createWebSocketVisitChannel({
    send,
    onMessage: (listener) => { receive = listener; return unsubscribe; },
  });
  const listener = jest.fn();
  channel.subscribe(listener);
  return { channel, send, unsubscribe, listener, receive: (raw: string) => receive(raw) };
}

describe('visit WebSocket boundary', () => {
  const snapshot = serializeVisit(
    () => [{ key: 'building', serialize: () => ({ tiles: [] }), hydrate: () => {} }],
    { hostId: 'host', savedAt: 0, version: 2 },
  );

  it('round-trips snapshots and leave events and releases the transport subscription', () => {
    const { channel, send, receive, listener, unsubscribe } = createHarness();
    channel.publish(snapshot);
    receive(String(send.mock.calls[0]?.[0]));
    expect(listener).toHaveBeenLastCalledWith({ type: 'snapshot', snapshot });
    channel.leave('host');
    receive(String(send.mock.calls[1]?.[0]));
    expect(listener).toHaveBeenLastCalledWith({ type: 'leave', hostId: 'host' });
    channel.close();
    channel.close();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('propagates snapshot and leave send failures', () => {
    const { channel, send } = createHarness();
    const failure = new Error('Socket closed');
    send.mockImplementation(() => { throw failure; });
    expect(() => channel.publish(snapshot)).toThrow(failure);
    expect(() => channel.leave('host')).toThrow(failure);
    channel.close();
  });

  it.each([
    null, [], {},
    { ...snapshot, kind: 'player' },
    { ...snapshot, hostId: '' },
    { ...snapshot, hostId: ' ' },
    { ...snapshot, hostId: 12 },
    { ...snapshot, hostName: {} },
    { ...snapshot, worldId: null },
    { ...snapshot, version: 0 },
    { ...snapshot, version: 1.5 },
    { ...snapshot, savedAt: -1 },
    { ...snapshot, capturedAt: '0' },
    { ...snapshot, domains: null },
    { ...snapshot, domains: [] },
    { ...snapshot, domains: 'building' },
  ])('rejects malformed snapshot %j before notifying consumers', (invalid) => {
    const { channel, receive, listener } = createHarness();
    receive(JSON.stringify({ type: 'VisitSnapshot', v: 1, snapshot: invalid }));
    expect(listener).not.toHaveBeenCalled();
    receive(JSON.stringify({ type: 'VisitSnapshot', v: 1, snapshot }));
    expect(listener).toHaveBeenCalledTimes(1);
    channel.close();
  });

  it.each([
    '{', 'null', '[]',
    JSON.stringify({ type: 'VisitSnapshot', v: 2, snapshot }),
    JSON.stringify({ type: 'VisitSnapshot', v: 1 }),
    JSON.stringify({ type: 'VisitLeave', v: 1 }),
    JSON.stringify({ type: 'VisitLeave', v: 1, hostId: '' }),
    JSON.stringify({ type: 'VisitLeave', v: 1, hostId: 1 }),
  ])('drops invalid wire message %s', (raw) => {
    const { channel, receive, listener } = createHarness();
    receive(raw);
    expect(listener).not.toHaveBeenCalled();
    channel.close();
  });
});
