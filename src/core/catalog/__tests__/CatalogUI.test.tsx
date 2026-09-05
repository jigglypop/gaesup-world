import { fireEvent, render, screen } from '@testing-library/react';

import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { CatalogUI } from '../components/CatalogUI';
import { useCatalogStore } from '../stores/catalogStore';

beforeEach(() => {
  getItemRegistry().clear();
  useCatalogStore.setState({ entries: {
    apple: { itemId: 'apple', firstSeenDay: 1, totalCollected: 2 },
    fish: { itemId: 'fish', firstSeenDay: 2, totalCollected: 1 },
  } });
});

test('opening after content registration lists items and selects an available category', () => {
  render(<CatalogUI />);
  getItemRegistry().register({
    id: 'apple', name: '사과', icon: '', category: 'food', stackable: true, maxStack: 10,
  });
  fireEvent.keyDown(window, { key: 'k' });
  expect(screen.getByText('사과')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '음식 (1/1)' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('음식 · 1/1 수집')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  getItemRegistry().register({
    id: 'fish', name: '붕어', icon: '', category: 'fish', stackable: true, maxStack: 10,
  });
  fireEvent.keyDown(window, { key: 'k' });
  expect(screen.getByText('붕어')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '음식 (1/1)' }));
  expect(screen.getByText('사과')).toBeInTheDocument();
  expect(screen.queryByText('붕어')).not.toBeInTheDocument();
});
