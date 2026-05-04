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
