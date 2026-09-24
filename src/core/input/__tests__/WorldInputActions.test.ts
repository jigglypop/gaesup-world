/** @jest-environment jsdom */
import { createMemoryInputBackend, type InputStateListener } from '../../interactions/core';
import { logger } from '../../utils/logger';
import { WorldInputActions } from '../WorldInputActions';
import { createWorldInputScope } from '../WorldInputScope';

function fixture() {
  const backend = createMemoryInputBackend(); const scope = createWorldInputScope(); let time = 0;
  const actions = new WorldInputActions(backend, scope, true, () => time);
  const press = () => { backend.updateKeyboard({ keyF: true }); backend.updateKeyboard({ keyF: false }); };
  return { backend, scope, actions, press, time: (value: number) => { time = value; }, close: () => { actions.suspend(); scope.suspend(); } };
}

test('duplicate action leases execute once; removing the newest owner restores the previous binding', () => {
  const f = fixture(); const first = jest.fn(); const last = jest.fn(); const subscribe = jest.spyOn(f.backend, 'subscribe');
  const offFirst = f.actions.register('tool', { key: 'f', execute: first });
  const offLast = f.actions.register('tool', { key: 'KeyF', execute: last });
  try {
    f.press(); expect(first).not.toHaveBeenCalled(); expect(last).toHaveBeenCalledTimes(1); expect(subscribe).toHaveBeenCalledTimes(1);
    offLast(); offLast(); f.press(); expect(first).toHaveBeenCalledTimes(1);
    offFirst(); expect(f.actions.getStats()).toMatchObject({ active: false, actions: 0, registrations: 0 });
  } finally { f.close(); }
});

test.each([true, false])('DOM producers and backend emissions share one edge when producer registers first: %s', producerFirst => {
  const f = fixture(); const run = jest.fn();
  const connectProducer = () => [f.scope.listen('keydown', () => f.backend.updateKeyboard({ keyF: true })), f.scope.listen('keyup', () => f.backend.updateKeyboard({ keyF: false }))];
  const off = producerFirst ? connectProducer() : [];
  f.actions.register('tool', { key: 'f', execute: run }); if (!producerFirst) off.push(...connectProducer());
  try {
    f.scope.dispatchKey('keydown', 'f'); f.scope.dispatchKey('keydown', 'f'); expect(run).toHaveBeenCalledTimes(1);
    f.scope.dispatchKey('keyup', 'f'); f.scope.dispatchKey('keydown', 'f'); expect(run).toHaveBeenCalledTimes(2);
  } finally { off.forEach(release => release()); f.close(); }
});

test('changing a target while a key is held does not replay; arbitrary DOM keys and physical shift keys work', () => {
  const f = fixture(); const run = jest.fn(); let key = 'e';
  f.actions.register('interaction', { key: () => key, execute: run });
  try {
    f.backend.updateKeyboard({ keyF: true }); key = 'f'; f.backend.updateKeyboard({ forward: true }); expect(run).not.toHaveBeenCalled();
    f.press(); f.press(); expect(run).toHaveBeenCalledTimes(1);
    key = 'q'; f.scope.dispatchKey('keydown', 'q'); f.scope.dispatchKey('keyup', 'q'); expect(run).toHaveBeenCalledTimes(2);
    key = 'shift'; f.scope.dispatchKey('keydown', 'ShiftLeft'); f.scope.dispatchKey('keydown', 'ShiftRight');
    f.scope.dispatchKey('keyup', 'ShiftLeft'); f.scope.dispatchKey('keydown', 'ShiftLeft'); expect(run).toHaveBeenCalledTimes(3);
    f.scope.dispatchKey('keyup', 'ShiftLeft'); f.scope.dispatchKey('keyup', 'ShiftRight'); f.scope.dispatchKey('keydown', 'ShiftLeft'); expect(run).toHaveBeenCalledTimes(4);
  } finally { f.close(); }
});

test('cooldown allows the first command at time zero and is shared by duplicate owners', () => {
  const f = fixture(); const run = jest.fn();
  const off = f.actions.register('tool', { key: 'f', cooldownMs: 350, execute: run });
  const newer = f.actions.register('tool', { key: 'f', cooldownMs: 350, execute: run });
  try {
    f.press(); expect(run).toHaveBeenCalledTimes(1); newer(); f.time(100); f.press(); expect(run).toHaveBeenCalledTimes(1);
    f.time(350); f.press(); expect(run).toHaveBeenCalledTimes(2); off();
    f.actions.register('retry', { key: 'f', cooldownMs: 350, execute: () => { run(); return false; } }); f.press(); f.press(); expect(run).toHaveBeenCalledTimes(4);
  } finally { f.close(); }
});

test('blur and suspension require release before another action; stale callbacks cannot execute', () => {
  const f = fixture(); const run = jest.fn(); const subscribe = f.backend.subscribe!; let late: InputStateListener = () => {};
  f.backend.subscribe = callback => { late = callback; return subscribe(callback); };
  f.actions.register('tool', { key: 'f', execute: run });
  try {
    f.backend.updateKeyboard({ keyF: true }); f.scope.releaseFocus(); f.backend.updateKeyboard({ keyE: true }); expect(run).toHaveBeenCalledTimes(1);
    f.actions.suspend(); const previous = late; f.backend.updateKeyboard({ keyF: false }); f.press(); expect(run).toHaveBeenCalledTimes(1);
    f.backend.updateKeyboard({ keyF: true }); f.actions.resume(); previous({ keyboard: f.backend.getKeyboard(), mouse: f.backend.getMouse() });
    expect(run).toHaveBeenCalledTimes(1); f.press(); f.press(); expect(run).toHaveBeenCalledTimes(2);
  } finally { f.close(); }
});

test('editable, composing, repeated, modified and consumed DOM events do not execute', () => {
  const f = fixture(); const run = jest.fn(); f.actions.register('tool', { key: 'f', execute: run });
  const edit = document.createElement('input'); document.body.append(edit);
  const send = (extra: KeyboardEventInit = {}, target: EventTarget = window) => target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', key: 'f', bubbles: true, cancelable: true, ...extra }));
  const consume = f.scope.listen('keydown', event => event.preventDefault(), true);
  try {
    send(); consume(); send({}, edit); send({ isComposing: true }); send({ repeat: true }); send({ ctrlKey: true }); send({ metaKey: true }); send({ altKey: true }); expect(run).not.toHaveBeenCalled();
    send(); expect(run).toHaveBeenCalledTimes(1);
  } finally { consume(); edit.remove(); f.close(); }
});

test('reentrant stop during subscription releases the just-created subscription and adds no DOM listeners', () => {
  const f = fixture(); const off = jest.fn();
  f.backend.subscribe = () => { f.actions.suspend(); return off; };
  const listen = jest.spyOn(f.scope, 'listen');
  try { f.actions.register('tool', { key: 'f', execute: jest.fn() }); expect(off).toHaveBeenCalledTimes(1); expect(listen).not.toHaveBeenCalled(); expect(f.actions.getStats().active).toBe(false); }
  finally { f.close(); }
});

test('throwing key resolvers and handlers do not prevent other actions; reentrant self execution is blocked', () => {
  const f = fixture(); const log = jest.spyOn(logger, 'error').mockImplementation(() => {}); const run = jest.fn();
  f.actions.register('bad-key', { key: () => { throw new Error('key'); }, execute: run });
  f.actions.register('bad-handler', { key: 'f', execute: () => { throw new Error('handler'); } });
  f.actions.register('good', { key: 'f', execute: () => { run(); if (run.mock.calls.length === 1) { f.backend.updateKeyboard({ keyF: false }); f.press(); } } });
  try { f.press(); expect(run).toHaveBeenCalledTimes(1); expect(log).toHaveBeenCalled(); expect(f.actions.getStats().suppressed).toBe(1); }
  finally { f.close(); log.mockRestore(); }
});

test('a failed initial backend read can recover on resume', () => {
  const f = fixture(); const get = f.backend.getKeyboard; const run = jest.fn();
  f.backend.getKeyboard = () => { throw new Error('read'); };
  try {
    expect(() => f.actions.register('tool', { key: 'f', execute: run })).toThrow('read'); expect(f.actions.getStats()).toMatchObject({ active: false, actions: 0 });
    f.backend.getKeyboard = get; f.actions.register('tool', { key: 'f', execute: run }); f.press(); expect(run).toHaveBeenCalledTimes(1);
  } finally { f.close(); }
});
