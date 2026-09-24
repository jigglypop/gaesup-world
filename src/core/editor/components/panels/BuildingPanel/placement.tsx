import React from 'react';

import { useBuildingFields, useTileTarget, useWallTarget } from './state';
import { useBuildingStore, useBuildingStoreApi } from '../../../../building/stores/buildingStore';
import {
  BUILDING_TILE_SHAPE_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WEATHER_EFFECT_OPTIONS,
  BUILDING_WORLD_SURFACE_OPTIONS,
} from '../../../../building/types';
import { FieldColor, FieldRow, FieldToggle } from '../../fields';
export type BuildingPanelAction = {
  id: string;
  label: string;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
};

export const PanelActionsSection = React.memo(function PanelActionsSection({ actions }: { actions: BuildingPanelAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">커스텀 액션</div>
      <div className="building-panel__segmented">
        {actions.map((action) => (
          <button
            key={action.id}
            className="building-panel__segment-btn"
            disabled={action.disabled}
            onClick={() => {
              void action.onClick();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
});

const ENVIRONMENT_FIELDS = ['showSnow', 'showFog', 'fogColor', 'weatherEffect', 'worldSurface'] as const;

export const EnvironmentSection = React.memo(function EnvironmentSection() {
  const { showSnow, showFog, fogColor, weatherEffect, worldSurface } = useBuildingFields(ENVIRONMENT_FIELDS);
  const { setShowSnow, setShowFog, setFogColor, setWeatherEffect, setWorldSurface } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">전역 환경</div>
      <div className="building-panel__info">
        <FieldRow label="눈">
          <FieldToggle value={showSnow} onChange={setShowSnow} />
        </FieldRow>
        <FieldRow label="안개">
          <FieldToggle value={showFog} onChange={setShowFog} />
        </FieldRow>
        <FieldRow label="안개색">
          <FieldColor value={fogColor} onChange={setFogColor} />
        </FieldRow>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">표면</span>
          <div className="building-panel__segmented">
            {BUILDING_WORLD_SURFACE_OPTIONS.map((option) => (
              <button
                key={option.type}
                className={`building-panel__segment-btn ${worldSurface === option.type ? 'building-panel__segment-btn--active' : ''}`}
                onClick={() => setWorldSurface(option.type)}
              >
                {option.labelKo}
              </button>
            ))}
          </div>
        </div>
        <div className="building-panel__info-item" style={{ alignItems: 'flex-start' }}>
          <span className="building-panel__info-label">날씨</span>
          <div className="building-panel__grid" style={{ display: 'flex' }}>
            {BUILDING_WEATHER_EFFECT_OPTIONS.map((option) => (
              <button
                key={option.type}
                className={`building-panel__grid-btn ${weatherEffect === option.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => setWeatherEffect(option.type)}
              >
                {option.labelKo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const OBJECT_ROTATIONS = [
  0,
  Math.PI / 4,
  Math.PI / 2,
  Math.PI * 0.75,
  Math.PI,
  Math.PI * 1.25,
  Math.PI * 1.5,
  Math.PI * 1.75,
];

export const ObjectRotationSection = React.memo(function ObjectRotationSection() {
  const currentObjectRotation = useBuildingStore((state) => state.currentObjectRotation);
  const { setObjectRotation } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">오브젝트 회전</div>
      <div className="building-panel__grid">
        {OBJECT_ROTATIONS.map((rotation, index) => (
          <button
            key={rotation}
            className={`building-panel__grid-btn ${Math.abs(currentObjectRotation - rotation) < 0.01 ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setObjectRotation(rotation)}
          >
            {index * 45}
          </button>
        ))}
      </div>
    </div>
  );
});

const ROTATIONS = [
  { value: 0, label: '0도' },
  { value: Math.PI / 2, label: '90도' },
  { value: Math.PI, label: '180도' },
  { value: Math.PI * 1.5, label: '270도' },
];

const PLACEMENT_FIELDS = ['currentTileMultiplier', 'currentTileHeight', 'snapToGrid'] as const;

export const PlacementSection = React.memo(function PlacementSection({ isTileMode }: { isTileMode: boolean }) {
  const { currentTileMultiplier, currentTileHeight, snapToGrid } = useBuildingFields(PLACEMENT_FIELDS);
  const { setTileMultiplier, setTileHeight, setSnapToGrid } = useBuildingStoreApi().getState();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">배치 설정</div>
      <div className="building-panel__info">
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">크기</span>
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
          <span className="building-panel__info-label">격자 맞춤</span>
          <button
            className={`building-panel__toggle ${snapToGrid ? 'building-panel__toggle--on' : ''}`}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            {snapToGrid ? '켜짐' : '꺼짐'}
          </button>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">높이</span>
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
      {isTileMode && <TileShapeOptions />}
    </div>
  );
});

const TILE_SHAPE_FIELDS = ['currentTileShape', 'currentTileRotation', 'selectedTileId'] as const;

// Split from PlacementSection so tile edits, which move the selected tile's group, re-render only this part.
const TileShapeOptions = React.memo(function TileShapeOptions() {
  const { currentTileShape, currentTileRotation, selectedTileId } = useBuildingFields(TILE_SHAPE_FIELDS);
  const { group } = useTileTarget();
  const store = useBuildingStoreApi();
  const { setTileShape, setTileRotation } = store.getState();
  return (
    <>
      <div className="building-panel__section-subtitle">타일 형태</div>
      <div className="building-panel__grid">
        {BUILDING_TILE_SHAPE_OPTIONS.map((shape) => (
          <button
            key={shape.type}
            className={`building-panel__grid-btn ${currentTileShape === shape.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setTileShape(shape.type)}
          >
            {shape.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__section-subtitle">타일 회전</div>
      <div className="building-panel__segmented">
        {ROTATIONS.map((rotation) => (
          <button
            key={rotation.value}
            className={`building-panel__segment-btn ${Math.abs(currentTileRotation - rotation.value) < 0.0001 ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => setTileRotation(rotation.value)}
          >
            {rotation.label}
          </button>
        ))}
      </div>
      <div className="building-panel__delete-card">
        <div>
          <strong>선택한 타일</strong>
          <span>
            {selectedTileId ? `ID: ${selectedTileId}` : '타일 하이라이트를 클릭해 선택하세요'}
          </span>
        </div>
        <button
          className="building-panel__delete-button"
          disabled={!selectedTileId || !group}
          onClick={() => {
            if (selectedTileId && group) store.getState().removeTile(group.id, selectedTileId);
          }}
        >
          선택 타일 삭제
        </button>
      </div>
    </>
  );
});

const BLOCK_FIELDS = ['currentTileMultiplier', 'currentTileHeight', 'selectedBlockId'] as const;

export const BlockEditSection = React.memo(function BlockEditSection() {
  const { currentTileMultiplier, currentTileHeight, selectedBlockId } = useBuildingFields(BLOCK_FIELDS);
  const store = useBuildingStoreApi();
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">박스 편집</div>
      <div className="building-panel__info">
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">박스 크기</span>
          <span className="building-panel__info-value">
            {currentTileMultiplier} x {currentTileMultiplier}
          </span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">쌓기 높이</span>
          <span className="building-panel__info-value">{currentTileHeight}</span>
        </div>
      </div>
      <div className="building-panel__delete-card">
        <div>
          <strong>선택한 박스</strong>
          <span>
            {selectedBlockId ? `ID: ${selectedBlockId}` : '박스 하이라이트를 클릭해 선택하세요'}
          </span>
        </div>
        <button
          className="building-panel__delete-button"
          disabled={!selectedBlockId}
          onClick={() => {
            if (selectedBlockId) store.getState().removeBlock(selectedBlockId);
          }}
        >
          선택 박스 삭제
        </button>
      </div>
    </div>
  );
});

const WALL_MODULE_FIELDS = ['currentWallKind', 'currentWallRotation', 'selectedWallId'] as const;

export const WallModuleSection = React.memo(function WallModuleSection() {
  const { currentWallKind, currentWallRotation, selectedWallId } = useBuildingFields(WALL_MODULE_FIELDS);
  const { group, wall } = useWallTarget();
  const store = useBuildingStoreApi();
  const { setWallKind, setWallRotation } = store.getState();
  const wallKind = wall?.wallKind ?? currentWallKind;
  const wallKindLabel = BUILDING_WALL_KIND_OPTIONS.find((kind) => kind.type === wallKind)?.labelKo ?? currentWallKind;
  const canEditSelectedWall = Boolean(selectedWallId && group);
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">벽 모듈 / 회전 / 삭제</div>
      <div className="building-panel__section-subtitle">벽 모듈: {wallKindLabel}</div>
      <div className="building-panel__grid">
        {BUILDING_WALL_KIND_OPTIONS.map((kind) => (
          <button
            key={kind.type}
            className={`building-panel__grid-btn ${wallKind === kind.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setWallKind(kind.type)}
          >
            {kind.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__segmented">
        {ROTATIONS.map((rotation) => (
          <button
            key={rotation.value}
            className={`building-panel__segment-btn ${Math.abs(currentWallRotation - rotation.value) < 0.0001 ? 'building-panel__segment-btn--active' : ''}`}
            onClick={() => setWallRotation(rotation.value)}
          >
            {rotation.label}
          </button>
        ))}
      </div>
      <div className="building-panel__delete-card">
        <div>
          <strong>선택한 벽</strong>
          <span>{selectedWallId ? `ID: ${selectedWallId}` : '벽 마커를 클릭해 선택하세요'}</span>
        </div>
        <button
          className="building-panel__delete-button"
          disabled={!canEditSelectedWall}
          onClick={() => {
            if (selectedWallId && group) store.getState().updateWall(group.id, selectedWallId, { flipSides: !wall?.flipSides });
          }}
        >
          내외부 뒤집기
        </button>
        <button
          className="building-panel__delete-button"
          disabled={!canEditSelectedWall}
          onClick={() => {
            if (selectedWallId && group) store.getState().removeWall(group.id, selectedWallId);
          }}
        >
          선택 벽 삭제
        </button>
      </div>
    </div>
  );
});
