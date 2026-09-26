import { useEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';

import { DEFAULT_INTERACTION_KEY, DEFAULT_INTERACTION_RANGE } from '../../../interactions/components/Interactable';
import { useInteractablesStoreApi } from '../../../interactions/stores/interactablesStore';
import { useEngineFrame } from '../../../runtime/frame';
import { SpeechBalloon } from '../../../ui/components/SpeechBalloon';
import { useNPCSimulation } from '../../hooks/useNPCSimulation';
import type { NPCInstance } from '../../types';

type NPCPresenceProps = {
  instance: Pick<NPCInstance, 'id' | 'name' | 'position' | 'events'>;
  /** Height of the NPC's head in the parent's space; the balloon floats just above it. */
  height: number;
  onInteract: () => void;
};

/**
 * What an NPC shows beyond its model: the line it is speaking, and — when it has an `onInteract` event — its place in
 * the world's interaction targets, so the player's interaction key runs that event (and the rule engine's
 * `interaction` trigger with the NPC id).
 */
export function NPCPresence({ instance, height, onInteract }: NPCPresenceProps) {
  const simulation = useNPCSimulation();
  const interactables = useInteractablesStoreApi();
  const [speech, setSpeech] = useState<string>();
  const speechRevision = useRef(-1);
  const interact = useRef(onInteract);
  interact.current = onInteract;
  const interactive = instance.events?.some((event) => event.type === 'onInteract') ?? false;
  const [x, y, z] = instance.position;
  const balloonPosition = useMemo(() => new THREE.Vector3(0, height + 0.4, 0), [height]);

  // Speech changes rarely; a revision check per frame keeps idle NPCs from re-rendering.
  useEngineFrame('effects', () => {
    if (simulation.speechRevision === speechRevision.current) return;
    speechRevision.current = simulation.speechRevision;
    setSpeech(simulation.getSpeech(instance.id)?.text);
  }, { label: 'npc:speech' });

  useEffect(() => {
    if (!interactive) return undefined;
    const position = new THREE.Vector3(x, y, z);
    return interactables.getState().register({
      id: instance.id,
      kind: 'npc',
      label: instance.name,
      key: DEFAULT_INTERACTION_KEY,
      range: DEFAULT_INTERACTION_RANGE,
      position,
      getPosition: () => {
        const pose = simulation.getPose(instance.id);
        return pose ? position.fromArray(pose.position) : position;
      },
      onActivate: () => interact.current(),
    });
  }, [interactables, interactive, instance.id, instance.name, simulation, x, y, z]);

  return speech ? <SpeechBalloon text={speech} position={balloonPosition} /> : null;
}
