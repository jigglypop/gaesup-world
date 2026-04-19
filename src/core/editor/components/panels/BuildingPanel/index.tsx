import React, { FC } from 'react';

import { FLAG_STYLE_META, FlagStyle, TileObjectType, PlacedObjectType, TileShapeType } from '../../../../building/types';
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
  const currentTileHeight = useBuildingStore((state) => state.currentTileHeight);
  const setTileHeight = useBuildingStore((state) => state.setTileHeight);
  const currentTileShape = useBuildingStore((state) => state.currentTileShape);
  const setTileShape = useBuildingStore((state) => state.setTileShape);
  const currentTileRotation = useBuildingStore((state) => state.currentTileRotation);
  const setTileRotation = useBuildingStore((state) => state.setTileRotation);
  const selectedTileObjectType = useBuildingStore((state) => state.selectedTileObjectType);
  const setSelectedTileObjectType = useBuildingStore((state) => state.setSelectedTileObjectType);
  const selectedPlacedObjectType = useBuildingStore((state) => state.selectedPlacedObjectType);
  const setSelectedPlacedObjectType = useBuildingStore((state) => state.setSelectedPlacedObjectType);
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
  const currentFireWidth = useBuildingStore((state) => state.currentFireWidth);
  const currentFireHeight = useBuildingStore((state) => state.currentFireHeight);
  const currentFireColor = useBuildingStore((state) => state.currentFireColor);
  const setFireIntensity = useBuildingStore((state) => state.setFireIntensity);
  const setFireWidth = useBuildingStore((state) => state.setFireWidth);
  const setFireHeight = useBuildingStore((state) => state.setFireHeight);
  const setFireColor = useBuildingStore((state) => state.setFireColor);
  const currentObjectRotation = useBuildingStore((state) => state.currentObjectRotation);
  const setObjectRotation = useBuildingStore((state) => state.setObjectRotation);
  const selectedTileGroupId = useBuildingStore((state) => state.selectedTileGroupId);
  const tileGroups = useBuildingStore((state) => state.tileGroups);
  const meshes = useBuildingStore((state) => state.meshes);
  const updateMesh = useBuildingStore((state) => state.updateMesh);
  const currentBillboardText = useBuildingStore((state) => state.currentBillboardText);
  const currentBillboardImageUrl = useBuildingStore((state) => state.currentBillboardImageUrl);
  const currentBillboardColor = useBuildingStore((state) => state.currentBillboardColor);
  const setBillboardText = useBuildingStore((state) => state.setBillboardText);
  const setBillboardImageUrl = useBuildingStore((state) => state.setBillboardImageUrl);
  const setBillboardColor = useBuildingStore((state) => state.setBillboardColor);
  const currentObjectPrimaryColor = useBuildingStore((state) => state.currentObjectPrimaryColor);
  const currentObjectSecondaryColor = useBuildingStore((state) => state.currentObjectSecondaryColor);
  const setObjectPrimaryColor = useBuildingStore((state) => state.setObjectPrimaryColor);
  const setObjectSecondaryColor = useBuildingStore((state) => state.setObjectSecondaryColor);
  const showSnow = useBuildingStore((state) => state.showSnow);
  const setShowSnow = useBuildingStore((state) => state.setShowSnow);

  const editModes: { type: typeof editMode; label: string; description: string }[] = [
    { type: 'none', label: 'None', description: 'No building mode' },
    { type: 'wall', label: 'Wall', description: 'Place wall segments' },
    { type: 'tile', label: 'Tile', description: 'Place floor tiles' },
    { type: 'object', label: 'Object', description: 'Place objects on tiles' },
    { type: 'npc', label: 'NPC', description: 'Place NPC entities' },
  ];

  const coverTypes: { type: TileObjectType; label: string }[] = [
    { type: 'none', label: 'None' },
    { type: 'grass', label: 'Grass' },
    { type: 'water', label: 'Water' },
    { type: 'sand', label: 'Sand' },
    { type: 'snowfield', label: 'Snowfield' },
  ];

  const placedObjectTypes: { type: PlacedObjectType | 'none'; label: string }[] = [
    { type: 'none', label: 'None' },
    { type: 'sakura', label: 'Sakura' },
    { type: 'flag', label: 'Flag' },
    { type: 'fire', label: 'Fire' },
    { type: 'billboard', label: 'Billboard' },
  ];

  const tileShapes: { type: TileShapeType; label: string }[] = [
    { type: 'box', label: 'Box' },
    { type: 'stairs', label: 'Stairs' },
    { type: 'round', label: 'Round' },
    { type: 'ramp', label: 'Ramp' },
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

      {(editMode === 'tile' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Terrain Cover</div>
          <div className="building-panel__grid">
            {coverTypes.map((t) => (
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
      )}

      {(editMode === 'object' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Placed Object</div>
          <div className="building-panel__grid">
            {placedObjectTypes.map((t) => (
              <button
                key={t.type}
                className={`building-panel__grid-btn ${selectedPlacedObjectType === t.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setSelectedPlacedObjectType(t.type)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <div className="building-panel__info-item">
            <span className="building-panel__info-label">Height</span>
            <div className="building-panel__stepper">
              <button
                className="building-panel__stepper-btn"
                onClick={() => setTileHeight(Math.max(0, currentTileHeight - 1))}
              >
                -
              </button>
              <span className="building-panel__stepper-value">{currentTileHeight}</span>
              <button
                className="building-panel__stepper-btn"
                onClick={() => setTileHeight(Math.min(6, currentTileHeight + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="building-panel__grid" style={{ marginTop: '8px' }}>
          {tileShapes.map((shape) => (
            <button
              key={shape.type}
              className={`building-panel__grid-btn ${currentTileShape === shape.type ? 'building-panel__grid-btn--active' : ''}`}
              onClick={() => setTileShape(shape.type)}
            >
              {shape.label}
            </button>
          ))}
        </div>
        <div className="building-panel__grid" style={{ marginTop: '8px' }}>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation, index) => (
            <button
              key={rotation}
              className={`building-panel__grid-btn ${Math.abs(currentTileRotation - rotation) < 0.0001 ? 'building-panel__grid-btn--active' : ''}`}
              onClick={() => setTileRotation(rotation)}
            >
              {index * 90}
            </button>
          ))}
        </div>
      </div>

      {editMode === 'tile' && selectedTileGroupId && (() => {
        const tileGroup = tileGroups.get(selectedTileGroupId);
        const floorMesh = tileGroup ? meshes.get(tileGroup.floorMeshId) : undefined;
        return floorMesh ? (
          <div className="building-panel__section">
            <div className="building-panel__section-title">Tile Color</div>
            <div className="building-panel__info">
              <div className="building-panel__info-item">
                <span className="building-panel__info-label">Color</span>
                <input
                  type="color"
                  value={floorMesh.color || '#888888'}
                  onChange={(e) => updateMesh(floorMesh.id, { color: e.target.value })}
                  style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{floorMesh.color || '#888888'}</span>
              </div>
            </div>
          </div>
        ) : null;
      })()}

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

      {editMode === 'object' && selectedPlacedObjectType !== 'none' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Object Rotation</div>
          <div className="building-panel__grid">
            {[0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75].map((rot, i) => (
              <button
                key={rot}
                className={`building-panel__grid-btn ${Math.abs(currentObjectRotation - rot) < 0.01 ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setObjectRotation(rot)}
              >
                {i * 45}
              </button>
            ))}
          </div>
        </div>
      )}

      {editMode === 'object' && selectedPlacedObjectType === 'sakura' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Sakura Color</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Blossom</span>
              <input
                type="color"
                value={currentObjectPrimaryColor}
                onChange={(e) => setObjectPrimaryColor(e.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentObjectPrimaryColor}</span>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Bark</span>
              <input
                type="color"
                value={currentObjectSecondaryColor}
                onChange={(e) => setObjectSecondaryColor(e.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentObjectSecondaryColor}</span>
            </div>
          </div>
        </div>
      )}

      {selectedPlacedObjectType === 'fire' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">Fire Settings</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Intensity</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireIntensity(Math.max(0.5, currentFireIntensity - 0.5))}>-</button>
                <span className="building-panel__stepper-value">{currentFireIntensity.toFixed(1)}</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireIntensity(Math.min(3.0, currentFireIntensity + 0.5))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Width</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireWidth(Math.max(0.3, currentFireWidth - 0.2))}>-</button>
                <span className="building-panel__stepper-value">{currentFireWidth.toFixed(1)}m</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireWidth(Math.min(4.0, currentFireWidth + 0.2))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Height</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireHeight(Math.max(0.5, currentFireHeight - 0.3))}>-</button>
                <span className="building-panel__stepper-value">{currentFireHeight.toFixed(1)}m</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireHeight(Math.min(5.0, currentFireHeight + 0.3))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Color</span>
              <input
                type="color"
                value={currentFireColor}
                onChange={(e) => setFireColor(e.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentFireColor}</span>
            </div>
          </div>
        </div>
      )}

      {selectedPlacedObjectType === 'billboard' && (
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

      {selectedPlacedObjectType === 'flag' && (
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
          <span className="building-panel__info-label">Terrain Cover</span>
          <span className="building-panel__info-value">{selectedTileObjectType}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">Object</span>
          <span className="building-panel__info-value">{selectedPlacedObjectType}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">Tile Height</span>
          <span className="building-panel__info-value">{currentTileHeight}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">Tile Shape</span>
          <span className="building-panel__info-value">{currentTileShape}</span>
        </div>
      </div>
    </div>
  );
};
