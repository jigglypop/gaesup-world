import * as fs from 'fs';
import * as path from 'path';

import type {
  NPCAction,
  NPCBrainConfig,
  NPCBrainBlueprint,
  NPCObservation,
  NPCBrainDecision,
  NPCInstanceData,
  BuildingWorldSurface,
  CameraPanelProps,
  CameraPanelRenderContext,
  CameraPanelRenderers,
  CameraPanelStyles,
  CameraControllerProps,
  CameraControllerRenderContext,
  CameraControllerRenderers,
  CameraControllerStyles,
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelClassNames,
  CameraDebugPanelLabels,
  CameraDebugPanelPosition,
  CameraDebugPanelProps,
  CameraDebugPanelRenderContext,
  CameraDebugPanelRenderers,
  CameraDebugPanelResolvedField,
  CameraDebugPanelStyles,
  CameraDebugPanelTheme,
  CameraMetrics,
  CameraModeConfig,
  CameraPreset,
  CameraPresetsProps,
  CameraPresetsRenderContext,
  CameraPresetsRenderers,
  CameraPresetsStyles,
  CameraSettingsField,
  CameraSettingsRenderContext,
  CameraSettingsRenderers,
  CameraSettingsTabProps,
  AnimationPanelProps,
  AnimationPanelRenderContext,
  AnimationPanelRenderers,
  AnimationPanelStyles,
  MotionPanelProps,
  MotionPanelRenderContext,
  MotionPanelRenderers,
  MotionPanelStyles,
  ProjectAssetsPanelProps,
  ProjectAssetsPanelRenderContext,
  ProjectAssetsPanelRenderers,
  ProjectAssetsPanelStyles,
  EditorSidebarPreset,
  EditorSidebarPresetId,
  EditorSidebarPresetInput,
  ActionEquipmentPanelActions,
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelClassNames,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabelMaps,
  ActionEquipmentPanelLabels,
  ActionEquipmentPanelProps,
  ActionEquipmentPanelRenderContext,
  ActionEquipmentPanelRenderers,
  ActionEquipmentPanelStyles,
  CharacterEquipmentPreset,
  CharacterCreatorProps,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuClassNameSlot,
  CharacterMenuCloseUpController,
  CharacterMenuLabelMaps,
  CharacterMenuOption,
  CharacterMenuRenderContext,
  CharacterMenuRenderers,
  CharacterMenuSection,
  PluginDiagnostic,
  SystemExtensionMap,
  InputExtensionMap,
  SaveExtensionMap,
  ServiceExtensionMap,
  ComponentExtensionMap,
  BuildingUIProps,
  BuildingUINPCPanelRenderer,
  BuildingPanelNPCPanelRenderer,
  EditorPanelComponentExtension,
  EditorShellPluginPanel,
  GameCommand,
  ServerEvent,
  StateDelta,
  SnapshotAck,
  RuntimePluginTarget,
  PluginRuntimeTarget,
  PlatformServerPluginHost,
  CommandAuthorityRouter,
  CommandAuthorityResult,
  GaesupPluginTemplate,
  PluginValidationResult,
  AssetCatalogStatus,
  ContentBundleManifest,
  ContentSchemaVersion,
  SaveDiagnostic,
  SaveDiagnosticListener,
  RuntimeSaveDiagnostic,
  RuntimeSaveDiagnosticsService,
  RuntimeSaveDiagnosticsToasterProps,
} from 'gaesup-world';

/** Type exports of the root entry; the compiler checks that each still exists. */
export type RootTypeExports = [
  NPCAction,
  NPCBrainConfig,
  NPCBrainBlueprint,
  NPCObservation,
  NPCBrainDecision,
  NPCInstanceData,
  BuildingWorldSurface,
  CameraPanelProps,
  CameraPanelRenderContext,
  CameraPanelRenderers,
  CameraPanelStyles,
  CameraControllerProps,
  CameraControllerRenderContext,
  CameraControllerRenderers,
  CameraControllerStyles,
  CameraDebugPanelClassNameSlot,
  CameraDebugPanelClassNames,
  CameraDebugPanelLabels,
  CameraDebugPanelPosition,
  CameraDebugPanelProps,
  CameraDebugPanelRenderContext,
  CameraDebugPanelRenderers,
  CameraDebugPanelResolvedField,
  CameraDebugPanelStyles,
  CameraDebugPanelTheme,
  CameraMetrics,
  CameraModeConfig,
  CameraPreset,
  CameraPresetsProps,
  CameraPresetsRenderContext,
  CameraPresetsRenderers,
  CameraPresetsStyles,
  CameraSettingsField,
  CameraSettingsRenderContext,
  CameraSettingsRenderers,
  CameraSettingsTabProps,
  AnimationPanelProps,
  AnimationPanelRenderContext,
  AnimationPanelRenderers,
  AnimationPanelStyles,
  MotionPanelProps,
  MotionPanelRenderContext,
  MotionPanelRenderers,
  MotionPanelStyles,
  ProjectAssetsPanelProps,
  ProjectAssetsPanelRenderContext,
  ProjectAssetsPanelRenderers,
  ProjectAssetsPanelStyles,
  EditorSidebarPreset,
  EditorSidebarPresetId,
  EditorSidebarPresetInput,
  ActionEquipmentPanelActions,
  ActionEquipmentPanelClassNameSlot,
  ActionEquipmentPanelClassNames,
  ActionEquipmentPanelFeatures,
  ActionEquipmentPanelLabelMaps,
  ActionEquipmentPanelLabels,
  ActionEquipmentPanelProps,
  ActionEquipmentPanelRenderContext,
  ActionEquipmentPanelRenderers,
  ActionEquipmentPanelStyles,
  CharacterEquipmentPreset,
  CharacterCreatorProps,
  CharacterMenuPreset,
  CharacterMenuProps,
  CharacterMenuClassNameSlot,
  CharacterMenuCloseUpController,
  CharacterMenuLabelMaps,
  CharacterMenuOption<string>,
  CharacterMenuRenderContext,
  CharacterMenuRenderers,
  CharacterMenuSection,
  PluginDiagnostic,
  SystemExtensionMap,
  InputExtensionMap,
  SaveExtensionMap,
  ServiceExtensionMap,
  ComponentExtensionMap,
  BuildingUIProps,
  BuildingUINPCPanelRenderer,
  BuildingPanelNPCPanelRenderer,
  EditorPanelComponentExtension,
  EditorShellPluginPanel,
  GameCommand,
  ServerEvent,
  StateDelta,
  SnapshotAck,
  RuntimePluginTarget,
  PluginRuntimeTarget,
  PlatformServerPluginHost,
  CommandAuthorityRouter,
  CommandAuthorityResult,
  GaesupPluginTemplate,
  PluginValidationResult,
  AssetCatalogStatus,
  ContentBundleManifest,
  ContentSchemaVersion,
  SaveDiagnostic,
  SaveDiagnosticListener,
  RuntimeSaveDiagnostic,
  RuntimeSaveDiagnosticsService,
  RuntimeSaveDiagnosticsToasterProps,
];

const root = jest.requireActual('gaesup-world') as Record<string, unknown>;

const ROOT_ENTRY = path.resolve(__dirname, '../index.ts');
const CORE_ENTRY = path.resolve(__dirname, '../core/index.ts');
const SCENE_OBJECT_ENTRY = path.resolve(__dirname, '../core/scene-object/index.ts');
const SCENE_OBJECT_COMMANDS = path.resolve(__dirname, '../core/scene-object/commands.ts');
const SCENE_OBJECT_CONTROLLER = path.resolve(__dirname, '../core/scene-object/controller.ts');
const SCENE_OBJECT_SAVE_BINDING = path.resolve(__dirname, '../core/scene-object/saveBinding.ts');

function readRootEntry(): string {
  return fs.readFileSync(ROOT_ENTRY, 'utf8');
}

function expectNamedExport(source: string, name: string): void {
  expect(source).toMatch(new RegExp(`\\b${name}\\b`));
}

describe('public package API', () => {
  test('exposes Unity scene interchange and exact hierarchical matrices', () => {
    const api = jest.requireActual('gaesup-world') as typeof import('gaesup-world');
    const source = api.createSceneDocument({ id: 'unity-api', objects: [{ id: 'object' }] });
    const restored = api.importUnityScene(api.exportUnityScene(source));
    expect(restored).toEqual(source);
    expect(api.loadSceneRuntime(restored).runtime?.getWorldMatrix('object')).toHaveLength(16);
  });
  test('exposes the legacy grid through the shared renderer compatibility boundary', () => {
    const coreSource = fs.readFileSync(CORE_ENTRY, 'utf8');
    expect(coreSource).toContain("export { Grid as LegacyGrid } from './rendering/legacyDrei'");
    const root = jest.requireActual('gaesup-world') as typeof import('gaesup-world');
    const drei = jest.requireActual('@react-three/drei') as typeof import('@react-three/drei');
    expect(root.LegacyGrid).toBe(drei.Grid);
    expect(root.LegacyGrid).toBeDefined();
  });
  test('루트 엔트리로 Animator 컨트롤러 경로를 노출한다', () => {
    const root = jest.requireActual('gaesup-world') as typeof import('gaesup-world');
    expect(typeof root.AnimatorRuntime).toBe('function');
    expect(typeof root.ThreeAnimatorBinding).toBe('function');
    expect(typeof root.validateAnimatorController).toBe('function');
    expect(typeof root.registerAnimatorController).toBe('function');
    expect(typeof root.createDefaultCharacterAnimator).toBe('function');
    expect(typeof root.useCharacterAnimator).toBe('function');
    expect(typeof root.createAnimatorComponent).toBe('function');
    expect(root.getAnimatorController(root.DEFAULT_CHARACTER_ANIMATOR_ID)).toBe(root.defaultCharacterAnimator);
    expect(root.SCENE_COMPONENT_TYPES.animator).toBe('gaesup.animator');
  });
  test('exports the SceneDocument command path through the existing root scene-object barrel', () => {
    const rootSource = readRootEntry();
    const coreSource = fs.readFileSync(CORE_ENTRY, 'utf8');
    const sceneObjectSource = fs.readFileSync(SCENE_OBJECT_ENTRY, 'utf8');
    const implementationSource = [
      SCENE_OBJECT_COMMANDS,
      SCENE_OBJECT_CONTROLLER,
      SCENE_OBJECT_SAVE_BINDING,
    ]
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');

    expect(rootSource).toContain("export * from './core'");
    expect(coreSource).toContain("export * from './scene-object'");
    expect(sceneObjectSource).toContain("export * from './commands'");
    expect(sceneObjectSource).toContain("export * from './controller'");
    expect(sceneObjectSource).toContain("export * from './saveBinding'");
    [
      'applySceneDocumentCommand',
      'createSceneDocumentController',
      'createSceneDocumentSaveBinding',
      'SCENE_DOCUMENT_SAVE_KEY',
    ].forEach((name) => expectNamedExport(implementationSource, name));
  });

  test('exports world config and editor shell APIs from the root entry', () => {
    const source = readRootEntry();

    expect(root).toHaveProperty('WorldConfigProvider');
    expect(root).toHaveProperty('WorldContainer');
    expect(source).toContain("export * from './core/editor'");
  });

  test('exports NPC brain runtime APIs from the root entry', () => {
    [
      'NPCSystem',
      'NPCInstance',
      'createNPCObservation',
      'resolveNPCBrainDecision',
      'registerNPCBrainAdapter',
      'registerNPCBrainBlueprint',
      'compileNPCBrainBlueprint',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });

  test('exports built-in runtime plugin factories from the root entry', () => {
    [
      'createBuildingPlugin',
      'DEFAULT_BUILDING_STORE_SERVICE_ID',
      'BUILDING_WORLD_SURFACE_OPTIONS',
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
      'createScenePlugin',
      'createCharacterPlugin',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });

  test('exports camera UI customization APIs from the root entry', () => {
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
      'createInitialCameraMetrics',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });

  test('exports editor panel customization APIs from the root entry', () => {
    [
      'AnimationPanel',
      'ANIMATION_PANEL_DEFAULT_CLASSES',
      'ANIMATION_PANEL_DEFAULT_LABELS',
      'ANIMATION_PANEL_DEFAULT_TABS',
      'MotionPanel',
      'MOTION_PANEL_DEFAULT_CLASSES',
      'MOTION_PANEL_DEFAULT_LABELS',
      'MOTION_PANEL_DEFAULT_TABS',
      'ProjectAssetsPanel',
      'PROJECT_ASSETS_PANEL_DEFAULT_CLASSES',
      'PROJECT_ASSETS_PANEL_DEFAULT_KIND_OPTIONS',
      'PROJECT_ASSETS_PANEL_DEFAULT_LABELS',
      'PROJECT_ASSETS_PANEL_DEFAULT_TABS',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });

  test('exports character menu customization APIs from the root entry', () => {
    [
      'ActionEquipmentPanel',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_CLASSES',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_LABELS',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FACE_SEQUENCE',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_FEATURES',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_LABELS',
      'ACTION_EQUIPMENT_PANEL_DEFAULT_SLOT_COUNT',
      'CharacterMenu',
      'CharacterCreator',
      'useCharacterMenuController',
      'MENU_PRESETS',
      'CHARACTER_MENU_DEFAULT_FEATURES',
      'CHARACTER_MENU_DEFAULT_SECTIONS',
      'CHARACTER_MENU_DEFAULT_SLOTS',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });

  test('exports plugin registry diagnostics APIs from the root entry', () => {
    [
      'createPluginRegistry',
      'PluginVersionMismatchError',
      'PluginManifestValidationError',
    ].forEach((name) => expect(root).toHaveProperty(name));
  });
});
