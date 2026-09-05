import { fireEvent, render, screen } from '@testing-library/react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useToastStore } from '../../ui/components/Toast/toastStore';
import { ShopUI } from '../components/ShopUI';
import { useShopStore } from '../stores/shopStore';
import { useWalletStore } from '../stores/walletStore';

test('buying and selling use named controls and Korean currency without submitting a host form', () => {
  const inventory = useInventoryStore.getState();
  const wallet = useWalletStore.getState();
  const shop = useShopStore.getState();
  const toasts = useToastStore.getState();
  const itemId = 'shop-ui-apple';
  getItemRegistry().register({ id: itemId, name: '사과', icon: '', category: 'food', stackable: true, maxStack: 10, sellPrice: 5 });
  useInventoryStore.setState({ size: 1, slots: [null] });
  useWalletStore.setState({ bells: 100, lifetimeEarned: 0, lifetimeSpent: 0 });
  useShopStore.setState({ dailyStock: [{ itemId, price: 10, stock: 1 }] });
  const onClose = jest.fn();
  const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
  const view = render(<form onSubmit={onSubmit}><ShopUI open onClose={onClose} /></form>);
  try {
    expect(screen.getByRole('dialog', { name: '상점' })).toBeInTheDocument();
    expect(screen.getByText('100 벨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구매', exact: true })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '사과 구매' }));
    expect(screen.getByText('90 벨')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '사과 구매' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '판매', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: '사과 판매' }));
    expect(screen.getByText('95 벨')).toBeInTheDocument();
    expect(screen.getByText('판매할 아이템이 없습니다.')).toBeInTheDocument();
    expect(useToastStore.getState().toasts.at(-1)?.text).toBe('사과 판매 +5 벨');
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  } finally {
    view.unmount();
    useInventoryStore.setState(inventory);
    useWalletStore.setState(wallet);
    useShopStore.setState(shop);
    useToastStore.setState(toasts);
  }
});
