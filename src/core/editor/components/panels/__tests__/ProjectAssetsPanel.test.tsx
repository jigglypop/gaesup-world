import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

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

    expect(filterProjectAssetItems(items, { tab: 'assets', kind: 'object3d' }).map((item) => item.id)).toEqual(['tree']);
    expect(filterProjectAssetItems(items, { tab: 'materials', query: 'glass' }).map((item) => item.id)).toEqual(['mat-glass']);
    expect(filterProjectAssetItems(items, { tab: 'prefabs', query: 'props' }).map((item) => item.id)).toEqual(['crate-prefab']);
  });
});

describe('ProjectAssetsPanel', () => {
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
    expect(onSelectItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'scene-a', group: 'scenes' }));

    fireEvent.click(screen.getByText('prefabs'));
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

    fireEvent.change(screen.getByLabelText('Search project assets'), { target: { value: 'missing' } });
    expect(screen.getByText('No project items')).toBeTruthy();
  });
});
