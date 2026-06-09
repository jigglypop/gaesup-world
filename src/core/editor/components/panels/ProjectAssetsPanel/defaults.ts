import type {
  ProjectAssetKindFilter,
  ProjectAssetPanelTabConfig,
  ProjectAssetsPanelClassNameSlot,
  ProjectAssetsPanelLabels,
} from './types';

export const PROJECT_ASSETS_PANEL_DEFAULT_TABS: readonly ProjectAssetPanelTabConfig[] = [
  { id: 'assets', label: 'assets' },
  { id: 'materials', label: 'materials' },
  { id: 'scenes', label: 'scenes' },
  { id: 'prefabs', label: 'prefabs' },
];
export const PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS: readonly ProjectAssetKindFilter[] = [
  'all',
  'characterPart',
  'weapon',
  'material',
  'tile',
  'wall',
  'object3d',
];
export const PROJECT_ASSETS_PANEL_DEFAULT_LABELS: ProjectAssetsPanelLabels = {
  tabs: {
    assets: 'assets',
    materials: 'materials',
    scenes: 'scenes',
    prefabs: 'prefabs',
  },
  tabsAriaLabel: 'Project asset tabs',
  searchPlaceholder: 'Search project',
  searchAriaLabel: 'Search project assets',
  kindFilterAriaLabel: 'Asset kind filter',
  empty: 'No project items',
  statusItems: (count) => `${count} items`,
  statusFallback: 'unknown',
};
export const PROJECT_ASSETS_PANEL_DEFAULT_CLASSES: Record<ProjectAssetsPanelClassNameSlot, string> =
  {
    root: 'project-assets-panel',
    toolbar: 'project-assets-panel__toolbar',
    tabs: 'project-assets-panel__tabs',
    tab: 'project-assets-panel__tab',
    activeTab: 'active project-assets-panel__tab--active',
    searchInput: 'project-assets-panel__search',
    kindSelect: 'project-assets-panel__kind',
    status: 'project-assets-panel__status',
    statusCount: 'project-assets-panel__status-count',
    statusCatalog: 'project-assets-panel__status-catalog',
    list: 'project-assets-panel__list',
    empty: 'project-assets-panel__empty',
    item: 'project-assets-panel__item',
    activeItem: 'active project-assets-panel__item--active',
    thumb: 'project-assets-panel__thumb',
    itemMain: 'project-assets-panel__item-main',
    itemName: 'project-assets-panel__item-name',
    itemSubtitle: 'project-assets-panel__item-subtitle',
    badges: 'project-assets-panel__badges',
    badge: 'project-assets-panel__badge',
  };
