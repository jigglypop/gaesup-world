import type { CSSProperties, ReactNode } from 'react';

import type { AssetCatalogStatus, AssetKind, AssetRecord } from '../../../../assets';
import type { PrefabDocument } from '../../../../prefab';
import type { SceneDocument } from '../../../../scene-object';
import type { EditorPanelBaseProps } from '../types';

export type ProjectAssetPanelTab = 'assets' | 'materials' | 'scenes' | 'prefabs';
export type ProjectAssetKindFilter = 'all' | AssetKind;
export type ProjectPrefabRecord = {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  tags?: string[];
  objects?: PrefabDocument['objects'];
  metadata?: PrefabDocument['metadata'];
};
export type ProjectAssetItem = {
  id: string;
  name: string;
  kind: string;
  group: ProjectAssetPanelTab;
  subtitle?: string;
  thumbnailUrl?: string;
  tags: string[];
  source: AssetRecord | SceneDocument | ProjectPrefabRecord;
};
export type ProjectAssetsPanelLabels = {
  tabs: Record<ProjectAssetPanelTab, string>;
  tabsAriaLabel: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  kindFilterAriaLabel: string;
  empty: string;
  statusItems: (count: number) => string;
  statusFallback: string;
};
export type ProjectAssetsPanelLabelOverrides = Partial<Omit<ProjectAssetsPanelLabels, 'tabs'>> & {
  tabs?: Partial<Record<ProjectAssetPanelTab, string>>;
};
export type ProjectAssetsPanelClassNameSlot =
  | 'root'
  | 'toolbar'
  | 'tabs'
  | 'tab'
  | 'activeTab'
  | 'searchInput'
  | 'kindSelect'
  | 'status'
  | 'statusCount'
  | 'statusCatalog'
  | 'list'
  | 'empty'
  | 'item'
  | 'activeItem'
  | 'thumb'
  | 'itemMain'
  | 'itemName'
  | 'itemSubtitle'
  | 'badges'
  | 'badge';
export type ProjectAssetsPanelClassNames = Partial<Record<ProjectAssetsPanelClassNameSlot, string>>;
export type ProjectAssetsPanelStyles = Partial<
  Record<ProjectAssetsPanelClassNameSlot, CSSProperties>
>;
export type ProjectAssetPanelTabConfig = {
  id: ProjectAssetPanelTab;
  label: string;
  disabled?: boolean;
};
export type ProjectAssetsPanelActions = {
  setTab: (tab: ProjectAssetPanelTab) => void;
  setQuery: (query: string) => void;
  setKind: (kind: ProjectAssetKindFilter) => void;
  selectItem: (item: ProjectAssetItem) => void;
};
export type ProjectAssetsPanelRenderContext = {
  activeTab: ProjectAssetPanelTab;
  query: string;
  kind: ProjectAssetKindFilter;
  tabs: readonly ProjectAssetPanelTabConfig[];
  kindOptions: readonly ProjectAssetKindFilter[];
  items: readonly ProjectAssetItem[];
  allItems: readonly ProjectAssetItem[];
  activeId: string | null | undefined;
  catalogStatus: AssetCatalogStatus | undefined;
  labels: ProjectAssetsPanelLabels;
  classNameFor: (slot: ProjectAssetsPanelClassNameSlot, extra?: string) => string;
  styleFor: (slot: ProjectAssetsPanelClassNameSlot, base?: CSSProperties) => CSSProperties;
  actions: ProjectAssetsPanelActions;
};
export type ProjectAssetsPanelRenderers = {
  root?: (context: ProjectAssetsPanelRenderContext, children: ReactNode) => ReactNode;
  toolbar?: (context: ProjectAssetsPanelRenderContext, children: ReactNode) => ReactNode;
  tabs?: (context: ProjectAssetsPanelRenderContext, children: ReactNode) => ReactNode;
  tab?: (
    context: ProjectAssetsPanelRenderContext,
    tab: ProjectAssetPanelTabConfig,
    active: boolean,
  ) => ReactNode;
  search?: (context: ProjectAssetsPanelRenderContext) => ReactNode;
  kindFilter?: (context: ProjectAssetsPanelRenderContext) => ReactNode;
  status?: (context: ProjectAssetsPanelRenderContext) => ReactNode;
  list?: (context: ProjectAssetsPanelRenderContext, children: ReactNode) => ReactNode;
  item?: (
    context: ProjectAssetsPanelRenderContext,
    item: ProjectAssetItem,
    active: boolean,
  ) => ReactNode;
  empty?: (context: ProjectAssetsPanelRenderContext) => ReactNode;
};
export type ProjectAssetsPanelProps = EditorPanelBaseProps & {
  assets?: readonly AssetRecord[];
  scenes?: readonly SceneDocument[];
  prefabs?: readonly ProjectPrefabRecord[];
  activeTab?: ProjectAssetPanelTab;
  defaultTab?: ProjectAssetPanelTab;
  query?: string;
  defaultQuery?: string;
  kind?: ProjectAssetKindFilter;
  defaultKind?: ProjectAssetKindFilter;
  tabs?: readonly ProjectAssetPanelTabConfig[];
  kindOptions?: readonly ProjectAssetKindFilter[];
  selectedItemId?: string;
  labels?: ProjectAssetsPanelLabelOverrides;
  classNames?: ProjectAssetsPanelClassNames;
  styles?: ProjectAssetsPanelStyles;
  renderers?: ProjectAssetsPanelRenderers;
  onTabChange?: (tab: ProjectAssetPanelTab) => void;
  onQueryChange?: (query: string) => void;
  onKindChange?: (kind: ProjectAssetKindFilter) => void;
  onSelectItem?: (item: ProjectAssetItem) => void;
};
