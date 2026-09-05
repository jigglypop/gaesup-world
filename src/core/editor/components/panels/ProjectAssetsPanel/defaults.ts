import type {
  ProjectAssetKindFilter,
  ProjectAssetPanelTabConfig,
  ProjectAssetsPanelClassNameSlot,
  ProjectAssetsPanelLabels,
} from './types';

export const PROJECT_ASSETS_PANEL_DEFAULT_TABS: readonly ProjectAssetPanelTabConfig[] = [
  { id: 'assets', label: '에셋' },
  { id: 'materials', label: '재질' },
  { id: 'scenes', label: '장면' },
  { id: 'prefabs', label: '프리팹' },
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
    assets: '에셋',
    materials: '재질',
    scenes: '장면',
    prefabs: '프리팹',
  },
  tabsAriaLabel: '프로젝트 항목 분류',
  searchPlaceholder: '프로젝트 검색',
  searchAriaLabel: '프로젝트 에셋 검색',
  kindFilterAriaLabel: '에셋 종류',
  empty: '프로젝트 항목이 없습니다',
  statusItems: (count) => `${count}개 항목`,
  statusFallback: '상태 확인 중',
};
export const PROJECT_ASSET_DISPLAY_LABELS: Readonly<Record<string, string>> = {
  all: '전체', characterPart: '캐릭터 부품', weapon: '무기', material: '재질',
  tile: '바닥', wall: '벽', object3d: '입체 소품', scene: '장면', prefab: '프리팹',
  body: '몸', hair: '머리카락', hat: '모자', top: '상의', bottom: '하의',
  shoes: '신발', face: '얼굴', shield: '방패', accessory: '장신구', glasses: '안경',
  seed: '기본 에셋', loading: '불러오는 중', loaded: '불러오기 완료', fallback: '기본 에셋 사용 중',
  starter: '기본', cloth: '의상', 'local-variant': '색상 변형', generated: '생성 에셋',
  placeholder: '임시 에셋', building: '건축', brick: '벽돌', wood: '목재', glass: '유리',
  prop: '소품', door: '문', window: '창문', fence: '울타리', lamp: '조명', chair: '의자',
  table: '탁자', bed: '침대', storage: '수납', mailbox: '우편함', crafting: '제작', shop: '상점', cc0: 'CC0',
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
