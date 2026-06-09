import React, { useCallback, useMemo, useState, type CSSProperties } from 'react';

import {
  PROJECT_ASSETS_PANEL_DEFAULT_CLASSES,
  PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS,
  PROJECT_ASSETS_PANEL_DEFAULT_LABELS,
  PROJECT_ASSETS_PANEL_DEFAULT_TABS,
} from './defaults';
import {
  createProjectAssetItems,
  createProjectAssetTabs,
  cx,
  filterProjectAssetItems,
  mergeLabels,
  mergeStyle,
} from './helpers';
import { renderProjectAssetsPanelContent } from './sections';
import type {
  ProjectAssetKindFilter,
  ProjectAssetPanelTab,
  ProjectAssetsPanelClassNameSlot,
  ProjectAssetsPanelProps,
  ProjectAssetsPanelRenderContext,
} from './types';
import { useAssetStore, type AssetRecord } from '../../../../assets';

export function ProjectAssetsPanel({
  assets: controlledAssets,
  scenes = [],
  prefabs = [],
  activeTab,
  defaultTab = 'assets',
  query,
  defaultQuery = '',
  kind,
  defaultKind = 'all',
  tabs = PROJECT_ASSETS_PANEL_DEFAULT_TABS,
  kindOptions = PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS,
  selectedItemId,
  labels: labelOverrides,
  className,
  style,
  classNames,
  styles,
  renderers,
  onTabChange,
  onQueryChange,
  onKindChange,
  onSelectItem,
  children,
}: ProjectAssetsPanelProps = {}) {
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const catalogStatus = useAssetStore((state) => state.catalogStatus);
  const storeSelectedId = useAssetStore((state) => state.selectedId);
  const selectAsset = useAssetStore((state) => state.selectAsset);
  const [internalTab, setInternalTab] = useState<ProjectAssetPanelTab>(defaultTab);
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [internalKind, setInternalKind] = useState<ProjectAssetKindFilter>(defaultKind);
  const currentTab = activeTab ?? internalTab;
  const currentQuery = query ?? internalQuery;
  const currentKind = kind ?? internalKind;
  const labels = useMemo(() => mergeLabels(labelOverrides), [labelOverrides]);
  const resolvedTabs = useMemo(() => createProjectAssetTabs(tabs, labels), [labels, tabs]);
  const storeAssets = useMemo(
    () =>
      assetIds
        .map((id) => assetRecords[id])
        .filter((asset): asset is AssetRecord => Boolean(asset)),
    [assetIds, assetRecords],
  );
  const assets = controlledAssets ?? storeAssets;
  const allItems = useMemo(
    () => createProjectAssetItems({ assets, scenes, prefabs }),
    [assets, prefabs, scenes],
  );
  const items = useMemo(
    () =>
      filterProjectAssetItems(allItems, {
        tab: currentTab,
        query: currentQuery,
        kind: currentKind,
      }),
    [allItems, currentKind, currentQuery, currentTab],
  );
  const activeId = selectedItemId ?? storeSelectedId;
  const handleTabChange = useCallback(
    (nextTab: ProjectAssetPanelTab) => {
      if (activeTab === undefined) setInternalTab(nextTab);
      onTabChange?.(nextTab);
    },
    [activeTab, onTabChange],
  );
  const handleQueryChange = useCallback(
    (nextQuery: string) => {
      if (query === undefined) setInternalQuery(nextQuery);
      onQueryChange?.(nextQuery);
    },
    [onQueryChange, query],
  );
  const handleKindChange = useCallback(
    (nextKind: ProjectAssetKindFilter) => {
      if (kind === undefined) setInternalKind(nextKind);
      onKindChange?.(nextKind);
    },
    [kind, onKindChange],
  );
  const handleSelectItem = useCallback(
    (item: ReturnType<typeof createProjectAssetItems>[number]) => {
      if (item.group === 'assets' || item.group === 'materials') {
        selectAsset(item.id);
      }
      onSelectItem?.(item);
    },
    [onSelectItem, selectAsset],
  );
  const classNameFor = useCallback(
    (slot: ProjectAssetsPanelClassNameSlot, extra?: string) =>
      cx(
        PROJECT_ASSETS_PANEL_DEFAULT_CLASSES[slot],
        classNames?.[slot],
        slot === 'root' && className,
        extra,
      ),
    [className, classNames],
  );
  const styleFor = useCallback(
    (slot: ProjectAssetsPanelClassNameSlot, base?: CSSProperties) => {
      const nextStyle = mergeStyle(styles, slot, base);
      if (slot !== 'root') return nextStyle;
      return { ...nextStyle, ...style };
    },
    [style, styles],
  );
  const context = useMemo<ProjectAssetsPanelRenderContext>(
    () => ({
      activeTab: currentTab,
      query: currentQuery,
      kind: currentKind,
      tabs: resolvedTabs,
      kindOptions,
      items,
      allItems,
      activeId,
      catalogStatus,
      labels,
      classNameFor,
      styleFor,
      actions: {
        setTab: handleTabChange,
        setQuery: handleQueryChange,
        setKind: handleKindChange,
        selectItem: handleSelectItem,
      },
    }),
    [
      activeId,
      allItems,
      catalogStatus,
      classNameFor,
      currentKind,
      currentQuery,
      currentTab,
      handleKindChange,
      handleQueryChange,
      handleSelectItem,
      handleTabChange,
      items,
      kindOptions,
      labels,
      resolvedTabs,
      styleFor,
    ],
  );
  const content = renderProjectAssetsPanelContent(context, renderers, children);
  if (renderers?.root) return <>{renderers.root(context, content)}</>;
  return (
    <div className={context.classNameFor('root')} style={context.styleFor('root')}>
      {content}
    </div>
  );
}
export {
  PROJECT_ASSETS_PANEL_DEFAULT_CLASSES,
  PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS,
  PROJECT_ASSETS_PANEL_DEFAULT_LABELS,
  PROJECT_ASSETS_PANEL_DEFAULT_TABS,
  createProjectAssetItems,
  filterProjectAssetItems,
};
export type * from './types';
