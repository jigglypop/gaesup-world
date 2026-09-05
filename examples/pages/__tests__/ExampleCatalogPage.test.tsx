import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { createPackageSurfaceExample } from '../../packageSurface';
import { ExampleCatalogPage } from '../ExampleCatalogPage';
import { EXAMPLE_ROUTES } from '../../config/exampleRoutes';

jest.mock('../../packageSurface', () => ({ createPackageSurfaceExample: jest.fn() }));

test('groups product experiences first and searches without dropping existing routes', () => {
  render(
    <MemoryRouter>
      <ExampleCatalogPage />
    </MemoryRouter>,
  );
  expect(screen.getAllByRole('link')).toHaveLength(EXAMPLE_ROUTES.length);
  const product = screen.getByRole('region', { name: '먼저 체험해보세요' });
  expect(within(product).getAllByRole('link')).toHaveLength(5);
  const search = screen.getByRole('searchbox', { name: '예제 찾기' });
  fireEvent.change(search, { target: { value: ' /BLUEPRINT-PLAYGROUND ' } });
  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByRole('link').getAttribute('href')).toBe('/blueprint-playground');
  fireEvent.change(search, { target: { value: '없는 검색어' } });
  expect(screen.queryAllByRole('link')).toHaveLength(0);
  expect(screen.getByText('일치하는 예제가 없습니다. 다른 단어로 검색해보세요.')).toBeDefined();
  fireEvent.change(search, { target: { value: '' } });
  expect(screen.getAllByRole('link')).toHaveLength(EXAMPLE_ROUTES.length);
});

test('runs the package example only on demand and releases its runtime', async () => {
  const dispose = jest.fn().mockResolvedValue(undefined);
  const create = jest.mocked(createPackageSurfaceExample);
  create.mockReturnValue({ runtime: { dispose } } as unknown as ReturnType<
    typeof createPackageSurfaceExample
  >);
  render(
    <MemoryRouter>
      <ExampleCatalogPage />
    </MemoryRouter>,
  );
  expect(create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '패키지 연결 확인' }));
  await waitFor(() => expect(dispose).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('status').textContent).toContain(
    '런타임과 카메라·이동 프리셋을 생성했습니다.',
  );
});

test('reports load failures and allows retry', async () => {
  jest.mocked(createPackageSurfaceExample).mockImplementation(() => {
    throw new Error('load failed');
  });
  render(
    <MemoryRouter>
      <ExampleCatalogPage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: '패키지 연결 확인' }));
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('다시 시도하세요'));
  expect(screen.getByRole('button', { name: '패키지 연결 확인' }).hasAttribute('disabled')).toBe(
    false,
  );
});
