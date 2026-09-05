import { act, fireEvent, render, screen } from '@testing-library/react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useWalletStore } from '../../economy/stores/walletStore';
import { useToastStore } from '../../ui/components/Toast/toastStore';
import { CraftingUI } from '../components/CraftingUI';
import { getRecipeRegistry } from '../registry/RecipeRegistry';
import { useCraftingStore } from '../stores/craftingStore';

beforeEach(() => {
  getRecipeRegistry().clear();
  getRecipeRegistry().register({
    id: 'ui.recipe', name: '나무 의자', ingredients: [{ itemId: 'wood', count: 1 }],
    output: { itemId: 'chair', count: 1 }, requireBells: 10,
  });
  useCraftingStore.setState({ unlocked: new Set() });
  useInventoryStore.setState({ slots: [{ itemId: 'wood', count: 2 }] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
});

test('open crafting panel reacts to unlocking and explains missing output space in Korean', () => {
  render(<CraftingUI open />);
  expect(screen.getByText('아직 배우지 않은 레시피예요.')).toBeInTheDocument();
  act(() => useCraftingStore.getState().unlock('ui.recipe'));
  expect(screen.getByText('나무 의자')).toBeInTheDocument();
  expect(screen.getByText('결과물을 받을 가방 공간이 부족해요.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '제작' })).toBeDisabled();
  act(() => useInventoryStore.setState({ slots: [{ itemId: 'wood', count: 1 }] }));
  expect(screen.queryByText('결과물을 받을 가방 공간이 부족해요.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '제작' }));
  expect(useInventoryStore.getState().slots).toEqual([{ itemId: 'chair', count: 1 }]);
  expect(useWalletStore.getState().bells).toBe(90);
});

test('world shortcut opens crafting with V while leaving C available for character customization', () => {
  render(<CraftingUI toggleKey="v" />);
  fireEvent.keyDown(window, { key: 'c' });
  expect(screen.queryByText('제작대')).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'v' });
  expect(screen.getByText('제작대')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '닫기 [V]' }));
  expect(screen.queryByText('제작대')).not.toBeInTheDocument();
});

test('shortcut ignores held keys, composition, browser commands and editable controls', () => {
  render(<><CraftingUI toggleKey="v" /><select aria-label="선택"><option>항목</option></select><div contentEditable suppressContentEditableWarning><span>편집</span></div></>);
  for (const flags of [{ repeat: true }, { isComposing: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
    fireEvent.keyDown(window, { key: 'v', ...flags });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'v' });
  fireEvent.keyDown(screen.getByText('편집'), { key: 'v' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'v' });
  expect(screen.getByRole('dialog', { name: '제작대' })).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'v', repeat: true });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('keyboard close uses the latest callback and does nothing while controlled closed', () => {
  const previous = jest.fn();
  const current = jest.fn();
  const view = render(<CraftingUI open onClose={previous} />);
  view.rerender(<CraftingUI open onClose={current} />);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(previous).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledTimes(1);
  view.rerender(<CraftingUI open={false} onClose={current} />);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(current).toHaveBeenCalledTimes(1);
});

test('reports a failed craft attempt after an enabled button was displayed', () => {
  const original = useCraftingStore.getState().craft;
  const toasts = useToastStore.getState();
  useCraftingStore.setState({ unlocked: new Set(['ui.recipe']), craft: () => ({ ok: false, reason: 'spend failed' }) });
  useInventoryStore.setState({ slots: [{ itemId: 'wood', count: 1 }] });
  const view = render(<CraftingUI open />);
  try {
    expect(screen.getByRole('button', { name: '제작' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: '제작' }));
    expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ kind: 'warn', text: '제작 비용을 지불하지 못했어요. 보유 금액을 확인해 주세요.' });
  } finally {
    view.unmount();
    useCraftingStore.setState({ craft: original });
    useToastStore.setState(toasts);
  }
});
