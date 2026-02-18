import React, { FC } from 'react';

import { FLAG_STYLE_META, FlagStyle, TileObjectType } from '../../../../building/types';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import './styles.css';

const FLAG_STYLES = Object.entries(FLAG_STYLE_META) as [FlagStyle, typeof FLAG_STYLE_META[FlagStyle]][];

const BILLBOARD_COLORS = [
  { value: '#00ff88', label: 'Green' },
  { value: '#00aaff', label: 'Blue' },
  { value: '#ff3333', label: 'Red' },
  { value: '#ffffff', label: 'White' },
  { value: '#ffdd00', label: 'Yellow' },
];

export const BuildingPanel: FC = () => {
  const editMode = useBuildingStore((state) => state.editMode);
  const setEditMode = useBuildingStore((state) => state.setEditMode);
  const currentTileMultiplier = useBuildingStore((state) => state.currentTileMultiplier);
  const setTileMultiplier = useBuildingStore((state) => state.setTileMultiplier);
  const selectedTileObjectType = useBuildingStore((state) => state.selectedTileObjectType);
  const setSelectedTileObjectType = useBuildingStore((state) => state.setSelectedTileObjectType);
  const snapToGrid = useBuildingStore((state) => state.snapToGrid);
  const setSnapToGrid = useBuildingStore((state) => state.setSnapToGrid);
  const currentFlagWidth = useBuildingStore((state) => state.currentFlagWidth);
  const currentFlagHeight = useBuildingStore((state) => state.currentFlagHeight);
  const currentFlagImageUrl = useBuildingStore((state) => state.currentFlagImageUrl);
  const setFlagWidth = useBuildingStore((state) => state.setFlagWidth);
  const setFlagHeight = useBuildingStore((state) => state.setFlagHeight);
  const setFlagImageUrl = useBuildingStore((state) => state.setFlagImageUrl);
  const currentFlagStyle = useBuildingStore((state) => state.currentFlagStyle);
  const setFlagStyle = useBuildingStore((state) => state.setFlagStyle);
  const currentFireIntensity = useBuildingStore((state) => state.currentFireIntensity);
  const setFireIntensity = useBuildingStore((state) => state.setFireIntensity);
  const currentBillboardText = useBuildingStore((state) => state.currentBillboardText);
  const currentBillboardImageUrl = useBuildingStore((state) => state.currentBillboardImageUrl);
  const currentBillboardColor = useBuildingStore((state) => state.currentBillboardColor);
  const setBillboardText = useBuildingStore((state) => state.setBillboardText);
  const setBillboardImageUrl = useBuildingStore((state) => state.setBillboardImageUrl);
  const setBillboardColor = useBuildingStore((state) => state.setBillboardColor);
  const showSnow = useBuildingStore((state) => state.showSnow);
  const setShowSnow = useBuildingStore((state) => state.setShowSnow);

  const editModes: { type: typeof editMode; label: string; description: string }[] = [
    { type: 'none', label: 'None', description: 'No building mode' },
    { type: 'wall', label: 'Wall', description: 'Place wall segments' },
    { type: 'tile', label: 'Tile', description: 'Place floor tiles' },
    { type: 'npc', label: 'NPC', description: 'Place NPC entities' },
  ];

  const objectTypes: { type: TileObjectType; label: string }[] = [
    { type: 'none', label: 'None' },
    { type: 'grass', label: 'Grass' },
    { type: 'water', label: 'Water' },
    { type: 'flag', label: 'Flag' },
    { type: 'fire', label: 'Fire' },
    { type: 'billboard', label: 'Billboard' },
  ];

  return (
    <div className="building-panel">
      <div className="building-panel__section">
        <div className="building-panel__section-title">Edit Mode</div>
        <div className="building-panel__modes">
          {editModes.map((m) => (
            <button
              key={m.type}
              className={`building-panel__mode-btn ${editMode === m.type ? 'building-panel__mode-btn--active' : ''}`}
              onClick={() => setEditMode(m.type)}
            >
              <span className="building-panel__mode-label">{m.label}</span>
              <span className="building-panel__mode-desc">{m.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="building-panel__section">
        <div className="building-panel__section-title">Tile Object</div>
        <div className="building-panel__grid">
          {objectTypes.map((t) => (
            <button
              key={t.type}
              className={`building-panel__grid-btn ${selectedTileObjectType === t.type ? 'building-panel__grid-btn--active' : ''}`}
              onClick={() => setSelectedTileObjectType(t.type)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="building-panel__section">
        <div className="building-panel__section-title">Tile Settings</div>
        <div className="building-panel__info">
          <div className="building-panel__info-item">
            <span className="building-panel__info-label">Size</span>
            <div className="building-panel__stepper">
              <button
                className="building-panel__stepper-btn"
                onClick={() => setTileMultiplier(Math.max(1, currentTileMultiplier - 1))}
              >
                -
              </button>
              <span className="building-panel__stepper-value">{currentTileMultiplier}</span>
              <button
                className="building-panel__stepper-btn"
                onClick={() => setTileMultiplier(Math.min(4, currentTileMultiplier + 1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="building-panel__info-item">
            <span className="building-panel__info-label">Snap to Grid</span>
            <button
              className={`building-panel__toggle ${snapToGrid ? 'building-panel__toggle--on' : ''}`}
              onClick={() => setSnapToGrid(!snapToGrid)}
            >
              {snapToGrid ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className="building-panel__section">
        <div className="building-panel__section-title">Effects</div>
        <div className="building-panel__info">
          <div className="building-panel__info-item">
            <span className="building-panel__info-label">Snow</span>
            <button
              className={`building-panel__toggle ${showSnow ? 'building-panel__toggle--on' : ''}`}
              onClick={() => setShowSnow(!showSnow)}
            >
              {showSnow ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {selectedTileObjectType === 'fire' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Fire Settings</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Intensity</span>
              <div className="building-panel__stepper">
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFireIntensity(Math.max(0.5, currentFireIntensity - 0.5))}
                >
                  -
                </button>
                <span className="building-panel__stepper-value">{currentFireIntensity.toFixed(1)}</span>
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFireIntensity(Math.min(3.0, currentFireIntensity + 0.5))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTileObjectType === 'billboard' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Billboard Settings</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">Text</span>
              <input
                type="text"
                value={currentBillboardText}
                onChange={(e) => setBillboardText(e.target.value)}
                placeholder="Display text..."
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: '11px',
                  background: 'var(--panel-bg, #1a1a2e)',
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '3px',
                  color: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">Image URL</span>
              <input
                type="text"
                value={currentBillboardImageUrl}
                onChange={(e) => setBillboardImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: '11px',
                  background: 'var(--panel-bg, #1a1a2e)',
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '3px',
                  color: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">Color</span>
              <div className="building-panel__grid">
                {BILLBOARD_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`building-panel__grid-btn ${currentBillboardColor === c.value ? 'building-panel__grid-btn--active' : ''}`}
                    onClick={() => setBillboardColor(c.value)}
                    style={{ borderBottom: `3px solid ${c.value}` }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTileObjectType === 'flag' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Flag Settings</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">Style</span>
              <div className="building-panel__grid">
                {FLAG_STYLES.map(([key, meta]) => (
                  <button
                    key={key}
                    className={`building-panel__grid-btn ${currentFlagStyle === key ? 'building-panel__grid-btn--active' : ''}`}
                    onClick={() => setFlagStyle(key)}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Width</span>
              <div className="building-panel__stepper">
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFlagWidth(Math.max(0.5, currentFlagWidth - 0.5))}
                >
                  -
                </button>
                <span className="building-panel__stepper-value">{currentFlagWidth}m</span>
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFlagWidth(Math.min(8, currentFlagWidth + 0.5))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Height</span>
              <div className="building-panel__stepper">
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFlagHeight(Math.max(0.5, currentFlagHeight - 0.5))}
                >
                  -
                </button>
                <span className="building-panel__stepper-value">{currentFlagHeight}m</span>
                <button
                  className="building-panel__stepper-btn"
                  onClick={() => setFlagHeight(Math.min(6, currentFlagHeight + 0.5))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">Image URL</span>
              <input
                type="text"
                value={currentFlagImageUrl}
                onChange={(e) => setFlagImageUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: '11px',
                  background: 'var(--panel-bg, #1a1a2e)',
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '3px',
                  color: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="building-panel__info" style={{ marginTop: 'auto' }}>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">Current Mode</span>
          <span className="building-panel__info-value">{editMode}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">Object Type</span>
          <span className="building-panel__info-value">{selectedTileObjectType}</span>
        </div>
      </div>
    </div>
  );
};
