import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { isBuildingMaterialAsset } from './helpers';
import type { AssetRecord } from '../../../../assets';
import { useAssetStore } from '../../../../assets';
import { useBuildingStore } from '../../../../building/stores/buildingStore';
import { useNPCStore } from '../../../../npc/stores/npcStore';

const BUILDING_PANEL_FIELDS = [
  'editMode',
  'setEditMode',
  'selectedWallId',
  'selectedTileId',
  'selectedBlockId',
  'selectedWallGroupId',
  'hoverPosition',
  'currentTileMultiplier',
  'setTileMultiplier',
  'currentTileHeight',
  'setTileHeight',
  'currentTileShape',
  'setTileShape',
  'currentTileRotation',
  'setTileRotation',
  'currentTileMaterialId',
  'setCurrentTileMaterialId',
  'currentCustomTileName',
  'currentCustomTileColor',
  'currentCustomTileTextureUrl',
  'setCustomTileDraft',
  'applyTilePreset',
  'applyCustomTile',
  'currentWallRotation',
  'setWallRotation',
  'currentWallKind',
  'setWallKind',
  'applyWallPreset',
  'selectedTileObjectType',
  'setSelectedTileObjectType',
  'currentTerrainColor',
  'currentTerrainAccentColor',
  'setTerrainColors',
  'selectedPlacedObjectType',
  'setSelectedPlacedObjectType',
  'selectedModelObjectId',
  'setSelectedModelObjectId',
  'currentModelUrl',
  'setModelUrl',
  'currentModelScale',
  'setModelScale',
  'currentModelColor',
  'setModelColor',
  'snapToGrid',
  'setSnapToGrid',
  'currentFlagWidth',
  'currentFlagHeight',
  'currentFlagImageUrl',
  'setFlagWidth',
  'setFlagHeight',
  'setFlagImageUrl',
  'currentFlagStyle',
  'setFlagStyle',
  'currentFireIntensity',
  'currentFireWidth',
  'currentFireHeight',
  'currentFireColor',
  'setFireIntensity',
  'setFireWidth',
  'setFireHeight',
  'setFireColor',
  'currentObjectRotation',
  'setObjectRotation',
  'selectedTileGroupId',
  'tileGroups',
  'wallGroups',
  'meshes',
  'addMesh',
  'updateMesh',
  'updateWall',
  'updateTile',
  'setCurrentWallMaterialId',
  'removeWall',
  'removeTile',
  'removeBlock',
  'currentBillboardText',
  'currentBillboardImageUrl',
  'currentBillboardColor',
  'currentBillboardWidth',
  'currentBillboardHeight',
  'currentBillboardScale',
  'currentBillboardOffsetY',
  'currentBillboardElevation',
  'currentBillboardIntensity',
  'setBillboardText',
  'setBillboardImageUrl',
  'setBillboardColor',
  'setBillboardWidth',
  'setBillboardHeight',
  'setBillboardScale',
  'setBillboardOffsetY',
  'setBillboardElevation',
  'setBillboardIntensity',
  'currentObjectPrimaryColor',
  'currentObjectSecondaryColor',
  'currentTreeKind',
  'setObjectPrimaryColor',
  'setObjectSecondaryColor',
  'setTreeKind',
  'showSnow',
  'setShowSnow',
  'showFog',
  'setShowFog',
  'fogColor',
  'setFogColor',
  'weatherEffect',
  'setWeatherEffect',
  'worldSurface',
  'setWorldSurface',
] as const;

function pickStoreFields<TState extends object, TKey extends keyof TState>(
  state: TState,
  keys: readonly TKey[],
): Pick<TState, TKey> {
  const result = {} as Pick<TState, TKey>;
  for (const key of keys) {
    result[key] = state[key];
  }
  return result;
}

export function useBuildingPanelState() {
  const building = useBuildingStore(
    useShallow((state) => pickStoreFields(state, BUILDING_PANEL_FIELDS)),
  );
  const npc = useNPCStore(
    useShallow((state) => ({
      npcTemplates: state.templates,
      npcInstances: state.instances,
      npcAnimations: state.animations,
      npcBrainBlueprints: state.brainBlueprints,
      selectedNPCTemplateId: state.selectedTemplateId,
      selectedNPCInstanceId: state.selectedInstanceId,
      setSelectedNPCTemplate: state.setSelectedTemplate,
      setSelectedNPCInstance: state.setSelectedInstance,
      updateNPCInstance: state.updateInstance,
      setNPCNavigation: state.setNavigation,
      clearNPCNavigation: state.clearNavigation,
      updateNPCBehavior: state.updateInstanceBehavior,
      updateNPCBrain: state.updateInstanceBrain,
      updateNPCPerception: state.updateInstancePerception,
      addNPCBrainBlueprint: state.addBrainBlueprint,
      updateNPCBrainBlueprint: state.updateBrainBlueprint,
      initializeNPCDefaults: state.initializeDefaults,
    })),
  );
  const assetIds = useAssetStore((state) => state.ids);
  const assetRecords = useAssetStore((state) => state.records);
  const buildingAssets = useMemo(
    () => assetIds
      .map((id) => assetRecords[id])
      .filter((asset): asset is AssetRecord => Boolean(asset))
      .filter(isBuildingMaterialAsset),
    [assetIds, assetRecords],
  );
  const npcTemplatesArray = useMemo(() => Array.from(npc.npcTemplates.values()), [npc.npcTemplates]);
  const npcInstancesArray = useMemo(() => Array.from(npc.npcInstances.values()), [npc.npcInstances]);
  const npcAnimationsArray = useMemo(() => Array.from(npc.npcAnimations.values()), [npc.npcAnimations]);
  const npcBrainBlueprintsArray = useMemo(
    () => Array.from(npc.npcBrainBlueprints.values()),
    [npc.npcBrainBlueprints],
  );
  return {
    ...building,
    ...npc,
    buildingAssets,
    npcTemplatesArray,
    npcInstancesArray,
    npcAnimationsArray,
    npcBrainBlueprintsArray,
  };
}
