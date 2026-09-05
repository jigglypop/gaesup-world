import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import type { AssetRecord } from '../../../../assets';
import { createSceneDocument } from '../../../../scene-object';
import {
  ProjectAssetsPanel,
  createProjectAssetItems,
  filterProjectAssetItems,
} from '../ProjectAssetsPanel';

describe('ProjectAssetsPanel helpers', () => {
  const assets: AssetRecord[] = [
    { id: 'mat-glass', name: 'Glass', kind: 'material', tags: ['building'] },
    { id: 'tree', name: 'Tree', kind: 'object3d', tags: ['nature'] },
  ];
  const scenes = [createSceneDocument({ id: 'town', name: 'Town', objects: [{ id: 'root' }] })];
  const prefabs = [{ id: 'crate-prefab', name: 'Crate Prefab', tags: ['props'] }];

  test('normalizes project assets, scenes, and prefabs', () => {
    const items = createProjectAssetItems({ assets, scenes, prefabs });

    expect(items.map((item) => `${item.group}:${item.id}`)).toEqual([
      'materials:mat-glass',
      'assets:tree',
      'scenes:town',
      'prefabs:crate-prefab',
    ]);
  });

  test('filters by tab, query, and kind', () => {
    const items = createProjectAssetItems({ assets, scenes, prefabs });

    expect(
      filterProjectAssetItems(items, { tab: 'assets', kind: 'object3d' }).map((item) => item.id),
    ).toEqual(['tree']);
    expect(
      filterProjectAssetItems(items, { tab: 'materials', query: 'glass' }).map((item) => item.id),
    ).toEqual(['mat-glass']);
    expect(
      filterProjectAssetItems(items, { tab: 'prefabs', query: 'props' }).map((item) => item.id),
    ).toEqual(['crate-prefab']);
  });
});

describe('ProjectAssetsPanel', () => {
  test('exposes selectable buttons inside list items and announces controlled selection', () => {
    const onSelectItem = jest.fn();
    const assets: AssetRecord[] = [{ id: 'chair', name: '의자', kind: 'object3d' }];
    const { rerender } = render(<ProjectAssetsPanel assets={assets} selectedItemId="none" onSelectItem={onSelectItem} />);
    const item = within(screen.getByRole('list')).getByRole('listitem');
    const button = within(item).getByRole('button', { pressed: false });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onSelectItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'chair' }));
    rerender(<ProjectAssetsPanel assets={assets} selectedItemId="chair" onSelectItem={onSelectItem} />);
    expect(within(item).getByRole('button', { pressed: true })).toBe(button);
  });

  test.each(['상의', '의상', '캐릭터 부품', 'top', 'cloth', 'shirt-1', 'linen'])(
    'finds assets by displayed labels and original values: %s', (query) => {
      render(<ProjectAssetsPanel assets={[
        { id: 'shirt-1', name: 'Linen Shirt', kind: 'characterPart', slot: 'top', tags: ['cloth'] },
        { id: 'chair-1', name: 'Wooden Chair', kind: 'object3d', tags: ['wood'] },
      ]} />);
      fireEvent.change(screen.getByRole('searchbox', { name: '프로젝트 에셋 검색' }), { target: { value: query } });
      expect(screen.getByText('Linen Shirt')).toBeInTheDocument();
      expect(screen.queryByText('Wooden Chair')).not.toBeInTheDocument();
    },
  );

  test('renders scene and prefab project tabs and emits selection', () => {
    const onSelectItem = jest.fn();
    render(
      <ProjectAssetsPanel
        scenes={[createSceneDocument({ id: 'scene-a', name: 'Scene A' })]}
        prefabs={[{ id: 'prefab-a', name: 'Prefab A' }]}
        defaultTab="scenes"
        onSelectItem={onSelectItem}
      />,
    );

    expect(screen.getByText('Scene A')).toBeTruthy();
    fireEvent.click(screen.getByText('Scene A'));
    expect(onSelectItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'scene-a', group: 'scenes' }),
    );

    fireEvent.click(screen.getByRole('button', { name: '프리팹', pressed: false }));
    expect(screen.getByText('Prefab A')).toBeTruthy();
  });

  test('searches visible project items', () => {
    render(
      <ProjectAssetsPanel
        scenes={[createSceneDocument({ id: 'scene-a', name: 'Scene A' })]}
        prefabs={[{ id: 'prefab-a', name: 'Prefab A' }]}
        defaultTab="prefabs"
      />,
    );

    fireEvent.change(screen.getByLabelText('프로젝트 에셋 검색'), {
      target: { value: 'missing' },
    });
    expect(screen.getByText('프로젝트 항목이 없습니다')).toBeTruthy();
  });

  test('커스텀 renderer와 controlled 필터를 사용할 수 있어야 한다', () => {
    const onQueryChange = jest.fn();
    render(
      <ProjectAssetsPanel
        assets={[{ id: 'custom-tree', name: 'Custom Tree', kind: 'object3d', tags: ['nature'] }]}
        activeTab="assets"
        query="tree"
        onQueryChange={onQueryChange}
        renderers={{
          item: (_, item) => (
            <article key={item.id} data-testid="custom-project-item">
              {item.name}
            </article>
          ),
          status: (context) => <div>{context.labels.statusItems(context.items.length)}</div>,
        }}
      />,
    );
    expect(screen.getByTestId('custom-project-item')).toHaveTextContent('Custom Tree');
    expect(screen.getByText('1개 항목')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('프로젝트 에셋 검색'), { target: { value: 'rock' } });
    expect(onQueryChange).toHaveBeenCalledWith('rock');
  });

  test('asset kind filtering does not hide scenes, materials or prefabs after switching groups', () => {
    render(
      <ProjectAssetsPanel
        assets={[
          { id: 'tile', name: 'Test tile', kind: 'tile' },
          { id: 'material', name: 'Test material', kind: 'material' },
          { id: 'tree', name: 'Test tree', kind: 'object3d' },
        ]}
        scenes={[createSceneDocument({ id: 'scene', name: 'Test scene' })]}
        prefabs={[{ id: 'prefab', name: 'Test prefab' }]}
      />,
    );
    const filter = screen.getByRole('combobox', { name: '에셋 종류' });
    fireEvent.change(filter, { target: { value: 'tile' } });
    expect(screen.getByText('Test tile')).toBeTruthy();
    expect(screen.queryByText('Test tree')).toBeNull();

    for (const [group, name] of [['장면', 'Test scene'], ['재질', 'Test material'], ['프리팹', 'Test prefab']]) {
      fireEvent.click(screen.getByRole('button', { name: group }));
      expect(screen.getByRole('button', { name: group, pressed: true })).toBeTruthy();
      expect(screen.getByText(name)).toBeTruthy();
      expect(filter).toBeDisabled();
    }
    fireEvent.click(screen.getByRole('button', { name: '에셋' }));
    expect(filter).toHaveValue('tile');
    expect(filter).not.toBeDisabled();
    expect(screen.getByText('Test tile')).toBeTruthy();
    expect(screen.queryByText('Test tree')).toBeNull();
  });
});
