import { useRef } from 'react';

import { useThree, type RootState } from '@react-three/fiber';

import { MILLISECONDS_IN_SECOND } from '../../../boilerplate/types';
import { logger } from '../../../utils/logger';
import type { FrameScheduler } from '../FrameScheduler';
import { retainImplicitFrameHost, useCanvasFrameScheduler, useFrameRegistrationEffect, useRootStore } from './canvasScheduler';
import type { SharedFrameCallback, SharedFrameChannel } from './types';

type SharedFrameEntry = {
  callback: { current: SharedFrameCallback };
};

type SharedFrameGroup = {
  channel: SharedFrameChannel;
  entries: SharedFrameEntry[];
  getThree: () => RootState;
  unsubscribe: (() => void) | null;
  generation: number;
};

const channelGroups = new WeakMap<FrameScheduler, Map<string, SharedFrameGroup>>();

function channelKey(channel: SharedFrameChannel): string {
  return `${channel.phase}|${channel.label}|${channel.order ?? 0}|${channel.throttleMs ?? 0}`;
}

function runGroup(group: SharedFrameGroup, delta: number, elapsedMs: number): void {
  const three = group.getThree();
  const elapsedSeconds = elapsedMs / MILLISECONDS_IN_SECOND;
  const entries = group.entries;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    try {
      entry.callback.current(delta, elapsedSeconds, three);
    } catch (error) {
      entries.splice(i--, 1);
      logger.error(
        `[FrameScheduler Error]: 공유 프레임 콜백 실패로 제외 ${group.channel.label}`,
        error instanceof Error ? error : String(error),
      );
    }
  }
}

function joinGroup(
  scheduler: FrameScheduler,
  key: string,
  channel: SharedFrameChannel,
  getThree: () => RootState,
  entry: SharedFrameEntry,
): () => void {
  let groups = channelGroups.get(scheduler);
  if (!groups) {
    groups = new Map();
    channelGroups.set(scheduler, groups);
  }
  let group = groups.get(key);
  if (!group) {
    group = { channel, entries: [], getThree, unsubscribe: null, generation: scheduler.getGeneration() };
    groups.set(key, group);
  }
  const joined = group;
  if (joined.generation !== scheduler.getGeneration()) {
    joined.unsubscribe = null;
    joined.generation = scheduler.getGeneration();
  }
  joined.entries.push(entry);
  joined.unsubscribe ??= scheduler.add(channel.phase, (delta, elapsedMs) => runGroup(joined, delta, elapsedMs), {
    label: channel.label,
    ...(channel.order !== undefined ? { order: channel.order } : {}),
    ...(channel.throttleMs !== undefined ? { throttleMs: channel.throttleMs } : {}),
  });
  return () => {
    const index = joined.entries.indexOf(entry);
    if (index >= 0) joined.entries.splice(index, 1);
    if (joined.entries.length > 0) return;
    joined.unsubscribe?.();
    joined.unsubscribe = null;
    if (groups.get(key) === joined) groups.delete(key);
  };
}

export function useSharedFrame(channel: SharedFrameChannel, callback: SharedFrameCallback, active = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const channelRef = useRef(channel);
  channelRef.current = channel;
  const scheduler = useCanvasFrameScheduler();
  const canvasStore = useRootStore();
  const getThree = useThree((state) => state.get);
  const key = channelKey(channel);

  useFrameRegistrationEffect(() => {
    if (!active) return undefined;
    const leave = joinGroup(scheduler, key, channelRef.current, getThree, { callback: callbackRef });
    const releaseHost = retainImplicitFrameHost(scheduler, canvasStore);
    return () => {
      releaseHost();
      leave();
    };
  }, [active, canvasStore, getThree, key, scheduler]);
}

export function getSharedFrameEntryCount(scheduler: FrameScheduler, channel: SharedFrameChannel): number {
  return channelGroups.get(scheduler)?.get(channelKey(channel))?.entries.length ?? 0;
}
