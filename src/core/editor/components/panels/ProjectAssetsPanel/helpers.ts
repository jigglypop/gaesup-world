import type { CSSProperties } from 'react';

import {
  PROJECT_ASSETS_PANEL_DEFAULT_CLASSES,
  PROJECT_ASSETS_PANEL_DEFAULT_LABELS,
} from './defaults';
import type {
  ProjectAssetItem,
  ProjectAssetKindFilter,
  ProjectAssetPanelTab,
  ProjectAssetPanelTabConfig,
  ProjectAssetsPanelClassNameSlot,
  ProjectAssetsPanelLabels,
  ProjectAssetsPanelLabelOverrides,
  ProjectAssetsPanelStyles,
  ProjectPrefabRecord,
} from './types';
import type { AssetRecord } from '../../../../assets';
import type { SceneDocument } from '../../../../scene-object';

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
export function mergeLabels(
  overrides?: ProjectAssetsPanelLabelOverrides,
): ProjectAssetsPanelLabels {
  return {
    ...PROJECT_ASSETS_PANEL_DEFAULT_LABELS,
    ...overrides,
    tabs: { ...PROJECT_ASSETS_PANEL_DEFAULT_LABELS.tabs, ...overrides?.tabs },
  };
}
export function mergeStyle(
  styles: ProjectAssetsPanelStyles | undefined,
  slot: ProjectAssetsPanelClassNameSlot,
  base?: CSSProperties,
): CSSProperties {
  return { ...base, ...styles?.[slot] };
}
export function defaultClassFor(slot: ProjectAssetsPanelClassNameSlot): string {
  return PROJECT_ASSETS_PANEL_DEFAULT_CLASSES[slot];
}
export function createProjectAssetTabs(
  tabs: readonly ProjectAssetPanelTabConfig[],
  labels: ProjectAssetsPanelLabels,
): ProjectAssetPanelTabConfig[] {
  return tabs.map((tab) => ({ ...tab, label: labels.tabs[tab.id] ?? tab.label }));
}
export function createProjectAssetItems(input: {
  assets?: readonly AssetRecord[];
  scenes?: readonly SceneDocument[];
  prefabs?: readonly ProjectPrefabRecord[];
}): ProjectAssetItem[] {
  const assetItems = (input.assets ?? []).map(
    (asset): ProjectAssetItem => ({
      id: asset.id,
      name: asset.name,
      kind: asset.kind,
      group: asset.kind === 'material' ? 'materials' : 'assets',
      ...(asset.slot ? { subtitle: asset.slot } : {}),
      ...(asset.thumbnailUrl ? { thumbnailUrl: asset.thumbnailUrl } : {}),
      tags: asset.tags ?? [],
      source: asset,
    }),
  );
  const sceneItems = (input.scenes ?? []).map(
    (scene): ProjectAssetItem => ({
      id: scene.id,
      name: scene.name ?? scene.id,
      kind: 'scene',
      group: 'scenes',
      subtitle: `${scene.objects.length} objects`,
      tags: [],
      source: scene,
    }),
  );
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
  items: readonly ProjectAssetItem[],
  filter: {
    tab?: ProjectAssetPanelTab;
    query?: string;
    kind?: ProjectAssetKindFilter;
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
