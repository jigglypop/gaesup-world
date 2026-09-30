import { GameplayEventEngine } from '../engine';
import { createDefaultGameplayEventRegistry } from '../registry';
import { createNpcTalkEventBlueprint } from '../templates';

describe('createNpcTalkEventBlueprint', () => {
  test('first talk opens the NPC dialog once and records it as a flag', async () => {
    const showDialog = jest.fn();
    const registry = createDefaultGameplayEventRegistry({ showDialog, notify: jest.fn() });
    const engine = new GameplayEventEngine({ registry });
    engine.setBlueprints([createNpcTalkEventBlueprint({ npcId: 'luru', dialogTreeId: 'luru.hello' })]);

    const trigger = { type: 'interaction' as const, targetId: 'npc:luru', action: 'talk' };
    expect((await engine.dispatch(trigger))[0]?.actionCount).toBe(2);
    expect(showDialog).toHaveBeenCalledWith('luru.hello', 'luru');
    expect(engine.state.flags['talked:luru']).toBe(true);
    expect((await engine.dispatch(trigger))[0]?.skipped).toBe('already-executed');
    expect(showDialog).toHaveBeenCalledTimes(1);
  });

  test('blank ids fall back to a usable NPC and dialog', () => {
    const blueprint = createNpcTalkEventBlueprint({ npcId: '  ', dialogTreeId: '' });
    expect(blueprint.trigger).toEqual({ type: 'interaction', targetId: 'npc:npc', action: 'talk' });
    expect(blueprint.actions[0]).toEqual({ type: 'showDialog', dialogTreeId: 'npc.greeting', npcId: 'npc' });
  });
});
