import { createWorldInputScope } from '../WorldInputScope';

const key = (target: EventTarget, code = 'KeyW', type = 'keydown') => target.dispatchEvent(new KeyboardEvent(type, { code, key: code.slice(-1).toLowerCase(), bubbles: true, cancelable: true }));

test('throwing consumers are reported and do not skip later handlers or lifecycle cleanup', () => {
  const previous = globalThis.reportError; const report = jest.fn(); globalThis.reportError = report;
  const scope = createWorldInputScope(); const later = jest.fn(); const released = jest.fn();
  const off = [scope.listen('keydown', () => { throw new Error('key failed'); }), scope.listen('keydown', later), scope.onBlur(() => { throw new Error('release failed'); }), scope.onBlur(released)];
  try {
    key(window); expect(later).toHaveBeenCalledTimes(1);
    expect(() => scope.suspend()).not.toThrow(); expect(released).toHaveBeenCalledTimes(1); expect(report).toHaveBeenCalledTimes(2);
    key(window); expect(later).toHaveBeenCalledTimes(1);
  } finally { off.forEach(release => release()); globalThis.reportError = previous; }
});

test('nested DOM surfaces route exclusively; editable descendants, suspension and stale cleanup do not leak', () => {
  const a = createWorldInputScope(); const b = createWorldInputScope();
  const outer = document.createElement('div'); const inner = document.createElement('div'); const edit = document.createElement('div'); const span = document.createElement('span');
  edit.contentEditable = 'true'; edit.setAttribute('contenteditable', 'true'); edit.append(span); inner.append(edit); outer.append(inner); document.body.append(outer);
  const seenA = jest.fn(); const seenB = jest.fn(); const blurA = jest.fn();
  const cleanup = [a.listen('keydown', seenA), b.listen('keydown', seenB), a.onBlur(blurA), a.registerSurface(outer, { focusable: true }), b.registerSurface(inner, { focusable: true })];
  try {
    outer.focus(); key(outer); expect(seenA).toHaveBeenCalledTimes(1); expect(seenB).not.toHaveBeenCalled();
    inner.focus(); key(inner); expect(seenA).toHaveBeenCalledTimes(1); expect(seenB).toHaveBeenCalledTimes(1); expect(blurA).toHaveBeenCalled();
    key(span); expect(seenB).toHaveBeenCalledTimes(1);
    b.suspend(); key(inner); expect(seenA).toHaveBeenCalledTimes(1); expect(seenB).toHaveBeenCalledTimes(1);
    b.resume(); key(inner); expect(seenB).toHaveBeenCalledTimes(2);
    const first = b.registerSurface(inner, { focusable: true }); const next = b.registerSurface(inner, { focusable: true });
    first(); first(); key(inner); expect(seenB).toHaveBeenCalledTimes(3); expect(inner.tabIndex).toBe(0); next();
  } finally { cleanup.reverse().forEach(off => off()); outer.remove(); }
  expect(inner.hasAttribute('tabindex')).toBe(false);
});

test('DOM listeners stay constant across worlds and disappear when every owner is inactive', () => {
  const add = jest.spyOn(window, 'addEventListener'); const remove = jest.spyOn(window, 'removeEventListener');
  const a = createWorldInputScope(); const b = createWorldInputScope(); const cleanup = [a.listen('keydown', jest.fn()), b.listen('keydown', jest.fn()), a.listen('keyup', jest.fn())];
  const count = (mock: typeof add) => mock.mock.calls.filter(([type]) => type === 'keydown' || type === 'keyup').length;
  try {
    expect(count(add)).toBe(4); a.suspend(); expect(count(remove)).toBe(0); b.suspend(); expect(count(remove)).toBe(4);
    a.resume(); expect(count(add)).toBe(8); cleanup.forEach(off => off()); expect(count(remove)).toBe(8);
  } finally { cleanup.forEach(off => off()); add.mockRestore(); remove.mockRestore(); }
});

test('a single unbound scope remains compatible; two worlds require explicit ownership', () => {
  const a = createWorldInputScope(); const b = createWorldInputScope(); const seenA = jest.fn(); const seenB = jest.fn();
  const offA = a.listen('keydown', seenA); let offB = () => {};
  try {
    key(window); expect(seenA).toHaveBeenCalledTimes(1);
    offB = b.listen('keydown', seenB); key(window); expect(seenA).toHaveBeenCalledTimes(1); expect(seenB).not.toHaveBeenCalled();
    b.activate(); key(window); expect(seenB).toHaveBeenCalledTimes(1);
    a.dispatchKey('keydown', 'F', 'touch-a'); expect(seenA).toHaveBeenCalledTimes(2); expect(seenB).toHaveBeenCalledTimes(1);
    a.suspend(); a.dispatchKey('keydown', 'F', 'stale'); expect(seenA).toHaveBeenCalledTimes(2);
  } finally { offA(); offB(); }
});

test('capture consumption and focus changes during dispatch prevent subsequent stale handlers', () => {
  const a = createWorldInputScope(); const b = createWorldInputScope(); const later = jest.fn(); const other = jest.fn();
  const capture = a.listen('keydown', event => event.preventDefault(), true);
  const off = a.listen('keydown', later); const offB = b.listen('keydown', other);
  a.activate(); key(window); expect(later).not.toHaveBeenCalled(); capture();
  const changeFocus = a.listen('keydown', () => b.activate(), true);
  key(window); expect(later).not.toHaveBeenCalled(); expect(other).not.toHaveBeenCalled();
  key(window); expect(other).toHaveBeenCalledTimes(1);
  changeFocus(); off(); offB();
});

test('removing one duplicate subscription retains the other and cleanup is idempotent', () => {
  const scope = createWorldInputScope(); const listener = jest.fn();
  const first = scope.listen('keydown', listener); const second = scope.listen('keydown', listener);
  first(); first(); key(window); expect(listener).toHaveBeenCalledTimes(1); second(); key(window); expect(listener).toHaveBeenCalledTimes(1);
});
