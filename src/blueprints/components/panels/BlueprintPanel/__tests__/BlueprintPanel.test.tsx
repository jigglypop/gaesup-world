import { fireEvent, render, screen } from '@testing-library/react';

import { BlueprintPanel } from '..';
import { blueprintRegistry } from '../../../../registry';

jest.mock('../../../../hooks/useSpawnFromBlueprint', () => ({
  useSpawnFromBlueprint: () => ({ spawnAtCursor: jest.fn(), isSpawning: false }),
}));

const originalBlueprints = blueprintRegistry.getAll();
afterEach(() => {
  blueprintRegistry.clear();
  originalBlueprints.forEach(blueprint => blueprintRegistry.register(blueprint));
});

test('created blueprints appear immediately in the list', () => {
  render(<BlueprintPanel />);
  fireEvent.click(screen.getByRole('button', { name: '+ 새 블루프린트' }));
  expect(screen.getByRole('textbox', { name: '유형', exact: true })).toHaveValue('캐릭터');
  fireEvent.change(screen.getByRole('textbox', { name: '이름', exact: true }), {
    target: { value: '테스트 캐릭터' },
  });
  fireEvent.click(screen.getByRole('button', { name: '만들기', exact: true }));
  expect(screen.getByText('테스트 캐릭터', { exact: true })).toBeInTheDocument();
  const created = screen.getByRole('button', { name: /^테스트 캐릭터 / });
  expect(created).toHaveAttribute('aria-pressed', 'true');
  const mage = screen.getByRole('button', { name: /^화염 마법사 / });
  mage.focus();
  expect(mage).toHaveFocus();
  fireEvent.click(mage);
  expect(mage).toHaveAttribute('aria-pressed', 'true');
  expect(created).toHaveAttribute('aria-pressed', 'false');
  expect(blueprintRegistry.getAll().some(blueprint => blueprint.name === '테스트 캐릭터')).toBe(true);
  expect(screen.getByText('사용자 지정', { exact: true })).toBeInTheDocument();
  const search = screen.getByRole('textbox', { name: '블루프린트 검색' });
  for (const query of ['사용자 지정', 'custom']) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getByText('테스트 캐릭터', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('화염 마법사', { exact: true })).not.toBeInTheDocument();
  }
  expect(blueprintRegistry.getAll().find(blueprint => blueprint.name === '테스트 캐릭터')?.tags).toEqual(['custom']);
});

test('cancel clears the unsaved selection and unsupported categories cannot create characters', () => {
  render(<BlueprintPanel />);
  fireEvent.click(screen.getByRole('button', { name: '+ 새 블루프린트' }));
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByRole('button', { name: '엔티티 생성' })).not.toBeInTheDocument();
  expect(blueprintRegistry.getAll()).toHaveLength(originalBlueprints.length);
  fireEvent.click(screen.getByRole('button', { name: '애니메이션 (0)' }));
  expect(screen.getByRole('button', { name: '+ 새 블루프린트' })).toBeDisabled();
});
