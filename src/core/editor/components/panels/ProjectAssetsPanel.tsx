import React, { useMemo, useState } from 'react';

import type { EditorPanelBaseProps } from './types';
import { useAssetStore, type AssetKind, type AssetRecord } from '../../../assets';
import type { PrefabDocument } from '../../../prefab';
import type { SceneDocument } from '../../../scene-object';

export type ProjectAssetPanelTab = 'assets' | 'materials' | 'scenes' | 'prefabs';

export interface ProjectPrefabRecord {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  tags?: string[];
  objects?: PrefabDocument['objects'];
  metadata?: PrefabDocument['metadata'];
}

export interface ProjectAssetItem {
  id: string;
  name: string;
  kind: string;
  group: ProjectAssetPanelTab;
  subtitle?: string;
  thumbnailUrl?: string;
  tags: string[];
  source: AssetRecord | SceneDocument | ProjectPrefabRecord;
}

export type ProjectAssetsPanelProps = EditorPanelBaseProps & {
  scenes?: SceneDocument[];
  prefabs?: ProjectPrefabRecord[];
  defaultTab?: ProjectAssetPanelTab;
  selectedItemId?: string;
  onSelectItem?: (item: ProjectAssetItem) => void;
};

const ASSET_KIND_OPTIONS: Array<'all' | AssetKind> = [
  'all',
  'characterPart',
  'weapon',
  'material',
  'tile',
  'wall',
  'object3d',
];

export function ProjectAssetsPanel({
  scenes = [],
  prefabs = [],
  defaultTab = 'assets',
  selectedItemId,
  onSelectItem,
  className = '',
  style,
  children,
}: ProjectAssetsPanelProps = {}) {
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const catalogStatus = useAssetStore((state) => state.catalogStatus);
  const storeSelectedId = useAssetStore((state) => state.selectedId);
  const selectAsset = useAssetStore((state) => state.selectAsset);
  const [tab, setTab] = useState<ProjectAssetPanelTab>(defaultTab);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | AssetKind>('all');

  const assets = useMemo(
    () => assetIds.map((id) => assetRecords[id]).filter((asset): asset is AssetRecord => Boolean(asset)),
    [assetIds, assetRecords],
  );
  const items = useMemo(
    () => filterProjectAssetItems(
      createProjectAssetItems({ assets, scenes, prefabs }),
      { tab, query, kind },
    ),
    [assets, kind, prefabs, query, scenes, tab],
  );
  const activeId = selectedItemId ?? storeSelectedId;

  const selectItem = (item: ProjectAssetItem) => {
    if (item.group === 'assets' || item.group === 'materials') {
      selectAsset(item.id);
    }
    onSelectItem?.(item);
  };

  return (
    <div className={`project-assets-panel ${className}`} style={style}>
      <div className="project-assets-panel__toolbar">
        <div className="project-assets-panel__tabs" role="tablist" aria-label="Project asset tabs">
          {(['assets', 'materials', 'scenes', 'prefabs'] as const).map((nextTab) => (
            <button
              key={nextTab}
              type="button"
              className={tab === nextTab ? 'active' : ''}
              onClick={() => setTab(nextTab)}
            >
              {nextTab}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search project"
          aria-label="Search project assets"
        />
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as 'all' | AssetKind)}
          aria-label="Asset kind filter"
          disabled={tab !== 'assets'}
        >
          {ASSET_KIND_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="project-assets-panel__status">
        <span>{items.length} items</span>
        <span>{catalogStatus.state}</span>
      </div>

      <div className="project-assets-panel__list" role="list">
        {items.length === 0 ? (
          <div className="project-assets-panel__empty">No project items</div>
        ) : items.map((item) => (
          <button
            key={`${item.group}:${item.id}`}
            type="button"
            role="listitem"
            className={`project-assets-panel__item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => selectItem(item)}
          >
            <span className="project-assets-panel__thumb">
              {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : item.kind.slice(0, 2).toUpperCase()}
            </span>
            <span className="project-assets-panel__item-main">
              <strong>{item.name}</strong>
              <span>{item.subtitle ?? item.kind}</span>
            </span>
            <span className="project-assets-panel__badges">
              <span>{item.kind}</span>
              {item.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
            </span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

export function createProjectAssetItems(input: {
  assets?: AssetRecord[];
  scenes?: SceneDocument[];
  prefabs?: ProjectPrefabRecord[];
}): ProjectAssetItem[] {
  const assetItems = (input.assets ?? []).map((asset): ProjectAssetItem => ({
    id: asset.id,
    name: asset.name,
    kind: asset.kind,
    group: asset.kind === 'material' ? 'materials' : 'assets',
    ...(asset.slot ? { subtitle: asset.slot } : {}),
    ...(asset.thumbnailUrl ? { thumbnailUrl: asset.thumbnailUrl } : {}),
    tags: asset.tags ?? [],
    source: asset,
  }));
  const sceneItems = (input.scenes ?? []).map((scene): ProjectAssetItem => ({
    id: scene.id,
    name: scene.name ?? scene.id,
    kind: 'scene',
    group: 'scenes',
    subtitle: `${scene.objects.length} objects`,
    tags: [],
    source: scene,
  }));
  const prefabItems = (input.prefabs ?? []).map((prefab): ProjectAssetItem => {
    const subtitle = prefab.description ?? prefab.metadata?.description;
    const thumbnailUrl = prefab.thumbnailUrl ?? prefab.metadata?.thumbnailUrl;
    return {
      id: prefab.id,
      name: prefab.name,
      kind: 'prefab',
      group: 'prefabs',
      ...(subtitle ? { subtitle } : {}),
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
      tags: prefab.tags ?? prefab.metadata?.tags ?? [],
      source: prefab,
    };
  });

  return [...assetItems, ...sceneItems, ...prefabItems];
}

export function filterProjectAssetItems(
  items: ProjectAssetItem[],
  filter: {
    tab?: ProjectAssetPanelTab;
    query?: string;
    kind?: 'all' | AssetKind;
  },
): ProjectAssetItem[] {
  const query = filter.query?.trim().toLowerCase();
  return items.filter((item) => {
    if (filter.tab && item.group !== filter.tab) return false;
    if (filter.kind && filter.kind !== 'all' && item.kind !== filter.kind) return false;
    if (!query) return true;
    return (
      item.id.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.kind.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
}
