import { DialogRunner } from '../core/DialogRunner';
import type { DialogContext, DialogTree } from '../types';

const TREE: DialogTree = {
  id: 'test',
  startId: 'a',
  nodes: {
    a: { id: 'a', text: 'hi', choices: [
      { text: 'gift', next: 'b', effects: [{ type: 'setFlag', key: 'gifted', value: true }, { type: 'custom', key: 'gift', payload: { count: 2 } }] },
      { text: 'greet', next: 'c', effects: [{ type: 'setFlag', key: 'greeted', value: true }] },
      { text: 'returning', next: 'd', condition: { type: 'flagEquals', key: 'greeted', value: true } },
      { text: 'gated', next: 'd', condition: { type: 'custom', key: 'hasBadge' } },
    ] },
    b: { id: 'b', text: 'thanks', next: null },
    c: { id: 'c', text: 'hello', next: null },
    d: { id: 'd', text: 'rare', next: null },
  },
};

const texts = (runner: DialogRunner) => runner.visibleChoices().map((choice) => choice.text);

describe('DialogRunner', () => {
  test.each(['advance', 'choose'] as const)('%s rejects effect callback reentry and keeps the intended destination', (action) => {
    const reward = { type: 'custom' as const, key: 'reward' };
    const tree: DialogTree = { id: 'reentry', startId: 'a', nodes: {
      a: { id: 'a', text: '', ...(action === 'advance'
        ? { effects: [reward], next: 'b' }
        : { choices: [{ text: 'reward', effects: [reward], next: 'b' }] }) },
      b: { id: 'b', text: 'done', next: null },
    } };
    let payouts = 0;
    const runner: DialogRunner = new DialogRunner({ tree, onCustomEffect: () => {
      payouts++;
      if (payouts > 1) throw new Error('duplicate payout');
      runner.advance();
      runner.choose(0);
    } });
    if (action === 'advance') runner.advance();
    else runner.choose(0);
    expect(payouts).toBe(1);
    expect(runner.current?.id).toBe('b');
    expect(runner.advance()).toBeNull();
  });

  test('advance cannot repeatedly execute effects on a node awaiting a choice', () => {
    const effect = jest.fn();
    const runner = new DialogRunner({ onCustomEffect: effect, tree: { id: 'choice', startId: 'a', nodes: {
      a: { id: 'a', text: '', effects: [{ type: 'custom', key: 'reward' }], choices: [{ text: 'leave', next: null }] },
    } } });
    runner.advance();
    runner.advance();
    expect(effect).not.toHaveBeenCalled();
    expect(runner.current?.id).toBe('a');
    expect(runner.choose(0)).toBeNull();
  });

  test('a custom effect reaches onCustomEffect with the live dialog context, then the dialog ends', () => {
    const context: DialogContext = { npcId: 'mira' };
    // Returns what the handler saw when called: the flag set by the preceding effect of the same choice.
    const onCustomEffect = jest.fn((_effect: unknown, current: DialogContext) => current.flags?.['gifted']);
    const r = new DialogRunner({ tree: TREE, context, onCustomEffect });
    expect(r.current?.id).toBe('a');
    r.choose(0);
    expect(onCustomEffect).toHaveBeenCalledTimes(1);
    expect(onCustomEffect.mock.calls[0]?.[0]).toEqual({ type: 'custom', key: 'gift', payload: { count: 2 } });
    expect(onCustomEffect.mock.calls[0]?.[1]).toBe(context);
    expect(onCustomEffect).toHaveReturnedWith(true);
    expect(r.current?.id).toBe('b');
    r.advance();
    expect(r.isFinished()).toBe(true);
  });

  test('setFlag writes the dialog context flags and reports them through onFlag', () => {
    const onFlag = jest.fn();
    const r = new DialogRunner({ tree: TREE, onFlag });
    r.choose(1);
    expect(r.context.flags).toEqual({ greeted: true });
    expect(onFlag).toHaveBeenCalledTimes(1);
    expect(onFlag).toHaveBeenCalledWith('greeted', true);
    expect(r.current?.id).toBe('c');
  });

  test('조건을 만족하지 않으면 선택지를 숨긴다', () => {
    // Without evaluateCondition a custom condition hides its choice.
    expect(texts(new DialogRunner({ tree: TREE }))).toEqual(['gift', 'greet']);
    expect(texts(new DialogRunner({ tree: TREE, evaluateCondition: () => false }))).toEqual(['gift', 'greet']);
    const evaluateCondition = jest.fn(() => true);
    const context: DialogContext = { npcId: 'mira', flags: { greeted: true } };
    const r = new DialogRunner({ tree: TREE, context, evaluateCondition });
    expect(texts(r)).toEqual(['gift', 'greet', 'returning', 'gated']);
    // Built-in flag conditions never reach the game's evaluator.
    expect(evaluateCondition).toHaveBeenCalledTimes(1);
    expect(evaluateCondition).toHaveBeenCalledWith({ type: 'custom', key: 'hasBadge' }, context);
  });
});
