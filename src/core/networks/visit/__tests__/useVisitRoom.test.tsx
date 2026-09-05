import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';

import { createLocalVisitChannel, createWebSocketVisitChannel } from '../channel';
import { serializeVisit } from '../serializer';
import type { VisitChannel, VisitChannelEvent } from '../types';
import { useVisitRoom } from '../useVisitRoom';

describe('visit room session lifetime', () => {
  it.each([false, true])('preserves local state for a future snapshot with autoApply=%s', (autoApply) => {
    const channel = createLocalVisitChannel();
    let local = 'local';
    const hydrate = jest.fn((value: unknown) => {
      if (typeof value === 'string') local = value;
    });
    const bindings = () => [{ key: 'building', serialize: () => local, hydrate }];
    const future = serializeVisit(
      () => [{ key: 'building', serialize: () => 'remote', hydrate }],
      { hostId: 'remote', version: 2 },
    );
    const { result, unmount } = renderHook(() => useVisitRoom({
      channel, hostId: 'local', bindings, autoApply,
    }));
    try {
      act(() => { channel.publish(future); });
      expect(result.current.remoteSnapshot).toBe(future);
      expect(result.current.acceptRemote()).toBe(false);
      expect(hydrate).not.toHaveBeenCalled();
      expect(local).toBe('local');

      act(() => { channel.publish({ ...future, version: 1 }); });
      if (!autoApply) expect(result.current.acceptRemote()).toBe(true);
      expect(hydrate).toHaveBeenCalledTimes(1);
      expect(local).toBe('remote');
    } finally {
      unmount();
      channel.close();
    }
  });

  it('preserves the last publication after a transport failure and permits retry', () => {
    const send = jest.fn();
    const channel = createWebSocketVisitChannel({ send, onMessage: () => () => {} });
    let value = 'first';
    const bindings = () => [{ key: 'building', serialize: () => value, hydrate: jest.fn() }];
    const { result, unmount } = renderHook(() => useVisitRoom({ channel, hostId: 'host', bindings }));
    act(() => { result.current.publishNow(); });
    const previous = result.current.lastPublished;
    const failure = new Error('Socket closed');
    send.mockImplementationOnce(() => { throw failure; });
    value = 'second';
    expect(() => result.current.publishNow()).toThrow(failure);
    expect(result.current.lastPublished).toBe(previous);
    act(() => { result.current.publishNow(); });
    expect(result.current.lastPublished?.domains.building).toBe('second');
    expect(send).toHaveBeenCalledTimes(3);
    unmount();
    channel.close();
  });

  it('keeps the last published world when capture fails and supports retry', () => {
    const channel = createLocalVisitChannel();
    const publish = jest.spyOn(channel, 'publish');
    const failure = new Error('Capture failed');
    let failCapture = false;
    let value = 'first';
    const bindings = () => [{
      key: 'building',
      serialize: () => {
        if (failCapture) throw failure;
        return value;
      },
      hydrate: jest.fn(),
    }];
    const { result, unmount } = renderHook(() => useVisitRoom({ channel, hostId: 'host', bindings }));
    act(() => { result.current.publishNow(); });
    const previous = result.current.lastPublished;
    failCapture = true;
    expect(() => result.current.publishNow()).toThrow(failure);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(result.current.lastPublished).toBe(previous);
    const replay = jest.fn();
    const unsubscribe = channel.subscribe(replay);
    expect(replay).toHaveBeenCalledWith({ type: 'snapshot', snapshot: previous });
    failCapture = false;
    value = 'recovered';
    act(() => { result.current.publishNow(); });
    expect(publish).toHaveBeenCalledTimes(2);
    expect(result.current.lastPublished?.domains.building).toBe('recovered');
    unsubscribe();
    unmount();
    channel.close();
  });

  it('ignores queued events from a disconnected channel with autoApply enabled', () => {
    const queued: Array<(event: VisitChannelEvent) => void> = [];
    const first: VisitChannel = {
      publish: jest.fn(),
      leave: jest.fn(),
      close: jest.fn(),
      subscribe: (listener) => {
        queued.push(listener);
        return jest.fn();
      },
    };
    const second = createLocalVisitChannel();
    const hydrate = jest.fn();
    const bindings = () => [{ key: 'building', serialize: () => 'current', hydrate }];
    const remote = serializeVisit(bindings, { hostId: 'remote-host' });
    const { result, rerender, unmount } = renderHook(
      ({ channel }) => useVisitRoom({ channel, hostId: 'local', bindings, autoApply: true }),
      { initialProps: { channel: first }, wrapper: StrictMode },
    );
    rerender({ channel: second });
    act(() => {
      second.publish(remote);
    });
    expect(hydrate).toHaveBeenCalledTimes(1);
    hydrate.mockClear();
    act(() => {
      for (const listener of queued) {
        listener({ type: 'snapshot', snapshot: remote });
        listener({ type: 'leave', hostId: remote.hostId });
      }
    });
    expect(hydrate).not.toHaveBeenCalled();
    expect(result.current.remoteSnapshot).toBe(remote);
    unmount();
    second.close();
  });

  it.each(['channel', 'hostId'] as const)(
    'invalidates buffered snapshots and old accept callbacks when %s changes',
    (changed) => {
      const first = createLocalVisitChannel();
      const second = createLocalVisitChannel();
      const hydrate = jest.fn();
      const bindings = () => [{ key: 'building', serialize: () => 'local', hydrate }];
      const remote = serializeVisit(
        () => [{ key: 'building', serialize: () => 'remote', hydrate }],
        { hostId: 'remote-host' },
      );
      const initialProps = { channel: first, hostId: 'local-host' };
      const { result, rerender, unmount } = renderHook(
        (props) => useVisitRoom({ ...props, bindings }),
        { initialProps, wrapper: StrictMode },
      );

      act(() => {
        first.publish(remote);
        result.current.publishNow();
      });
      expect(result.current.remoteSnapshot).toBe(remote);
      expect(result.current.lastPublished).not.toBeNull();
      act(() => {
        first.leave('local-host');
      });
      const oldAccept = result.current.acceptRemote;
      rerender({
        channel: changed === 'channel' ? second : first,
        hostId: changed === 'hostId' ? 'other-local-host' : 'local-host',
      });

      expect(oldAccept()).toBe(false);
      expect(hydrate).not.toHaveBeenCalled();
      expect(result.current.remoteSnapshot).toBeNull();
      expect(result.current.acceptRemote()).toBe(false);
      expect(result.current.lastPublished).toBeNull();
      act(() => {
        (changed === 'channel' ? second : first).publish(remote);
      });
      expect(result.current.acceptRemote()).toBe(true);
      expect(hydrate).toHaveBeenCalledWith('remote');

      const acceptAfterUnmount = result.current.acceptRemote;
      unmount();
      hydrate.mockClear();
      expect(acceptAfterUnmount()).toBe(false);
      expect(hydrate).not.toHaveBeenCalled();
      first.close();
      second.close();
    },
  );
});
