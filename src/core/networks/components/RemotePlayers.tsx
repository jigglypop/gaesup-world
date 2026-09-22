import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';

import { RemotePlayer } from './RemotePlayer';
import { isLivePlayerMap } from '../core/LivePlayerMap';
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
  const subscribe = useMemo(
    () => (isLivePlayerMap(players) ? (listener: () => void) => players.subscribePlayer(playerId, listener) : noSubscription),
    [players, playerId],
  );
  const read = () => players.get(playerId);
  const state = useSyncExternalStore(subscribe, read, read);
  if (!state) return null;
  return (
    <RemotePlayer
      playerId={playerId}
      state={state}
      {...(characterUrl !== undefined ? { characterUrl } : {})}
      {...(config !== undefined ? { config } : {})}
      {...(speechText ? { speechText } : {})}
    />
  );
});

/**
 * Mounts remote avatars inside the Canvas. Transform updates re-render only the moving avatar,
 * and proximity is sampled from the frame loop so the surrounding scene never re-renders for it.
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

  useFrame(() => {
    if (!proximityRange || proximityRange <= 0) return;
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
  });

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
