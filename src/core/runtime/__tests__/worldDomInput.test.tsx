import { act, fireEvent, render } from '@testing-library/react';

import { useKeyboard } from '../../hooks/useKeyboard';
import { InventoryUI } from '../../inventory/components/InventoryUI';
import { WorldInputSurface } from '../../input/WorldInputSurface';
import { TouchControls } from '../../input/touch/components/TouchControls';
import { useEditorShortcuts } from '../../editor/hooks/useEditorShortcuts';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('an overlay outside the canvas owns focus and Escape closes only its world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  const view = render(<><GaesupRuntimeProvider runtime={a}><div data-testid="overlay-a"><InventoryUI initiallyOpen /></div></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><div data-testid="overlay-b"><InventoryUI initiallyOpen /></div></GaesupRuntimeProvider></>);
  try {
    const button = view.getByTestId('overlay-a').querySelector('button')!;
    act(() => button.focus()); fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
    expect(view.getByTestId('overlay-a').querySelector('[data-world-overlay]')).toBeNull();
    expect(view.getByTestId('overlay-b').querySelector('[data-world-overlay]')).not.toBeNull();
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('world focus, editable content, blur, disposal and restart release actual keyboard hook ownership', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  function Keys() { useKeyboard(); return null; }
  const view = render(<><GaesupRuntimeProvider runtime={a}><WorldInputSurface data-testid="A"><Keys /><input aria-label="edit" /></WorldInputSurface></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><WorldInputSurface data-testid="B"><Keys /></WorldInputSurface></GaesupRuntimeProvider></>);
  const down = () => fireEvent.keyDown(document.activeElement!, { code: 'KeyW', key: 'w' });
  try {
    act(() => view.getByTestId('A').focus()); down(); expect(a.inputAdapter.getKeyboard().forward).toBe(true); expect(b.inputAdapter.getKeyboard().forward).toBe(false);
    act(() => view.getByTestId('B').focus()); expect(a.inputAdapter.getKeyboard().forward).toBe(false); down(); expect(b.inputAdapter.getKeyboard().forward).toBe(true);
    act(() => view.getByLabelText('edit').focus()); expect(b.inputAdapter.getKeyboard().forward).toBe(false); down(); expect(a.inputAdapter.getKeyboard().forward).toBe(false);
    act(() => view.getByTestId('A').focus()); down(); fireEvent.blur(window); expect(a.inputAdapter.getKeyboard().forward).toBe(false);
    await act(async () => { await a.dispose(); }); down(); expect(a.inputAdapter.getKeyboard().forward).toBe(false); expect(b.inputAdapter.getKeyboard().forward).toBe(false);
    await act(async () => { await a.setup(); }); down(); expect(a.inputAdapter.getKeyboard().forward).toBe(true);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('duplicate keyboard consumers and a virtual button retain physical Space until its own release', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  function Keys() { useKeyboard(); return null; }
  const tree = (count: number, touch = true) => <GaesupRuntimeProvider runtime={runtime}><WorldInputSurface data-testid="surface">{Array.from({ length: count }, (_, index) => <Keys key={index} />)}{touch && <TouchControls forceVisible actions={[{ id: 'jump', label: 'Jump', key: ' ' }]} />}</WorldInputSurface></GaesupRuntimeProvider>;
  const view = render(tree(2));
  try {
    act(() => view.getByTestId('surface').focus());
    fireEvent.keyDown(document.activeElement!, { code: 'Space', key: ' ' });
    fireEvent.pointerDown(view.getByText('Jump')); fireEvent.pointerUp(view.getByText('Jump'));
    expect(runtime.inputAdapter.getKeyboard().space).toBe(true);
    view.rerender(tree(1)); expect(runtime.inputAdapter.getKeyboard().space).toBe(true);
    fireEvent.keyUp(document.activeElement!, { code: 'Space', key: ' ' }); expect(runtime.inputAdapter.getKeyboard().space).toBe(false);
    fireEvent.pointerDown(view.getByText('Jump')); expect(runtime.inputAdapter.getKeyboard().space).toBe(true);
    view.rerender(tree(1, false)); expect(runtime.inputAdapter.getKeyboard().space).toBe(false);
  } finally { view.unmount(); await runtime.dispose(); }
});

test('a world editor with an explicit DOM target does not handle shortcuts from a nested world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  const outer = document.createElement('div'); outer.tabIndex = 0; document.body.append(outer); const ran = jest.fn();
  function Editor() { useEditorShortcuts([{ id: 'edit', label: 'Edit', key: 'k', ctrl: true, run: ran }], { target: outer }); return null; }
  const view = render(<GaesupRuntimeProvider runtime={a}><Editor /><GaesupRuntimeProvider runtime={b}><WorldInputSurface data-testid="nested" /></GaesupRuntimeProvider></GaesupRuntimeProvider>, { container: outer });
  try {
    act(() => view.getByTestId('nested').focus()); fireEvent.keyDown(document.activeElement!, { key: 'k', ctrlKey: true }); expect(ran).not.toHaveBeenCalled();
    act(() => outer.focus()); fireEvent.keyDown(outer, { key: 'k', ctrlKey: true }); expect(ran).toHaveBeenCalledTimes(1);
    await act(async () => { await a.dispose(); }); fireEvent.keyDown(outer, { key: 'k', ctrlKey: true }); expect(ran).toHaveBeenCalledTimes(1);
  } finally { view.unmount(); outer.remove(); await a.dispose(); await b.dispose(); }
});
