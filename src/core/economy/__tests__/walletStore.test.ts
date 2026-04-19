import { useWalletStore } from '../stores/walletStore';

beforeEach(() => {
  useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
});

describe('walletStore', () => {
  test('add increases bells and lifetimeEarned', () => {
    useWalletStore.getState().add(100);
    expect(useWalletStore.getState().bells).toBe(100);
    expect(useWalletStore.getState().lifetimeEarned).toBe(100);
  });

  test('add with non-positive amount is no-op', () => {
    useWalletStore.getState().add(0);
    useWalletStore.getState().add(-10);
    expect(useWalletStore.getState().bells).toBe(0);
    expect(useWalletStore.getState().lifetimeEarned).toBe(0);
  });

  test('spend deducts when sufficient', () => {
    useWalletStore.getState().add(100);
    const ok = useWalletStore.getState().spend(40);
    expect(ok).toBe(true);
    expect(useWalletStore.getState().bells).toBe(60);
    expect(useWalletStore.getState().lifetimeSpent).toBe(40);
  });

  test('spend rejects when insufficient', () => {
    useWalletStore.getState().add(20);
    const ok = useWalletStore.getState().spend(40);
    expect(ok).toBe(false);
    expect(useWalletStore.getState().bells).toBe(20);
    expect(useWalletStore.getState().lifetimeSpent).toBe(0);
  });

  test('serialize/hydrate roundtrip', () => {
    useWalletStore.getState().add(150);
    useWalletStore.getState().spend(30);
    const blob = useWalletStore.getState().serialize();
    useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
    useWalletStore.getState().hydrate(blob);
    expect(useWalletStore.getState().bells).toBe(120);
    expect(useWalletStore.getState().lifetimeEarned).toBe(150);
    expect(useWalletStore.getState().lifetimeSpent).toBe(30);
  });
});
