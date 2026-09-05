import { useMemo } from 'react';

import {
  AssetPreviewCanvas,
  useAssetStore,
  type AssetKind,
  type AssetRecord,
} from 'gaesup-world/assets';

import type { AssetCatalogPanelProps } from './types';
import './styles.css';

const ASSET_KINDS: AssetKind[] = [
  'characterPart',
  'weapon',
  'material',
  'tile',
  'wall',
  'object3d',
];
const KIND_LABELS: Record<AssetKind, string> = {
  characterPart: '캐릭터',
  weapon: '무기',
  material: '재질',
  tile: '바닥',
  wall: '벽',
  object3d: '소품',
};

const STATUS_LABELS = {
  seed: '기본 에셋',
  loading: '불러오는 중',
  loaded: '불러오기 완료',
  fallback: '기본 에셋 사용 중',
};

const SLOT_LABELS: Record<NonNullable<AssetRecord['slot']>, string> = {
  body: '몸',
  hair: '머리카락',
  hat: '모자',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  face: '얼굴',
  weapon: '무기',
  shield: '방패',
  accessory: '장신구',
  glasses: '안경',
};

const TAG_LABELS: Record<string, string> = {
  ...SLOT_LABELS,
  starter: '기본',
  cloth: '의상',
  'local-variant': '색상 변형',
  generated: '생성 에셋',
  placeholder: '임시 에셋',
  building: '건축',
  wall: '벽',
  brick: '벽돌',
  tile: '바닥',
  wood: '목재',
  material: '재질',
  glass: '유리',
  prop: '소품',
  door: '문',
  window: '창문',
  fence: '울타리',
  lamp: '조명',
  chair: '의자',
  table: '탁자',
  bed: '침대',
  storage: '수납',
  mailbox: '우편함',
  crafting: '제작',
  shop: '상점',
  cc0: 'CC0',
};

export function AssetCatalogPanel({ mode = 'overlay' }: AssetCatalogPanelProps) {
  const records = useAssetStore((state) => state.records);
  const ids = useAssetStore((state) => state.ids);
  const filter = useAssetStore((state) => state.filter);
  const selectedId = useAssetStore((state) => state.selectedId);
  const catalogStatus = useAssetStore((state) => state.catalogStatus);
  const setFilter = useAssetStore((state) => state.setFilter);
  const selectAsset = useAssetStore((state) => state.selectAsset);
  const assets = useMemo(
    () =>
      ids
        .map((id) => records[id])
        .filter((asset): asset is AssetRecord => Boolean(asset))
        .filter((asset) => !filter.kind || asset.kind === filter.kind),
    [filter.kind, ids, records],
  );
  const selected = selectedId ? records[selectedId] : undefined;
  return (
    <section className={`asset-catalog-panel asset-catalog-panel--${mode}`}>
      <header className="asset-catalog-panel__header">
        <strong>에셋 목록</strong>
        <span className="asset-catalog-panel__hint">
          {STATUS_LABELS[catalogStatus.state]} · {assets.length}개
        </span>
      </header>
      <div className="asset-catalog-panel__filters" role="group" aria-label="에셋 종류">
        <button
          type="button"
          aria-pressed={!filter.kind}
          className={`asset-catalog-panel__filter${filter.kind ? '' : ' asset-catalog-panel__filter--active'}`}
          onClick={() => setFilter({})}
        >
          전체
        </button>
        {ASSET_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={filter.kind === kind}
            className={`asset-catalog-panel__filter${filter.kind === kind ? ' asset-catalog-panel__filter--active' : ''}`}
            onClick={() => setFilter({ kind })}
          >
            {KIND_LABELS[kind]}
          </button>
        ))}
      </div>
      <div className="asset-catalog-panel__list">
        {assets.length === 0 && (
          <p className="asset-catalog-panel__empty" role="status">
            {catalogStatus.state === 'loading'
              ? '에셋을 불러오고 있습니다.'
              : filter.kind
                ? '이 종류의 에셋이 없습니다. 다른 종류나 전체 목록을 선택하세요.'
                : '아직 등록된 에셋이 없습니다.'}
          </p>
        )}
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            aria-pressed={asset.id === selectedId}
            className={`asset-catalog-panel__item${asset.id === selectedId ? ' asset-catalog-panel__item--active' : ''}`}
            onClick={() => selectAsset(asset.id === selectedId ? null : asset.id)}
          >
            <span>{asset.name}</span>
            <span className="asset-catalog-panel__hint">{KIND_LABELS[asset.kind]}</span>
          </button>
        ))}
      </div>
      {selected && (
        <section className="asset-catalog-panel__detail" aria-label="선택한 에셋">
          <AssetPreviewCanvas asset={selected} size={96} />
          <div className="asset-catalog-panel__detail-info">
            <strong>{selected.name}</strong>
            {selected.slot && (
              <span className="asset-catalog-panel__hint">
                장착 부위: {SLOT_LABELS[selected.slot]}
              </span>
            )}
            {selected.tags && (
              <span className="asset-catalog-panel__hint">
                {selected.tags.map((tag) => TAG_LABELS[tag] ?? tag).join(', ')}
              </span>
            )}
          </div>
          <button
            type="button"
            className="asset-catalog-panel__filter asset-catalog-panel__close"
            onClick={() => selectAsset(null)}
          >
            선택 해제
          </button>
        </section>
      )}
    </section>
  );
}
