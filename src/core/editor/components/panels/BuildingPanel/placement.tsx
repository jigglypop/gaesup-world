import React from 'react';

import {
  BUILDING_TILE_SHAPE_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WEATHER_EFFECT_OPTIONS,
  BUILDING_WORLD_SURFACE_OPTIONS,
  type BuildingWallKind,
  type TileShapeType,
  type BuildingWeatherEffect,
  type BuildingWorldSurface,
} from '../../../../building/types';
import { FieldColor, FieldRow, FieldToggle } from '../../fields';
export type BuildingPanelAction = {
  id: string;
  label: string;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
};

export function PanelActionsSection({ actions }: { actions: BuildingPanelAction[] }) {
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
}

export type EnvironmentSectionProps = {
  showSnow: boolean;
  setShowSnow: (show: boolean) => void;
  showFog: boolean;
  setShowFog: (show: boolean) => void;
  fogColor: string;
  setFogColor: (color: string) => void;
  weatherEffect: BuildingWeatherEffect;
  setWeatherEffect: (effect: BuildingWeatherEffect) => void;
  worldSurface: BuildingWorldSurface;
  setWorldSurface: (surface: BuildingWorldSurface) => void;
};

export function EnvironmentSection({
  showSnow,
  setShowSnow,
  showFog,
  setShowFog,
  fogColor,
  setFogColor,
  weatherEffect,
  setWeatherEffect,
  worldSurface,
  setWorldSurface,
}: EnvironmentSectionProps) {
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
          <span className="building-panel__info-label">Surface</span>
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
}

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

export type ObjectRotationSectionProps = {
  currentObjectRotation: number;
  setObjectRotation: (rotation: number) => void;
};

export function ObjectRotationSection({
  currentObjectRotation,
  setObjectRotation,
}: ObjectRotationSectionProps) {
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
}

export type RotationOption = {
  value: number;
  label: string;
};

export type PlacementSectionProps = {
  isTileMode: boolean;
  currentTileMultiplier: number;
  setTileMultiplier: (multiplier: number) => void;
  currentTileHeight: number;
  setTileHeight: (height: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snapToGrid: boolean) => void;
  currentTileShape: TileShapeType;
  setTileShape: (shape: TileShapeType) => void;
  currentTileRotation: number;
  setTileRotation: (rotation: number) => void;
  rotations: RotationOption[];
  selectedTileId: string | null;
  hasSelectedTileGroup: boolean;
  onDeleteSelectedTile: () => void;
};

export function PlacementSection({
  isTileMode,
  currentTileMultiplier,
  setTileMultiplier,
  currentTileHeight,
  setTileHeight,
  snapToGrid,
  setSnapToGrid,
  currentTileShape,
  setTileShape,
  currentTileRotation,
  setTileRotation,
  rotations,
  selectedTileId,
  hasSelectedTileGroup,
  onDeleteSelectedTile,
}: PlacementSectionProps) {
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
            {snapToGrid ? 'ON' : 'OFF'}
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
      {isTileMode && (
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
            {rotations.map((rotation) => (
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
              disabled={!selectedTileId || !hasSelectedTileGroup}
              onClick={onDeleteSelectedTile}
            >
              선택 타일 삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export type BlockEditSectionProps = {
  currentTileMultiplier: number;
  currentTileHeight: number;
  selectedBlockId: string | null;
  onDeleteSelectedBlock: () => void;
};

export function BlockEditSection({
  currentTileMultiplier,
  currentTileHeight,
  selectedBlockId,
  onDeleteSelectedBlock,
}: BlockEditSectionProps) {
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
          onClick={onDeleteSelectedBlock}
        >
          선택 박스 삭제
        </button>
      </div>
    </div>
  );
}

export type WallModuleSectionProps = {
  currentWallKind: BuildingWallKind;
  currentWallKindLabel: string;
  setWallKind: (kind: BuildingWallKind) => void;
  currentWallRotation: number;
  setWallRotation: (rotation: number) => void;
  rotations: RotationOption[];
  selectedWallId: string | null;
  hasSelectedWallGroup: boolean;
  onFlipSelectedWall: () => void;
  onDeleteSelectedWall: () => void;
};

export function WallModuleSection({
  currentWallKind,
  currentWallKindLabel,
  setWallKind,
  currentWallRotation,
  setWallRotation,
  rotations,
  selectedWallId,
  hasSelectedWallGroup,
  onFlipSelectedWall,
  onDeleteSelectedWall,
}: WallModuleSectionProps) {
  return (
    <div className="building-panel__section">
      <div className="building-panel__section-title">벽 모듈 / 회전 / 삭제</div>
      <div className="building-panel__section-subtitle">벽 모듈: {currentWallKindLabel}</div>
      <div className="building-panel__grid">
        {BUILDING_WALL_KIND_OPTIONS.map((kind) => (
          <button
            key={kind.type}
            className={`building-panel__grid-btn ${currentWallKind === kind.type ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() => setWallKind(kind.type)}
          >
            {kind.labelKo}
          </button>
        ))}
      </div>
      <div className="building-panel__segmented">
        {rotations.map((rotation) => (
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
          disabled={!selectedWallId || !hasSelectedWallGroup}
          onClick={onFlipSelectedWall}
        >
          내외부 뒤집기
        </button>
        <button
          className="building-panel__delete-button"
          disabled={!selectedWallId || !hasSelectedWallGroup}
          onClick={onDeleteSelectedWall}
        >
          선택 벽 삭제
        </button>
      </div>
    </div>
  );
}

