import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { BlueprintEditor } from '..';
import { BlueprintPreview } from '../../BlueprintPreview';
import { useSpawnFromBlueprint } from '../../../hooks/useSpawnFromBlueprint';
import { blueprintRegistry } from '../../../registry';

jest.mock('../../BlueprintPreview', () => ({ BlueprintPreview: jest.fn(() => null) }));
jest.mock('../../../hooks/useSpawnFromBlueprint', () => ({ useSpawnFromBlueprint: jest.fn() }));

const originalBlueprints = blueprintRegistry.getAll();
const mockedUseSpawn = jest.mocked(useSpawnFromBlueprint);

test('copies edited branches without mutating drafts or cloning the camera for unrelated edits', async () => {
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor: jest.fn(), spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  render(<BlueprintEditor onClose={jest.fn()} />);
  const name = await screen.findByRole('textbox', { name: '이름', exact: true });
  const original = jest.mocked(BlueprintPreview).mock.lastCall?.[0].blueprint;
  fireEvent.change(name, { target: { value: '새 이름' } });
  const renamed = jest.mocked(BlueprintPreview).mock.lastCall?.[0].blueprint;
  expect(renamed).not.toBe(original);
  expect(original?.name).not.toBe('새 이름');
  if (original?.type !== 'character' || renamed?.type !== 'character') throw new Error('Expected character preview');
  expect(renamed.camera).toBe(original.camera);
  expect(renamed.physics).toBe(original.physics);
  fireEvent.change(screen.getByRole('spinbutton', { name: '이동 속도', exact: true }), { target: { value: '7' } });
  const moved = jest.mocked(BlueprintPreview).mock.lastCall?.[0].blueprint;
  if (moved?.type !== 'character') throw new Error('Expected character preview');
  expect(moved.camera).toBe(original.camera);
  expect(moved.physics).not.toBe(original.physics);
  expect(moved.physics.moveSpeed).toBe(7);
  expect(original.physics.moveSpeed).toBe(5);
});

test('edits camera modes with Korean labels while retaining canonical values and cancellation', async () => {
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor: jest.fn(), spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  render(<BlueprintEditor onClose={jest.fn()} />);
  const mode = await screen.findByRole('combobox', { name: '카메라 모드' });
  expect(mode).toHaveValue('thirdPerson');
  expect(within(mode).getByRole('option', { name: '3인칭' })).toBeInTheDocument();
  fireEvent.change(mode, { target: { value: 'topDown' } });
  fireEvent.click(screen.getByRole('button', { name: '변경 취소' }));
  expect(mode).toHaveValue('thirdPerson');
  fireEvent.change(mode, { target: { value: 'topDown' } });
  fireEvent.click(screen.getByRole('button', { name: '변경 적용' }));
  const saved = blueprintRegistry.get('char_warrior_basic');
  expect(saved?.type).toBe('character');
  if (saved?.type === 'character') expect(saved.camera?.mode).toBe('topDown');
});

afterEach(() => {
  blueprintRegistry.clear();
  originalBlueprints.forEach(blueprint => blueprintRegistry.register(blueprint));
  jest.clearAllMocks();
});

test('applies edits to the registry and refreshes the selectable name', async () => {
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor: jest.fn(), spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  render(<BlueprintEditor onClose={jest.fn()} />);
  const name = await screen.findByRole('textbox', { name: '이름', exact: true });
  expect(screen.getByDisplayValue('char_warrior_basic')).toHaveAttribute('readonly');
  expect(screen.getAllByRole('textbox', { name: '유형', exact: true })[0]).toHaveAttribute('readonly');
  expect(screen.getAllByRole('textbox', { name: '유형', exact: true })[0]).toHaveValue('캐릭터');
  expect(screen.getByRole('textbox', { name: '강한 공격', exact: true })).toHaveValue('attack_heavy.glb');
  fireEvent.change(name, { target: { value: '테스트 전사' } });
  expect(blueprintRegistry.get('char_warrior_basic')?.name).not.toBe('테스트 전사');
  fireEvent.click(screen.getByRole('button', { name: '변경 적용' }));
  expect(blueprintRegistry.get('char_warrior_basic')?.name).toBe('테스트 전사');
  expect(screen.getByRole('button', { name: '테스트 전사 근접 방어형 기본' })).toBeInTheDocument();
  const search = screen.getByRole('textbox', { name: '블루프린트 검색' });
  for (const query of [' 근접 ', 'MELEE']) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getByRole('button', { name: '테스트 전사 근접 방어형 기본' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '화염 마법사 마법 원거리 화염' })).not.toBeInTheDocument();
  }
  fireEvent.change(search, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: '화염 마법사 마법 원거리 화염' }));
  fireEvent.click(screen.getByRole('button', { name: '테스트 전사 근접 방어형 기본' }));
  expect(blueprintRegistry.get('char_warrior_basic')?.tags).toEqual(['melee', 'tank', 'starter']);
  expect(blueprintRegistry.get('char_warrior_basic')?.type).toBe('character');
  expect(screen.getByRole('textbox', { name: '이름', exact: true })).toHaveValue('테스트 전사');
});

test('spawns with the edited blueprint already applied', async () => {
  const spawnAtCursor = jest.fn(async (id: string) => {
    const blueprint = blueprintRegistry.get(id);
    expect(blueprint?.type).toBe('character');
    if (blueprint?.type === 'character') expect(blueprint.stats.health).toBe(240);
    return { id: 'spawned', blueprintId: id, type: 'character',
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number] };
  });
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor, spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  const onClose = jest.fn();
  render(<BlueprintEditor onClose={onClose} />);
  fireEvent.change(await screen.findByRole('spinbutton', { name: '체력' }), { target: { value: '240' } });
  fireEvent.click(screen.getByRole('button', { name: '엔티티 생성' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(spawnAtCursor).toHaveBeenCalledWith('char_warrior_basic');
});

test.each(['null', 'rejection'])('reports spawn %s in Korean and preserves edits for retry', async (failure) => {
  const spawnAtCursor = jest.fn();
  if (failure === 'null') spawnAtCursor.mockResolvedValueOnce(null);
  else spawnAtCursor.mockRejectedValueOnce(new Error('transport unavailable'));
  spawnAtCursor.mockResolvedValueOnce({ id: 'retry-success' });
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor, spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  const onClose = jest.fn();
  render(<BlueprintEditor onClose={onClose} />);
  fireEvent.change(await screen.findByRole('spinbutton', { name: '체력' }), { target: { value: '240' } });
  fireEvent.click(screen.getByRole('button', { name: '엔티티 생성' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('생성하지 못했습니다');
  expect(screen.getByRole('spinbutton', { name: '체력' })).toHaveValue(240);
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '엔티티 생성' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('edits string and object array entries without changing siblings or the registry before apply', () => {
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor: jest.fn(), spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  render(<BlueprintEditor onClose={jest.fn()} />);
  const attacks = screen.getByText('가벼운 공격 · 3개 항목');
  fireEvent.click(attacks);
  const attackGroup = within(attacks.closest('details')!);
  fireEvent.change(attackGroup.getByRole('textbox', { name: '항목 2', exact: true }), {
    target: { value: 'updated_attack.glb' },
  });
  const parts = screen.getByText('구성 요소 · 2개 항목');
  fireEvent.click(parts);
  const partGroup = within(parts.closest('details')!);
  const urls = partGroup.getAllByRole('textbox', { name: '파일 경로', exact: true });
  fireEvent.change(urls[1]!, { target: { value: 'updated_cloth.glb' } });
  const before = blueprintRegistry.get('char_warrior_basic');
  if (before?.type !== 'character') throw new Error('Expected character fixture');
  expect(before.animations.combat?.attack_light).toEqual(['attack_1.glb', 'attack_2.glb', 'attack_3.glb']);
  fireEvent.click(screen.getByRole('button', { name: '변경 적용' }));
  const after = blueprintRegistry.get('char_warrior_basic');
  if (after?.type !== 'character') throw new Error('Expected updated character');
  expect(after.animations.combat?.attack_light).toEqual(['attack_1.glb', 'updated_attack.glb', 'attack_3.glb']);
  expect(after.visuals?.parts?.[0]).toEqual(before.visuals?.parts?.[0]);
  expect(after.visuals?.parts?.[1]?.url).toBe('updated_cloth.glb');
  fireEvent.click(screen.getByRole('button', { name: /^차량/ }));
  fireEvent.click(screen.getByText('좌석 · 1개 항목'));
  const position = screen.getByText('위치 · 3개 항목');
  fireEvent.click(position);
  fireEvent.change(within(position.closest('details')!).getByRole('spinbutton', { name: '항목 2', exact: true }), {
    target: { value: '1.25' },
  });
  fireEvent.click(screen.getByRole('button', { name: '변경 적용' }));
  const kart = blueprintRegistry.get('vehicle_kart_basic');
  if (kart?.type !== 'vehicle') throw new Error('Expected vehicle fixture');
  expect(kart.seats[0]?.position).toEqual([0, 1.25, 0]);
});

test('protects pending edits during selection and restores the original when cancelled', () => {
  mockedUseSpawn.mockReturnValue({
    spawnAtCursor: jest.fn(), spawnEntity: jest.fn(), spawnMultiple: jest.fn(),
    isSpawning: false, lastSpawnedEntity: null,
  });
  render(<BlueprintEditor onClose={jest.fn()} />);
  const name = screen.getByRole('textbox', { name: '이름', exact: true });
  const search = screen.getByRole('textbox', { name: '블루프린트 검색' });
  const mage = screen.getByRole('button', { name: '화염 마법사 마법 원거리 화염' });
  const vehicles = screen.getByRole('button', { name: /^차량/ });
  fireEvent.change(name, { target: { value: '미적용 이름' } });
  expect(search).toBeDisabled();
  expect(mage).toBeDisabled();
  expect(vehicles).toBeDisabled();
  fireEvent.click(mage);
  expect(name).toHaveValue('미적용 이름');
  expect(blueprintRegistry.get('char_warrior_basic')?.name).toBe('기본 전사');
  fireEvent.click(screen.getByRole('button', { name: '변경 취소', exact: true }));
  expect(name).toHaveValue('기본 전사');
  expect(search).toBeEnabled();
  expect(mage).toBeEnabled();
  expect(vehicles).toBeEnabled();
  expect(screen.getByRole('button', { name: '변경 적용', exact: true })).toBeDisabled();
  fireEvent.click(mage);
  expect(name).toHaveValue('화염 마법사');
});
