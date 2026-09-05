import { fireEvent, render, screen } from '@testing-library/react';

import { useAssetStore } from '../../../../assets';
import { SEED_ASSETS } from '../../../../assets/data/seedAssets';
import { useCharacterStore } from '../../../../character/stores/characterStore';
import { CharacterAssetPanel } from '../CharacterAssetPanel';

test('resets only the active character and preserves other saved profiles', () => {
  const previousCharacter = useCharacterStore.getState();
  const previousAssets = useAssetStore.getState();
  useAssetStore.setState({ ids: [], records: {} });
  const store = useCharacterStore.getState();
  store.setActiveCharacter('other');
  store.setName('다른 캐릭터');
  store.equipOutfit('hat', 'other-hat');
  const other = useCharacterStore.getState().characters.other;
  store.setActiveCharacter('editing');
  store.setName('편집 중');
  store.equipOutfit('top', 'editing-shirt');
  const view = render(<CharacterAssetPanel />);
  try {
    fireEvent.click(screen.getByRole('button', { name: '초기화', exact: true }));
    const current = useCharacterStore.getState();
    expect(current.activeCharacterId).toBe('editing');
    expect(current.characters.other).toBe(other);
    expect(current.outfits.top).toBeNull();
    expect(current.characters.editing?.outfits).toBe(current.outfits);
    expect(current.serialize().characters.other).toEqual(other);
  } finally {
    view.unmount();
    useCharacterStore.setState(previousCharacter, true);
    useAssetStore.setState(previousAssets, true);
  }
});

test('searches names, tags and ids while preserving slot and ownership filters', () => {
  const previousAssets = useAssetStore.getState();
  const records = Object.fromEntries([
    { id: 'blue-top', name: '파란 상의', slot: 'top' as const, tags: ['summer'] },
    { id: 'red-top', name: '빨간 상의', slot: 'top' as const, metadata: { owned: false } },
    { id: 'blue-hat', name: '파란 모자', slot: 'hat' as const, tags: ['summer'] },
  ].map((asset) => [asset.id, { ...asset, kind: 'characterPart' as const, thumbnailUrl: '/item.png' }]));
  useAssetStore.setState({ ids: Object.keys(records), records, isLoading: false, error: null });
  const view = render(<CharacterAssetPanel />);
  try {
    const search = screen.getByRole('searchbox', { name: '캐릭터 에셋 검색' });
    for (const query of [' 파란 ', ' SUMMER ', 'BLUE-TOP']) {
      fireEvent.change(search, { target: { value: query } });
      expect(screen.getByRole('img', { name: '파란 상의' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: '빨간 상의' })).not.toBeInTheDocument();
      expect(screen.queryByRole('img', { name: '파란 모자' })).not.toBeInTheDocument();
    }
    fireEvent.change(search, { target: { value: '빨간' } });
    expect(screen.getByRole('img', { name: '빨간 상의' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: '보유만' }));
    expect(screen.queryByRole('img', { name: '빨간 상의' })).not.toBeInTheDocument();
    expect(screen.getByText('검색 조건에 맞는 에셋이 없습니다.')).toBeInTheDocument();
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByRole('img', { name: '파란 상의' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '빨간 상의' })).not.toBeInTheDocument();
  } finally {
    view.unmount();
    useAssetStore.setState(previousAssets, true);
  }
});

test('equips and removes seed glasses through the named slot without exposing the asset id', () => {
  const previousAssets = useAssetStore.getState();
  const previousCharacter = useCharacterStore.getState();
  const glasses = SEED_ASSETS.find((asset) => asset.id === 'ally-glasses');
  if (!glasses) throw new Error('Missing seed glasses');
  useAssetStore.setState({
    ids: [glasses.id],
    records: { [glasses.id]: { ...glasses, thumbnailUrl: '/glasses.png' } },
    isLoading: false,
    error: null,
  });
  useCharacterStore.getState().resetAppearance();
  const view = render(<CharacterAssetPanel />);
  try {
    fireEvent.click(screen.getByRole('button', { name: '안경 비어 있음', pressed: false }));
    const preview = screen.getByRole('img', { name: glasses.name });
    const card = preview.closest('button');
    if (!card) throw new Error('Missing glasses selection button');
    fireEvent.click(card);
    expect(useCharacterStore.getState().outfits.glasses).toBe(glasses.id);
    expect(screen.getByRole('button', { name: `안경 ${glasses.name}`, pressed: true })).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(glasses.id)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '비우기' }));
    expect(useCharacterStore.getState().outfits.glasses).toBeNull();
    expect(screen.getByRole('button', { name: '안경 비어 있음', pressed: true })).toBeInTheDocument();
  } finally {
    view.unmount();
    useAssetStore.setState(previousAssets, true);
    useCharacterStore.setState(previousCharacter, true);
  }
});
