import * as fs from 'fs';
import * as path from 'path';

const ROOT_ENTRY = path.resolve(__dirname, '../index.ts');

function readRootEntry(): string {
  return fs.readFileSync(ROOT_ENTRY, 'utf8');
}

function expectNamedExport(source: string, name: string): void {
  expect(source).toMatch(new RegExp(`\\b${name}\\b`));
}

describe('public package API', () => {
  test('exports world config and editor shell APIs from the root entry', () => {
    const source = readRootEntry();

    expectNamedExport(source, 'WorldConfigProvider');
    expectNamedExport(source, 'WorldContainer');
    expect(source).toContain("export * from './core/editor'");
  });

  test('exports NPC brain runtime APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'NPCSystem',
      'NPCInstance',
      'createNPCObservation',
      'resolveNPCBrainDecision',
      'registerNPCBrainAdapter',
      'registerNPCBrainBlueprint',
      'compileNPCBrainBlueprint',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports NPC brain public types from the root entry', () => {
    const source = readRootEntry();

    [
      'NPCAction',
      'NPCBrainConfig',
      'NPCBrainBlueprint',
      'NPCObservation',
      'NPCBrainDecision',
      'NPCInstanceData',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports built-in runtime plugin factories from the root entry', () => {
    const source = readRootEntry();

    [
      'createBuildingPlugin',
      'DEFAULT_BUILDING_STORE_SERVICE_ID',
      'BUILDING_WORLD_SURFACE_OPTIONS',
      'BuildingWorldSurface',
      'createCameraPlugin',
      'DEFAULT_CAMERA_SYSTEM_EXTENSION_ID',
      'createMotionsPlugin',
      'createMemoryInputBackend',
      'useInputBackend',
      'EDITOR_PANEL_COMPONENT_KIND',
      'resolveEditorPanelComponentExtensions',
      'createCommandAuthorityRouter',
      'createCommandAcceptedResult',
      'createCommandRejectedResult',
      'createGameCommand',
      'createServerEvent',
      'createStateDelta',
      'createSnapshotAck',
      'shouldSetupPluginForRuntime',
      'DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID',
      'createServerPluginHost',
      'DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID',
      'RUNTIME_SAVE_DIAGNOSTIC_EVENT',
      'createRuntimeSaveDiagnostics',
      'formatRuntimeSaveDiagnostic',
      'RuntimeSaveDiagnosticsToaster',
      'formatRuntimeSaveDiagnosticToastMessage',
      'defineGaesupPlugin',
      'validateGaesupPlugin',
      'assertValidGaesupPlugin',
      'createCozyLifeSamplePlugin',
      'createHighGraphicsSamplePlugin',
      'createShooterKitSamplePlugin',
      'CONTENT_SCHEMA_VERSION',
      'createContentBundleFromSaveSystem',
      'validateContentBundle',
      'validateContentBundleManifest',
      'DEFAULT_WORLD_SAVE_ENVIRONMENT',
      'createCameraSaveDataFromDomain',
      'createSaveDataFromSaveSystem',
      'createWorldDataFromSaveDomains',
      'createNPCPlugin',
      'createTimePlugin',
      'createWeatherPlugin',
      'createAudioPlugin',
      'createInventoryPlugin',
      'createEconomyPlugin',
      'createScenePlugin',
      'createCharacterPlugin',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports camera UI customization APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'CameraController',
      'CameraDebugPanel',
      'CameraPanel',
      'CameraPresets',
      'CameraSettingsTab',
      'CAMERA_DEBUG_PANEL_DEFAULT_CLASSES',
      'CAMERA_DEBUG_PANEL_DEFAULT_FIELDS',
      'CAMERA_DEBUG_PANEL_DEFAULT_INTERVAL',
      'CAMERA_DEBUG_PANEL_DEFAULT_LABELS',
      'CAMERA_DEBUG_PANEL_DEFAULT_PRECISION',
      'CAMERA_PANEL_DEFAULT_CLASSES',
      'CAMERA_PANEL_DEFAULT_LABELS',
      'CAMERA_PANEL_DEFAULT_TABS',
      'CAMERA_CONTROLLER_DEFAULT_CLASSES',
      'CAMERA_CONTROLLER_DEFAULT_LABELS',
      'CAMERA_CONTROLLER_DEFAULT_MODES',
      'CAMERA_PRESETS_DEFAULT_CLASSES',
      'CAMERA_PRESETS_DEFAULT_LABELS',
      'CAMERA_PRESETS_DEFAULT_PRESETS',
      'CAMERA_PRESETS_DEFAULT_SMOOTHING',
      'CAMERA_SETTINGS_DEFAULT_CLASSES',
      'CAMERA_SETTINGS_DEFAULT_LABELS',
      'CAMERA_SETTINGS_DEFAULT_SECTIONS',
      'CameraPanelProps',
      'CameraPanelRenderContext',
      'CameraPanelRenderers',
      'CameraPanelStyles',
      'CameraControllerProps',
      'CameraControllerRenderContext',
      'CameraControllerRenderers',
      'CameraControllerStyles',
      'CameraDebugPanelClassNameSlot',
      'CameraDebugPanelClassNames',
      'CameraDebugPanelLabels',
      'CameraDebugPanelPosition',
      'CameraDebugPanelProps',
      'CameraDebugPanelRenderContext',
      'CameraDebugPanelRenderers',
      'CameraDebugPanelResolvedField',
      'CameraDebugPanelStyles',
      'CameraDebugPanelTheme',
      'CameraMetrics',
      'createInitialCameraMetrics',
      'CameraModeConfig',
      'CameraPreset',
      'CameraPresetsProps',
      'CameraPresetsRenderContext',
      'CameraPresetsRenderers',
      'CameraPresetsStyles',
      'CameraSettingsField',
      'CameraSettingsRenderContext',
      'CameraSettingsRenderers',
      'CameraSettingsTabProps',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports editor panel customization APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'AnimationPanel',
      'ANIMATION_PANEL_DEFAULT_CLASSES',
      'ANIMATION_PANEL_DEFAULT_LABELS',
      'ANIMATION_PANEL_DEFAULT_TABS',
      'AnimationPanelProps',
      'AnimationPanelRenderContext',
      'AnimationPanelRenderers',
      'AnimationPanelStyles',
      'MotionPanel',
      'MOTION_PANEL_DEFAULT_CLASSES',
      'MOTION_PANEL_DEFAULT_LABELS',
      'MOTION_PANEL_DEFAULT_TABS',
      'MotionPanelProps',
      'MotionPanelRenderContext',
      'MotionPanelRenderers',
      'MotionPanelStyles',
      'ProjectAssetsPanel',
      'PROJECT_ASSETS_PANEL_DEFAULT_CLASSES',
      'PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS',
      'PROJECT_ASSETS_PANEL_DEFAULT_LABELS',
      'PROJECT_ASSETS_PANEL_DEFAULT_TABS',
      'ProjectAssetsPanelProps',
      'ProjectAssetsPanelRenderContext',
      'ProjectAssetsPanelRenderers',
      'ProjectAssetsPanelStyles',
      'EditorSidebarPreset',
      'EditorSidebarPresetId',
      'EditorSidebarPresetInput',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports character menu customization APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'ActionEquipmentPanel',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT',
      'ActionEquipmentPanelActions',
      'ActionEquipmentPanelClassNameSlot',
      'ActionEquipmentPanelClassNames',
      'ActionEquipmentPanelFeatures',
      'ActionEquipmentPanelLabelMaps',
      'ActionEquipmentPanelLabels',
      'ActionEquipmentPanelProps',
      'ActionEquipmentPanelRenderContext',
      'ActionEquipmentPanelRenderers',
      'ActionEquipmentPanelStyles',
      'CharacterEquipmentPreset',
      'CharacterMenu',
      'CharacterCreator',
      'CharacterCreatorProps',
      'useCharacterMenuController',
      'MENU_PRESETS',
      'CHARACTER_MENU_DEFAULT_FEATURES',
      'CHARACTER_MENU_DEFAULT_SECTIONS',
      'CHARACTER_MENU_DEFAULT_SLOTS',
      'CharacterMenuPreset',
      'CharacterMenuProps',
      'CharacterMenuClassNameSlot',
      'CharacterMenuCloseUpController',
      'CharacterMenuLabelMaps',
      'CharacterMenuOption',
      'CharacterMenuRenderContext',
      'CharacterMenuRenderers',
      'CharacterMenuSection',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports plugin registry diagnostics APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'createPluginRegistry',
      'PluginVersionMismatchError',
      'PluginManifestValidationError',
      'PluginDiagnostic',
      'SystemExtensionMap',
      'InputExtensionMap',
      'SaveExtensionMap',
      'ServiceExtensionMap',
      'ComponentExtensionMap',
      'BuildingUIProps',
      'BuildingUINPCPanelRenderer',
      'BuildingPanelNPCPanelRenderer',
      'EditorPanelComponentExtension',
      'EditorShellPluginPanel',
      'GameCommand',
      'ServerEvent',
      'StateDelta',
      'SnapshotAck',
      'RuntimePluginTarget',
      'PluginRuntimeTarget',
      'PlatformServerPluginHost',
      'CommandAuthorityRouter',
      'CommandAuthorityResult',
      'GaesupPluginTemplate',
      'PluginValidationResult',
      'AssetCatalogStatus',
      'ContentBundleManifest',
      'ContentSchemaVersion',
      'SaveDiagnostic',
      'SaveDiagnosticListener',
      'RuntimeSaveDiagnostic',
      'RuntimeSaveDiagnosticsService',
      'RuntimeSaveDiagnosticsToasterProps',
    ].forEach((name) => expectNamedExport(source, name));
  });
});
