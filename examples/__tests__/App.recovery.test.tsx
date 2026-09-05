import type { ReactNode } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { Link } from 'react-router-dom';

import App from '../App';
import { ExampleErrorBoundary } from '../components/harness';

jest.mock('../components/shell/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <><Link to="/assets">에셋으로 이동</Link>{children}</>,
}));
jest.mock('../pages/HomePage', () => ({
  HomePage: () => { throw new Error('Failed to fetch scene'); },
}));
jest.mock('../pages/AssetsPage', () => ({ AssetsPage: () => <h1>에셋 둘러보기</h1> }));
jest.mock('../pages/ExampleCatalogPage', () => ({ ExampleCatalogPage: () => null }));

test('preserves healthy child state when the route reset key changes', () => {
  const { rerender } = render(<ExampleErrorBoundary resetKey="/first"><input aria-label="초안" /></ExampleErrorBoundary>);
  const input = screen.getByRole('textbox', { name: '초안' });
  fireEvent.change(input, { target: { value: '작성 중' } });
  rerender(<ExampleErrorBoundary resetKey="/second"><input aria-label="초안" /></ExampleErrorBoundary>);
  expect(screen.getByRole('textbox', { name: '초안' })).toBe(input);
  expect(input).toHaveValue('작성 중');
});

test('recovers from a failed page when navigating through the shell', async () => {
  const report = jest.spyOn(console, 'error').mockImplementation(() => {});
  window.history.replaceState({}, '', '/');
  try {
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent('화면을 불러오지 못했습니다.');
    const details = screen.getByText('개발자용 오류 상세').closest('details');
    expect(details).not.toHaveAttribute('open');
    expect(details).toHaveTextContent('Failed to fetch scene');
    fireEvent.click(screen.getByRole('link', { name: '에셋으로 이동' }));
    expect(await screen.findByRole('heading', { name: '에셋 둘러보기' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  } finally {
    report.mockRestore();
    window.history.replaceState({}, '', '/');
  }
});
