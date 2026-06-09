import { Suspense, useCallback, useMemo, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import {
  BuildingController,
  CatalogUI,
  CharacterMenu,
  CharacterCreator,
  Clicker,
  DialogBox,
  DynamicFog,
  Footprints,
  GaesupWorld,
  GaesupWorldContent,
  GroundClicker,
  HotbarUI,
  InteractionPrompt,
  InteractionTracker,
  InventoryUI,
  MailboxUI,
  MiniMap,
  QuestLogUI,
  RoomVisibilityDriver,
  RuntimeSaveDiagnosticsToaster,
  setDefaultToonMode,
  ToolUseController,
  TouchControls,
  ToastHost,
  WeatherEffect,
  useBuildingStore,
  usePerfStore,
  type CharacterMenuRenderers,
  type WorldCameraOption,
  type WorldContainerProps,
} from 'gaesup-world';
import { GrassDriver } from 'gaesup-world/building';
import {
  Editor,
  GameplayEventPanel,
  StudioPanel,
  createEditorShell,
  type EditorShellOptions,
} from 'gaesup-world/editor';

import {
  createWorldRuntime,
  deleteWorldGameplayEventBlueprint,
  dispatchWorldGameplayEvent,
  getWorldGameplayBlueprints,
  registerWorldGameplayEventBlueprint,
} from './runtime';
import { WorldPageProps } from './types';
import { DEFAULT_TOON_MODE } from './world/data';
import { WorldFocusModal, type WorldFocusInfo } from './world/focus';
import { DEFAULT_CHARACTER_URL, CharacterSpeechBalloon, Player } from './world/player';
import { Ground, Lighting, Scenery } from './world/scene';
import { WorldSystems } from './world/useWorldSystems';
import { HudShell } from '../components/hud/HudShell';
import { AIRPLANE_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

export { RICH_CAMERA_OPTION } from './world/data';
export { S3 };

setDefaultToonMode(DEFAULT_TOON_MODE);

const DEFAULT_EDITOR_SHELL_OPTIONS: EditorShellOptions = {};
const EDITOR_WORLD_MODE = {
  type: 'character',
  controller: 'clicker',
  control: 'topDown',
} satisfies NonNullable<WorldContainerProps['mode']>;
const DEFAULT_WORLD_MODE = {
  type: 'character',
  controller: 'keyboard',
  control: 'thirdPerson',
} satisfies NonNullable<WorldContainerProps['mode']>;
const EDITOR_WORLD_CAMERA_OPTION = {
  type: 'topDown',
  distance: 34,
  height: 52,
  fov: 52,
  smoothness: 0.14,
  enableCollision: false,
  enableZoom: true,
  minZoom: 0.3,
  maxZoom: 2.8,
  zoomSpeed: 0.001,
} satisfies WorldCameraOption;
const DEFAULT_WORLD_CAMERA_OPTION = {
  type: 'thirdPerson',
  distance: 13,
  height: 10,
  fov: 75,
  smoothness: 0.25,
  enableCollision: false,
} satisfies WorldCameraOption;

export const WorldPage = ({
  showEditor = false,
  showEditorShell = true,
  showHud = true,
  compactHud = false,
  includeEditorAuxPanels = true,
  editorShellOptions = DEFAULT_EDITOR_SHELL_OPTIONS,
  children,
}: WorldPageProps) => {
  const runtime = useMemo(() => createWorldRuntime(), []);
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const fogEnabled = useBuildingStore((s) => s.showFog);
  const fogColor = useBuildingStore((s) => s.fogColor);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
  const [gameplayBlueprints, setGameplayBlueprints] = useState(() => getWorldGameplayBlueprints());
  const [focusedFeature, setFocusedFeature] = useState<WorldFocusInfo | null>(null);
  const worldMode = showEditor ? EDITOR_WORLD_MODE : DEFAULT_WORLD_MODE;
  const worldCameraOption = showEditor ? EDITOR_WORLD_CAMERA_OPTION : DEFAULT_WORLD_CAMERA_OPTION;
  const handleRuntimeReady = useCallback(() => {
    setRuntimeRevision((revision) => revision + 1);
  }, []);
  const handleFeatureFocus = useCallback((focus: WorldFocusInfo) => {
    setFocusedFeature(focus);
  }, []);
  const handleFeatureFocusClose = useCallback(() => {
    setFocusedFeature(null);
  }, []);
  const editorShell = useMemo(() => {
    const auxiliaryPanels = includeEditorAuxPanels
      ? [
          {
            id: 'gameplay-events',
            title: '이벤트',
            component: (
              <GameplayEventPanel
                blueprints={gameplayBlueprints}
                onCreate={(blueprint) => {
                  registerWorldGameplayEventBlueprint(blueprint);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onUpdate={(blueprint) => {
                  registerWorldGameplayEventBlueprint(blueprint);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onDelete={(id) => {
                  deleteWorldGameplayEventBlueprint(id);
                  setGameplayBlueprints(getWorldGameplayBlueprints());
                }}
                onRun={(trigger) => dispatchWorldGameplayEvent(trigger)}
              />
            ),
            defaultSide: 'right' as const,
            pluginId: 'gaesup.gameplay-events',
          },
          {
            id: 'studio',
            title: '스튜디오',
            component: <StudioPanel gameplayEvents={gameplayBlueprints} />,
            defaultSide: 'right' as const,
            pluginId: 'gaesup.studio',
          },
        ]
      : [];

    return createEditorShell({
      ...editorShellOptions,
      panels: [...auxiliaryPanels, ...(editorShellOptions.panels ?? [])],
      defaultActivePanels: editorShellOptions.defaultActivePanels ?? ['tile'],
      sidebarPreset: editorShellOptions.sidebarPreset ?? 'compact',
      hiddenBuiltInPanels: editorShellOptions.hiddenBuiltInPanels ?? [
        'character',
        'vehicle',
        'animation',
        'motion',
        'performance',
      ],
      panelOrder: editorShellOptions.panelOrder ?? [
        'world',
        'wall',
        'tile',
        'block',
        'object',
        'npc',
        'camera',
        'gameplay-events',
        'studio',
      ],
    });
  }, [editorShellOptions, gameplayBlueprints, includeEditorAuxPanels]);
  const characterMenuRenderers = useMemo<CharacterMenuRenderers>(
    () => ({
      header: (menu) => (
        <div
          className={menu.classNameFor('header')}
          style={menu.styleFor('header', { borderColor: menu.preset.theme.borderColor })}
        >
          <div>
            <h2 className={menu.classNameFor('title')}>World Style Kit</h2>
            <span style={{ color: menu.preset.theme.mutedTextColor }}>{menu.appearance.name}</span>
          </div>
          <div className={menu.classNameFor('actions')}>
            <button
              type="button"
              className={menu.classNameFor('ghostButton')}
              style={menu.styleFor('ghostButton', menu.getButtonStyle())}
              onClick={menu.actions.reset}
            >
              Reset look
            </button>
            <button
              type="button"
              className={menu.classNameFor('primaryButton')}
              style={menu.styleFor('primaryButton', menu.getButtonStyle(true))}
              onClick={menu.actions.close}
            >
              Done
            </button>
          </div>
        </div>
      ),
      emptyAssets: (menu, slot) => (
        <div
          className={menu.classNameFor('emptyState')}
          style={menu.styleFor('emptyState', { borderColor: menu.preset.theme.borderColor })}
        >
          {menu.labelMaps.slots[slot]} assets are not registered yet.
        </div>
      ),
    }),
    [],
  );

  return (
    <>
      <GaesupWorld
        urls={{
          characterUrl: DEFAULT_CHARACTER_URL,
          vehicleUrl: VEHICLE_URL,
          airplaneUrl: AIRPLANE_URL,
        }}
        mode={worldMode}
        runtime={runtime}
        runtimeRevision={runtimeRevision}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={worldCameraOption}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
          <Lighting />
          <DynamicFog enabled={fogEnabled} color={fogColor} />
          {(weatherEffect === 'rain' || weatherEffect === 'storm' || weatherEffect === 'wind') && (
            <WeatherEffect
              kind={weatherEffect}
              area={110}
              height={26}
              count={weatherEffect === 'wind' ? 900 : 1800}
              followCamera
            />
          )}
          <Suspense>
            <GaesupWorldContent
              showGrid={EXAMPLE_CONFIG.showGrid}
              showAxes={EXAMPLE_CONFIG.showAxes}
            >
              <Physics debug interpolate>
                {!showEditor && <Player />}
                <Ground />
                <Scenery onFocus={!showEditor ? handleFeatureFocus : undefined} />
                {!showEditor && <Clicker />}
                {!showEditor && <GroundClicker />}
                <BuildingController />
                {!showEditor && <CharacterSpeechBalloon />}
                <InteractionTracker />
                {!showEditor && <ToolUseController useKey="f" />}
                <Footprints />
                <GrassDriver />
                <RoomVisibilityDriver />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <WorldSystems runtime={runtime} onRuntimeReady={handleRuntimeReady} />

        {showHud && (
          <>
            <RuntimeSaveDiagnosticsToaster />
            <ToastHost position="top-right" />

            <HudShell showEnvironmentControls={!showEditor} compact={compactHud} />
            {!showEditor && (
              <WorldFocusModal focus={focusedFeature} onClose={handleFeatureFocusClose} />
            )}

            <InteractionPrompt enabled={!showEditor} />
            <DialogBox />
            <QuestLogUI toggleKey="j" />
            <MailboxUI toggleKey="m" />
            <CatalogUI toggleKey="k" />
            <InventoryUI toggleKey="i" />

            <HotbarUI />
            <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />

            <CharacterCreator toggleKey="o" />
            <CharacterMenu
              toggleKey="c"
              preset="creative"
              hiddenSlots={['face', 'glasses']}
              features={{ savePresets: false, tagFilter: true, ownedOnly: true }}
              classNames={{
                panel: 'rounded-lg border overflow-hidden shadow-2xl',
                section: 'rounded-lg border p-3',
                activeChip: 'rounded-full border px-3 py-1 text-xs font-bold',
                activeAssetButton:
                  'aspect-square overflow-hidden rounded-md border text-xs font-bold',
              }}
              labels={{
                title: 'Character Customizer',
                tagFilter: 'Tag',
              }}
              renderers={characterMenuRenderers}
            />
            {!showEditor && <TouchControls />}
          </>
        )}
      </GaesupWorld>
      {showEditor && showEditorShell && <Editor shell={editorShell} />}
      {children}
    </>
  );
};
