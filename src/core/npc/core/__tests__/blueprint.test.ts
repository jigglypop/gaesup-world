import {
  applyAgentBehaviorBlueprint,
  applyNPCBehaviorBlueprint,
  compileNPCBrainBlueprint,
  createAgentBehaviorBlueprintFromNPCBehaviorBlueprint,
  createNPCBehaviorBlueprintFromAgentBehaviorBlueprint,
  createNPCBehaviorBlueprintFromInstance,
} from '../blueprint';
import type { NPCInstance } from '../../types';
import { useFriendshipStore } from '../../../relations/stores/friendshipStore';
import { useQuestStore } from '../../../quests/stores/questStore';

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
  beforeEach(() => {
    useQuestStore.setState({ state: {} });
    useFriendshipStore.setState({ entries: {} });
  });

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

  it('supports questStatus condition in npc brain blueprint', () => {
    useQuestStore.setState({
      state: {
        welcome: {
          questId: 'welcome',
          status: 'active',
          progress: {},
          startedAt: Date.now(),
        },
      },
    });
    const observation = {
      instanceId: 'npc-guide',
      templateId: 'villager',
      timestamp: Date.now(),
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      currentAnimation: 'idle',
      navigationState: 'idle' as const,
      behaviorMode: 'idle' as const,
      brainMode: 'scripted' as const,
      perceptionEnabled: false,
      perceived: [],
    };
    const actions = compileNPCBrainBlueprint({
      id: 'quest-check',
      name: 'Quest Check',
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'cond', type: 'condition', condition: { type: 'questStatus', questId: 'welcome', status: 'active' } },
        { id: 'act', type: 'action', action: { type: 'idle' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'cond', branch: 'next' },
        { id: 'e2', source: 'cond', target: 'act', branch: 'true' },
      ],
    }, observation);

    expect(actions).toEqual([{ type: 'idle' }]);
  });

  it('supports friendshipAtLeast condition in npc brain blueprint', () => {
    useFriendshipStore.setState({
      entries: {
        'npc-guide': {
          npcId: 'npc-guide',
          score: 180,
          todayGained: 0,
          lastGiftDay: -1,
          giftHistory: {},
        },
      },
    });
    const observation = {
      instanceId: 'npc-guide',
      templateId: 'villager',
      timestamp: Date.now(),
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      currentAnimation: 'idle',
      navigationState: 'idle' as const,
      behaviorMode: 'idle' as const,
      brainMode: 'scripted' as const,
      perceptionEnabled: false,
      perceived: [],
    };
    const actions = compileNPCBrainBlueprint({
      id: 'friendship-check',
      name: 'Friendship Check',
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'cond', type: 'condition', condition: { type: 'friendshipAtLeast', score: 150 } },
        { id: 'act', type: 'action', action: { type: 'idle' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'cond', branch: 'next' },
        { id: 'e2', source: 'cond', target: 'act', branch: 'true' },
      ],
    }, observation);

    expect(actions).toEqual([{ type: 'idle' }]);
  });
});
