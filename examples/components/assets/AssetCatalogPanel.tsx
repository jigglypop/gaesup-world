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
  characterPart: 'Character',
  weapon: 'Weapon',
  material: 'Material',
  tile: 'Tile',
  wall: 'Wall',
  object3d: 'Object',
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
        <strong>Asset catalog</strong>
        <span className="asset-catalog-panel__hint">
          {catalogStatus.state} · {assets.length} assets
        </span>
      </header>
      <div className="asset-catalog-panel__filters">
        <button
          type="button"
          className={`asset-catalog-panel__filter${filter.kind ? '' : ' asset-catalog-panel__filter--active'}`}
          onClick={() => setFilter({})}
        >
          All
        </button>
        {ASSET_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`asset-catalog-panel__filter${filter.kind === kind ? ' asset-catalog-panel__filter--active' : ''}`}
            onClick={() => setFilter({ kind })}
          >
            {KIND_LABELS[kind]}
          </button>
        ))}
      </div>
      <div className="asset-catalog-panel__list">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className={`asset-catalog-panel__item${asset.id === selectedId ? ' asset-catalog-panel__item--active' : ''}`}
            onClick={() => selectAsset(asset.id === selectedId ? null : asset.id)}
          >
            <span>{asset.name}</span>
            <span className="asset-catalog-panel__hint">{KIND_LABELS[asset.kind]}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="asset-catalog-panel__detail">
          <AssetPreviewCanvas asset={selected} size={96} />
          <div className="asset-catalog-panel__detail-info">
            <strong>{selected.name}</strong>
            <span className="asset-catalog-panel__hint">{selected.id}</span>
            {selected.slot && (
              <span className="asset-catalog-panel__hint">slot: {selected.slot}</span>
            )}
            {selected.tags && (
              <span className="asset-catalog-panel__hint">{selected.tags.join(', ')}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
