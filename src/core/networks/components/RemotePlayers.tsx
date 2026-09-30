import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';

import { RemoteAvatar } from './RemotePlayer';
import { useEngineFrame } from '../../runtime/frame';
import { isLivePlayerMap } from '../core/LivePlayerMap';
import { createRemoteMotion, DEFAULT_REMOTE_VELOCITY_THRESHOLD, syncRemoteMotion } from '../core/remoteMotion';
import type { MultiplayerConfig, PlayerState } from '../types';

const PROXIMITY_SAMPLE_INTERVAL_FRAMES = 6;

export type RemotePlayersProps = {
  players: ReadonlyMap<string, PlayerState>;
  characterUrl?: string;
  config?: MultiplayerConfig;
  playerRef?: RefObject<RapierRigidBody | null>;
  proximityRange?: number;
  speechByPlayerId?: ReadonlyMap<string, string>;
};

type Point = { x: number; y: number; z: number };

function collectVisibleIds(players: ReadonlyMap<string, PlayerState>, range: number | undefined, origin: Point): string[] {
  const ids: string[] = [];
  if (!range || range <= 0) {
    for (const id of players.keys()) ids.push(id);
    return ids;
  }
  const rangeSq = range * range;
  for (const id of players.keys()) {
    const state = players.get(id);
    if (!state) continue;
    const dx = state.position[0] - origin.x;
    const dy = state.position[1] - origin.y;
    const dz = state.position[2] - origin.z;
    if (dx * dx + dy * dy + dz * dz <= rangeSq) ids.push(id);
  }
  return ids;
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const noSubscription = () => () => {};

type LiveRemotePlayerProps = {
  playerId: string;
  players: ReadonlyMap<string, PlayerState>;
  characterUrl: string | undefined;
  config: MultiplayerConfig | undefined;
  speechText: string | undefined;
};

const LiveRemotePlayer = React.memo(function LiveRemotePlayer({
  playerId,
  players,
  characterUrl,
  config,
  speechText,
}: LiveRemotePlayerProps) {
  const [motion] = useState(createRemoteMotion);
  const threshold = config?.tracking?.velocityThreshold ?? DEFAULT_REMOTE_VELOCITY_THRESHOLD;
  // Transforms go straight into the motion; React re-reads only for an appearance change or departure.
  const subscribe = useMemo(
    () => (isLivePlayerMap(players)
      ? (onChange: () => void) => players.subscribePlayer(playerId, () => {
        const state = players.get(playerId);
        if (!state || syncRemoteMotion(motion, state, threshold)) onChange();
      })
      : noSubscription),
    [players, playerId, motion, threshold],
  );
  const read = () => {
    const state = players.get(playerId);
    if (!state) return null;
    syncRemoteMotion(motion, state, threshold);
    return motion.appearance;
  };
  const appearance = useSyncExternalStore(subscribe, read, read);
  if (!appearance) return null;
  return (
    <RemoteAvatar
      motion={motion}
      appearance={appearance}
      characterUrl={characterUrl}
      config={config}
      speechText={speechText}
    />
  );
});

/**
 * Mounts remote avatars inside the Canvas. Transform updates never render: they land in each
 * avatar's motion and one shared frame channel moves the bodies. Proximity is sampled from the
 * frame loop so the surrounding scene never re-renders for it.
 */
export function RemotePlayers({
  players,
  characterUrl,
  config,
  playerRef,
  proximityRange,
  speechByPlayerId,
}: RemotePlayersProps) {
  const originRef = useRef<Point>({ x: 0, y: 0, z: 0 });
  const [visibleIds, setVisibleIds] = useState<string[]>(() => collectVisibleIds(players, proximityRange, originRef.current));
  const visibleRef = useRef(visibleIds);
  const frameRef = useRef(0);

  const refresh = () => {
    const next = collectVisibleIds(players, proximityRange, originRef.current);
    if (sameIds(next, visibleRef.current)) return;
    visibleRef.current = next;
    setVisibleIds(next);
  };

  useEffect(refresh, [players, proximityRange]);

  useEngineFrame('lateUpdate', () => {
    frameRef.current = (frameRef.current + 1) % PROXIMITY_SAMPLE_INTERVAL_FRAMES;
    if (frameRef.current !== 0) return;
    const body = playerRef?.current;
    if (body) {
      const position = body.translation();
      originRef.current.x = position.x;
      originRef.current.y = position.y;
      originRef.current.z = position.z;
    }
    refresh();
  }, { active: !!proximityRange && proximityRange > 0, label: 'networks:remote-proximity' });

  return (
    <>
      {visibleIds.map((playerId) => (
        <LiveRemotePlayer
          key={playerId}
          playerId={playerId}
          players={players}
          characterUrl={characterUrl}
          config={config}
          speechText={speechByPlayerId?.get(playerId)}
        />
      ))}
    </>
  );
}

export default RemotePlayers;
