import React, { FC, useMemo } from 'react';

import {
  AssetPreviewCanvas,
  createScopedAssetMeshConfig,
  createScopedBuildingMeshId,
  type AssetRecord,
  useAssetStore,
} from '../../../../assets';
import { DEFAULT_BUILDING_OBJECT_CATALOG, getDefaultBuildingObject } from '../../../../building/catalog';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import { FLAG_STYLE_META, FlagStyle, TileObjectType, PlacedObjectType, TileShapeType, type MeshConfig } from '../../../../building/types';
import './styles.css';

const FLAG_STYLES = Object.entries(FLAG_STYLE_META) as [FlagStyle, typeof FLAG_STYLE_META[FlagStyle]][];

const BILLBOARD_COLORS = [
  { value: '#00ff88', label: '초록' },
  { value: '#00aaff', label: '파랑' },
  { value: '#f59e0b', label: '앰버' },
  { value: '#ffffff', label: '흰색' },
  { value: '#ffdd00', label: '노랑' },
];

const isBuildingMaterialAsset = (asset: AssetRecord) =>
  asset.kind === 'material' || asset.kind === 'wall' || asset.kind === 'tile';

export function createPlacementAssetScopeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createScopedColorMeshConfig(id: string, color: string, base?: MeshConfig): MeshConfig {
  const { mapTextureUrl: _mapTextureUrl, textureUrl: _textureUrl, materialParams, ...baseWithoutTexture } = base ?? {};
  void _mapTextureUrl;
  void _textureUrl;
  return {
    ...baseWithoutTexture,
    id,
    color,
    material: 'STANDARD',
    materialParams: {
      ...(materialParams ?? {}),
      color,
    },
  };
}

export const BuildingPanel: FC = () => {
  const editMode = useBuildingStore((state) => state.editMode);
  const setEditMode = useBuildingStore((state) => state.setEditMode);
  const selectedWallId = useBuildingStore((state) => state.selectedWallId);
  const selectedTileId = useBuildingStore((state) => state.selectedTileId);
  const selectedBlockId = useBuildingStore((state) => state.selectedBlockId);
  const selectedWallGroupId = useBuildingStore((state) => state.selectedWallGroupId);
  const currentTileMultiplier = useBuildingStore((state) => state.currentTileMultiplier);
  const setTileMultiplier = useBuildingStore((state) => state.setTileMultiplier);
  const currentTileHeight = useBuildingStore((state) => state.currentTileHeight);
  const setTileHeight = useBuildingStore((state) => state.setTileHeight);
  const currentTileShape = useBuildingStore((state) => state.currentTileShape);
  const setTileShape = useBuildingStore((state) => state.setTileShape);
  const currentTileRotation = useBuildingStore((state) => state.currentTileRotation);
  const setTileRotation = useBuildingStore((state) => state.setTileRotation);
  const currentTileMaterialId = useBuildingStore((state) => state.currentTileMaterialId);
  const setCurrentTileMaterialId = useBuildingStore((state) => state.setCurrentTileMaterialId);
  const currentWallRotation = useBuildingStore((state) => state.currentWallRotation);
  const setWallRotation = useBuildingStore((state) => state.setWallRotation);
  const selectedTileObjectType = useBuildingStore((state) => state.selectedTileObjectType);
  const setSelectedTileObjectType = useBuildingStore((state) => state.setSelectedTileObjectType);
  const currentTerrainColor = useBuildingStore((state) => state.currentTerrainColor);
  const currentTerrainAccentColor = useBuildingStore((state) => state.currentTerrainAccentColor);
  const setTerrainColors = useBuildingStore((state) => state.setTerrainColors);
  const selectedPlacedObjectType = useBuildingStore((state) => state.selectedPlacedObjectType);
  const setSelectedPlacedObjectType = useBuildingStore((state) => state.setSelectedPlacedObjectType);
  const selectedModelObjectId = useBuildingStore((state) => state.selectedModelObjectId);
  const setSelectedModelObjectId = useBuildingStore((state) => state.setSelectedModelObjectId);
  const currentModelUrl = useBuildingStore((state) => state.currentModelUrl);
  const setModelUrl = useBuildingStore((state) => state.setModelUrl);
  const currentModelScale = useBuildingStore((state) => state.currentModelScale);
  const setModelScale = useBuildingStore((state) => state.setModelScale);
  const currentModelColor = useBuildingStore((state) => state.currentModelColor);
  const setModelColor = useBuildingStore((state) => state.setModelColor);
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
  const wallGroups = useBuildingStore((state) => state.wallGroups);
  const blocks = useBuildingStore((state) => state.blocks);
  const meshes = useBuildingStore((state) => state.meshes);
  const addMesh = useBuildingStore((state) => state.addMesh);
  const updateMesh = useBuildingStore((state) => state.updateMesh);
  const updateWall = useBuildingStore((state) => state.updateWall);
  const updateTile = useBuildingStore((state) => state.updateTile);
  const setCurrentWallMaterialId = useBuildingStore((state) => state.setCurrentWallMaterialId);
  const removeWall = useBuildingStore((state) => state.removeWall);
  const removeTile = useBuildingStore((state) => state.removeTile);
  const removeBlock = useBuildingStore((state) => state.removeBlock);
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
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const buildingAssets = useMemo(
    () => assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter(isBuildingMaterialAsset),
    [assetIds, assetRecords],
  );

  const editModes: { type: typeof editMode; label: string; description: string }[] = [
    { type: 'none', label: '없음', description: '건축 편집을 끕니다' },
    { type: 'wall', label: '벽', description: '벽 조각을 배치합니다' },
    { type: 'tile', label: '타일', description: '바닥 타일을 배치합니다' },
    { type: 'block', label: '박스', description: '복셀 박스를 쌓습니다' },
    { type: 'object', label: '오브젝트', description: '타일 위에 장식을 배치합니다' },
    { type: 'npc', label: 'NPC', description: 'NPC를 배치합니다' },
  ];

  const coverTypes: { type: TileObjectType; label: string }[] = [
    { type: 'none', label: '없음' },
    { type: 'grass', label: '잔디' },
    { type: 'sand', label: '모래' },
    { type: 'snowfield', label: '눈밭' },
  ];

  const placedObjectTypes: { type: PlacedObjectType | 'none'; label: string }[] = [
    { type: 'none', label: '없음' },
    { type: 'sakura', label: '벚꽃나무' },
    { type: 'flag', label: '깃발' },
    { type: 'fire', label: '불' },
    { type: 'billboard', label: '간판' },
    { type: 'model', label: '기본 기물' },
  ];

  const tileShapes: { type: TileShapeType; label: string }[] = [
    { type: 'box', label: '박스' },
    { type: 'stairs', label: '계단' },
    { type: 'round', label: '원형' },
    { type: 'ramp', label: '경사' },
  ];

  const rotations = [
    { value: 0, label: '0도' },
    { value: Math.PI / 2, label: '90도' },
    { value: Math.PI, label: '180도' },
    { value: Math.PI * 1.5, label: '270도' },
  ];
  const selectedWallGroup = selectedWallId
    ? Array.from(wallGroups.values()).find((group) => group.walls.some((wall) => wall.id === selectedWallId))
    : wallGroups.get(selectedWallGroupId ?? '');
  const selectedTileGroup = selectedTileId
    ? Array.from(tileGroups.values()).find((group) => group.tiles.some((tile) => tile.id === selectedTileId))
    : tileGroups.get(selectedTileGroupId ?? '');
  const selectedTile = selectedTileId
    ? selectedTileGroup?.tiles.find((tile) => tile.id === selectedTileId)
    : undefined;
  const selectedBlock = selectedBlockId
    ? blocks.find((block) => block.id === selectedBlockId)
    : undefined;
  const currentEditModeLabel = editModes.find((mode) => mode.type === editMode)?.label ?? editMode;
  const currentCoverLabel = coverTypes.find((type) => type.type === selectedTileObjectType)?.label ?? selectedTileObjectType;
  const currentPlacedObjectLabel = placedObjectTypes.find((type) => type.type === selectedPlacedObjectType)?.label ?? selectedPlacedObjectType;
  const currentTileShapeLabel = tileShapes.find((shape) => shape.type === currentTileShape)?.label ?? currentTileShape;
  const selectedModelObject = getDefaultBuildingObject(selectedModelObjectId) ?? DEFAULT_BUILDING_OBJECT_CATALOG[0];

  const handleDeleteSelectedWall = () => {
    if (!selectedWallId || !selectedWallGroup) return;
    removeWall(selectedWallGroup.id, selectedWallId);
  };

  const handleDeleteSelectedTile = () => {
    if (!selectedTileId || !selectedTileGroup) return;
    removeTile(selectedTileGroup.id, selectedTileId);
  };

  const handleDeleteSelectedBlock = () => {
    if (!selectedBlockId) return;
    removeBlock(selectedBlockId);
  };

  const upsertScopedMesh = (
    sourceMeshId: string | undefined,
    scopeId: string,
    surface: string,
    asset: AssetRecord,
  ): string => {
    const nextMeshId = createScopedBuildingMeshId(scopeId, surface, asset.id);
    const base = sourceMeshId ? meshes.get(sourceMeshId) : undefined;
    const nextMesh: MeshConfig = createScopedAssetMeshConfig(nextMeshId, asset, base);
    if (meshes.has(nextMeshId)) {
      updateMesh(nextMeshId, nextMesh);
    } else {
      addMesh(nextMesh);
    }
    return nextMeshId;
  };

  const applyAssetToWall = (asset: AssetRecord) => {
    if (!selectedWallGroup) return;
    const selectedWall = selectedWallId
      ? selectedWallGroup.walls.find((wall) => wall.id === selectedWallId)
      : undefined;
    const sourceMeshId = selectedWall?.materialId ?? selectedWallGroup.frontMeshId;
    if (selectedWallId) {
      const wallScopedMeshId = upsertScopedMesh(sourceMeshId, selectedWallId, 'wall', asset);
      updateWall(selectedWallGroup.id, selectedWallId, { materialId: wallScopedMeshId });
      return;
    }

    const placementMeshId = upsertScopedMesh(
      selectedWallGroup.frontMeshId,
      createPlacementAssetScopeId('placement-wall'),
      'wall',
      asset,
    );
    setCurrentWallMaterialId(placementMeshId);
  };

  const applyAssetToTile = (asset: AssetRecord) => {
    if (!selectedTileGroup) return;
    if (selectedTileId) {
      const tileScopedMeshId = upsertScopedMesh(selectedTile?.materialId ?? selectedTileGroup.floorMeshId, selectedTileId, 'tile', asset);
      updateTile(selectedTileGroup.id, selectedTileId, { materialId: tileScopedMeshId });
      return;
    }
    const placementMeshId = upsertScopedMesh(
      selectedTileGroup.floorMeshId,
      createPlacementAssetScopeId('placement-tile'),
      'tile',
      asset,
    );
    setCurrentTileMaterialId(placementMeshId);
  };

  const applyColorToTile = (color: string) => {
    if (!selectedTileGroup) return;
    if (selectedTileId) {
      const sourceMeshId = selectedTile?.materialId ?? selectedTileGroup.floorMeshId;
      const meshId = createScopedBuildingMeshId(selectedTileId, 'tile-color', color);
      const mesh = createScopedColorMeshConfig(meshId, color, meshes.get(sourceMeshId));
      if (meshes.has(meshId)) updateMesh(meshId, mesh);
      else addMesh(mesh);
      updateTile(selectedTileGroup.id, selectedTileId, { materialId: meshId });
      return;
    }

    const sourceMeshId = currentTileMaterialId ?? selectedTileGroup.floorMeshId;
    const meshId = createScopedBuildingMeshId(createPlacementAssetScopeId('placement-tile-color'), 'tile', color);
    const mesh = createScopedColorMeshConfig(meshId, color, meshes.get(sourceMeshId));
    addMesh(mesh);
    setCurrentTileMaterialId(meshId);
  };

  const applyTerrainColors = (color: string, accentColor: string = currentTerrainAccentColor) => {
    setTerrainColors(color, accentColor);
    if (!selectedTileId || !selectedTileGroup) return;
    const tile = selectedTileGroup.tiles.find((entry) => entry.id === selectedTileId);
    if (!tile || !tile.objectType || tile.objectType === 'none' || tile.objectType === 'water') return;
    updateTile(selectedTileGroup.id, selectedTileId, {
      objectConfig: {
        ...(tile.objectConfig ?? {}),
        terrainColor: color,
        terrainAccentColor: accentColor,
      },
    });
  };

  return (
    <div className="building-panel">
      <div className="building-panel__section">
        <div className="building-panel__section-title">편집 모드</div>
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

      {(editMode === 'wall' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">벽 회전 / 삭제</div>
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
              disabled={!selectedWallId || !selectedWallGroup}
              onClick={handleDeleteSelectedWall}
            >
              선택 벽 삭제
            </button>
          </div>
        </div>
      )}

      {(editMode === 'wall' || editMode === 'tile' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">에셋 재질</div>
          <div className="building-panel__asset-targets">
            <span>벽: {selectedWallGroup?.name ?? '선택 없음'}</span>
            <span>타일: {selectedTileId ? `선택 타일 ${selectedTileId}` : '다음 생성 타일'}</span>
            <span>현재 생성 재질: {currentTileMaterialId ?? selectedTileGroup?.floorMeshId ?? '기본값'}</span>
          </div>
          <div className="building-panel__asset-list">
            {buildingAssets.map((asset) => (
              <div key={asset.id} className="building-panel__asset-card">
                <AssetPreviewCanvas asset={asset} size={54} />
                <div className="building-panel__asset-info">
                  <strong>{asset.name}</strong>
                  <span>{asset.kind}</span>
                </div>
                <div className="building-panel__asset-actions">
                  <button
                    className="building-panel__asset-action"
                    disabled={!selectedWallGroup}
                    onClick={() => applyAssetToWall(asset)}
                  >
                    벽
                  </button>
                  <button
                    className="building-panel__asset-action"
                    disabled={!selectedTileGroup}
                    onClick={() => applyAssetToTile(asset)}
                  >
                    타일
                  </button>
                </div>
              </div>
            ))}
            {buildingAssets.length === 0 && (
              <div className="building-panel__empty">사용 가능한 빌딩 에셋이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {(editMode === 'tile' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">지형 덮개</div>
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
          <div className="building-panel__terrain-colors">
            <label>
              <span>기본색</span>
              <input
                type="color"
                value={currentTerrainColor}
                onChange={(event) => applyTerrainColors(event.target.value)}
              />
            </label>
            <label>
              <span>강조색</span>
              <input
                type="color"
                value={currentTerrainAccentColor}
                onChange={(event) => applyTerrainColors(currentTerrainColor, event.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {(editMode === 'object' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">배치 오브젝트</div>
          <div className="building-panel__grid">
            {placedObjectTypes.map((t) => (
              <button
                key={t.type}
                className={`building-panel__grid-btn ${selectedPlacedObjectType === t.type ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => {
                  setSelectedPlacedObjectType(t.type);
                  if (t.type === 'model' && selectedModelObject) {
                    setModelScale(selectedModelObject.defaultScale);
                    setModelColor(selectedModelObject.defaultColor);
                    setModelUrl(selectedModelObject.modelUrl ?? '');
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {editMode === 'object' && selectedPlacedObjectType === 'model' && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">기본 기물 GLB</div>
          <div className="building-panel__grid">
            {DEFAULT_BUILDING_OBJECT_CATALOG.map((item) => (
              <button
                key={item.id}
                className={`building-panel__grid-btn ${selectedModelObjectId === item.id ? 'building-panel__grid-btn--active' : ''}`}
                onClick={() => {
                  setSelectedModelObjectId(item.id);
                  setModelScale(item.defaultScale);
                  setModelColor(item.defaultColor);
                  setModelUrl(item.modelUrl ?? '');
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="building-panel__info">
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">GLB URL</span>
              <input
                type="text"
                value={currentModelUrl}
                onChange={(event) => setModelUrl(event.target.value)}
                placeholder="gltf/props/door.glb"
                className="building-panel__text-input"
              />
            </label>
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">스케일</span>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={currentModelScale}
                onChange={(event) => setModelScale(Number(event.target.value) || 1)}
                className="building-panel__number-input"
              />
            </label>
            <label className="building-panel__info-item">
              <span className="building-panel__info-label">색상</span>
              <input
                type="color"
                value={currentModelColor}
                onChange={(event) => setModelColor(event.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentModelColor}</span>
            </label>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">Fallback</span>
              <span className="building-panel__info-value">{selectedModelObject?.fallbackKind ?? 'generic'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="building-panel__section">
        <div className="building-panel__section-title">타일 설정</div>
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
        <div className="building-panel__section-subtitle">타일 형태</div>
        <div className="building-panel__grid">
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
            <span>{selectedTileId ? `ID: ${selectedTileId}` : '타일 하이라이트를 클릭해 선택하세요'}</span>
          </div>
          <button
            className="building-panel__delete-button"
            disabled={!selectedTileId || !selectedTileGroup}
            onClick={handleDeleteSelectedTile}
          >
            선택 타일 삭제
          </button>
        </div>
      </div>

      {(editMode === 'block' || editMode === 'none') && (
        <div className="building-panel__section">
          <div className="building-panel__section-title">박스 편집</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">박스 크기</span>
              <span className="building-panel__info-value">{currentTileMultiplier} x {currentTileMultiplier}</span>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">쌓기 높이</span>
              <span className="building-panel__info-value">{currentTileHeight}</span>
            </div>
          </div>
          <div className="building-panel__delete-card">
            <div>
              <strong>선택한 박스</strong>
              <span>{selectedBlock ? `ID: ${selectedBlock.id}` : '박스 하이라이트를 클릭해 선택하세요'}</span>
            </div>
            <button
              className="building-panel__delete-button"
              disabled={!selectedBlockId}
              onClick={handleDeleteSelectedBlock}
            >
              선택 박스 삭제
            </button>
          </div>
        </div>
      )}

      {editMode === 'tile' && selectedTileGroupId && (() => {
        const tileGroup = tileGroups.get(selectedTileGroupId);
        const tileMeshId = selectedTile?.materialId ?? currentTileMaterialId ?? tileGroup?.floorMeshId;
        const tileMesh = tileMeshId ? meshes.get(tileMeshId) : undefined;
        return tileMesh ? (
          <div className="building-panel__section">
            <div className="building-panel__section-title">타일 색상</div>
            <div className="building-panel__info">
              <div className="building-panel__info-item">
                <span className="building-panel__info-label">색상</span>
                <input
                  type="color"
                  value={tileMesh.color || '#888888'}
                  onChange={(e) => applyColorToTile(e.target.value)}
                  style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{tileMesh.color || '#888888'}</span>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      <div className="building-panel__section">
        <div className="building-panel__section-title">효과</div>
        <div className="building-panel__info">
          <div className="building-panel__info-item">
            <span className="building-panel__info-label">눈</span>
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
          <div className="building-panel__section-title">오브젝트 회전</div>
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
          <div className="building-panel__section-title">벚꽃나무 색상</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">꽃잎</span>
              <input
                type="color"
                value={currentObjectPrimaryColor}
                onChange={(e) => setObjectPrimaryColor(e.target.value)}
                style={{ width: '36px', height: '24px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <span className="building-panel__info-value" style={{ fontSize: '10px' }}>{currentObjectPrimaryColor}</span>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">나무껍질</span>
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
          <div className="building-panel__section-title">불 설정</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">강도</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireIntensity(Math.max(0.5, currentFireIntensity - 0.5))}>-</button>
                <span className="building-panel__stepper-value">{currentFireIntensity.toFixed(1)}</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireIntensity(Math.min(3.0, currentFireIntensity + 0.5))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">너비</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireWidth(Math.max(0.3, currentFireWidth - 0.2))}>-</button>
                <span className="building-panel__stepper-value">{currentFireWidth.toFixed(1)}m</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireWidth(Math.min(4.0, currentFireWidth + 0.2))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">높이</span>
              <div className="building-panel__stepper">
                <button className="building-panel__stepper-btn" onClick={() => setFireHeight(Math.max(0.5, currentFireHeight - 0.3))}>-</button>
                <span className="building-panel__stepper-value">{currentFireHeight.toFixed(1)}m</span>
                <button className="building-panel__stepper-btn" onClick={() => setFireHeight(Math.min(5.0, currentFireHeight + 0.3))}>+</button>
              </div>
            </div>
            <div className="building-panel__info-item">
              <span className="building-panel__info-label">색상</span>
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
          <div className="building-panel__section-title">간판 설정</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">문구</span>
              <input
                type="text"
                value={currentBillboardText}
                onChange={(e) => setBillboardText(e.target.value)}
                placeholder="표시할 문구..."
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
              <span className="building-panel__info-label">이미지 URL</span>
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
              <span className="building-panel__info-label">색상</span>
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
          <div className="building-panel__section-title">깃발 설정</div>
          <div className="building-panel__info">
            <div className="building-panel__info-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
              <span className="building-panel__info-label">스타일</span>
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
              <span className="building-panel__info-label">너비</span>
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
              <span className="building-panel__info-label">높이</span>
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
              <span className="building-panel__info-label">이미지 URL</span>
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
          <span className="building-panel__info-label">현재 모드</span>
          <span className="building-panel__info-value">{currentEditModeLabel}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">지형 덮개</span>
          <span className="building-panel__info-value">{currentCoverLabel}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">오브젝트</span>
          <span className="building-panel__info-value">{currentPlacedObjectLabel}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">타일 높이</span>
          <span className="building-panel__info-value">{currentTileHeight}</span>
        </div>
        <div className="building-panel__info-item">
          <span className="building-panel__info-label">타일 형태</span>
          <span className="building-panel__info-value">{currentTileShapeLabel}</span>
        </div>
      </div>
    </div>
  );
};
