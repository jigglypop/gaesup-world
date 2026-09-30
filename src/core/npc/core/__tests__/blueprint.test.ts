import { createNPCStore } from '../../stores/npcStore';
import type { NPCBrainBlueprint, NPCInstance, NPCObservation } from '../../types';
import {
  applyAgentBehaviorBlueprint,
  applyNPCBehaviorBlueprint,
  compileNPCBrainBlueprint,
  createAgentBehaviorBlueprintFromNPCBehaviorBlueprint,
  createNPCBehaviorBlueprintFromAgentBehaviorBlueprint,
  createNPCBehaviorBlueprintFromInstance,
} from '../blueprint';

const createInstance = (id: string): NPCInstance => ({
  id,
  templateId: 'villager',
  name: id,
  position: [1, 0, 2],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  behavior: {
    mode: 'patrol',
    speed: 2.4,
    waypoints: [[1, 0, 2], [3, 0, 4]],
    loop: true,
    moveAnimation: 'walk',
  },
  brain: {
    mode: 'scripted',
    blueprintId: 'npc-blueprint-wander',
    memory: { metPlayer: true },
  },
  perception: {
    enabled: true,
    sightRadius: 8,
    hearingRadius: 4,
  },
});

describe('NPC behavior blueprint helpers', () => {
  it('extracts reusable behavior without instance placement state', () => {
    const blueprint = createNPCBehaviorBlueprintFromInstance(createInstance('mei'), {
      id: 'friendly-villager',
      role: 'villager',
    });

    expect(blueprint.id).toBe('friendly-villager');
    expect(blueprint.role).toBe('villager');
    expect(blueprint.behavior.mode).toBe('patrol');
    expect(blueprint.brain?.blueprintId).toBe('npc-blueprint-wander');
    expect('position' in blueprint).toBe(false);
  });

  it('applies behavior while preserving target instance transform', () => {
    const source = createInstance('source');
    const target = {
      ...createInstance('target'),
      position: [20, 0, 30] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
    };
    const blueprint = createNPCBehaviorBlueprintFromInstance(source);

    const next = applyNPCBehaviorBlueprint(target, blueprint);

    expect(next.position).toEqual([20, 0, 30]);
    expect(next.rotation).toEqual([0, Math.PI, 0]);
    expect(next.behavior?.waypoints).toEqual([[1, 0, 2], [3, 0, 4]]);
    expect(next.brain?.memory).toEqual({ metPlayer: true });
  });

  it('converts NPC behavior blueprint to agent blueprint and back', () => {
    const npcBlueprint = createNPCBehaviorBlueprintFromInstance(createInstance('guide'), {
      id: 'guide-npc',
      role: 'guide',
    });
    const agentBlueprint = createAgentBehaviorBlueprintFromNPCBehaviorBlueprint(npcBlueprint, {
      id: 'guide-agent',
      ownerType: 'vendor',
    });
    const restored = createNPCBehaviorBlueprintFromAgentBehaviorBlueprint(agentBlueprint);

    expect(agentBlueprint.ownerType).toBe('vendor');
    expect(restored.id).toBe('guide-agent');
    expect(restored.role).toBe('guide');
    expect(restored.behavior.mode).toBe('patrol');
    expect(restored.brain?.blueprintId).toBe('npc-blueprint-wander');
  });

  it('applies agent behavior blueprint to npc instance', () => {
    const source = createInstance('source');
    const target = {
      ...createInstance('target'),
      position: [30, 0, 40] as [number, number, number],
    };
    const npcBlueprint = createNPCBehaviorBlueprintFromInstance(source);
    const agentBlueprint = createAgentBehaviorBlueprintFromNPCBehaviorBlueprint(npcBlueprint, {
      ownerType: 'custom',
    });

    const next = applyAgentBehaviorBlueprint(target, agentBlueprint);

    expect(next.position).toEqual([30, 0, 40]);
    expect(next.behavior?.waypoints).toEqual([[1, 0, 2], [3, 0, 4]]);
    expect(next.brain?.memory).toEqual({ metPlayer: true });
  });
});

describe('entered targets', () => {
  const observation = (entered: string[]): NPCObservation => ({
    instanceId: 'villager', templateId: 't', timestamp: 1, position: [0, 0, 0], rotation: [0, 0, 0], currentAnimation: 'idle',
    navigationState: 'none', behaviorMode: 'idle', brainMode: 'scripted', perceptionEnabled: true, entered,
    perceived: [
      { instanceId: 'neighbor', name: 'n', position: [1, 0, 0], distance: 1, brainMode: 'scripted' },
      { instanceId: 'player', name: 'p', position: [0, 0, 3], distance: 3, brainMode: 'none', actor: true },
    ],
  });
  const greet: NPCBrainBlueprint = {
    id: 'greet', name: 'greet',
    nodes: [
      { id: 'start', type: 'start' },
      { id: 'new', type: 'condition', condition: { type: 'perceivedEntered', actorsOnly: true } },
      { id: 'face', type: 'action', action: { type: 'lookAtTarget', target: { type: 'entered', actorsOnly: true } } },
      { id: 'hi', type: 'action', action: { type: 'speak', text: '안녕!' } },
    ],
    edges: [
      { id: 'a', source: 'start', target: 'new' },
      { id: 'b', source: 'new', target: 'face', branch: 'true' },
      { id: 'c', source: 'face', target: 'hi' },
    ],
  };

  it('greets an actor that just came into sight, facing it rather than a nearer NPC', () => {
    expect(compileNPCBrainBlueprint(greet, observation(['neighbor', 'player']))).toEqual([
      { type: 'lookAt', target: [0, 0, 3] },
      { type: 'speak', text: '안녕!' },
    ]);
  });

  it('ignores an NPC that came into sight and an actor that was already seen', () => {
    expect(compileNPCBrainBlueprint(greet, observation(['neighbor']))).toEqual([]);
    expect(compileNPCBrainBlueprint(greet, observation([]))).toEqual([]);
  });

  it('the default wander blueprint walks whenever the NPC is idle', () => {
    const store = createNPCStore(); store.getState().initializeDefaults();
    const wander = store.getState().brainBlueprints.get('npc-blueprint-wander')!;
    expect(compileNPCBrainBlueprint(wander, observation([]))).toEqual([expect.objectContaining({ type: 'moveTo' })]);
  });
});
