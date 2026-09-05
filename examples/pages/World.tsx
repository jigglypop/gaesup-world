import { Suspense, lazy, useCallback, useMemo, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import {
  BuildingController,
  CatalogUI,
  CharacterMenu,
  CharacterCreator,
  Clicker,
  DialogBox,
  CraftingUI,
  DynamicFog,
  Footprints,
  GaesupWorld,
  GaesupWorldContent,
  GaesupRuntimeProvider,
  GroundClicker,
  HotbarUI,
  InteractionPrompt,
  InteractionTracker,
  InventoryUI,
  MailboxUI,
  MENU_PRESETS,
  MiniMap,
  QuestLogUI,
  RoomVisibilityDriver,
  RuntimeSaveDiagnosticsToaster,
  TeleportOnClick,
  restoreCameraCloseUp,
  setDefaultToonMode,
  ToolUseController,
  TouchControls,
  ToastHost,
  WeatherEffect,
  useBuildingStore,
  usePerfStore,
  type CharacterMenuPreset,
  type CharacterMenuRenderers,
  type WorldCameraOption,
  type WorldContainerProps,
} from 'gaesup-world';
import { GrassDriver } from 'gaesup-world/building';
import { ColorGrade, ToonOutlines } from 'gaesup-world/postprocessing';

import { createWorldRuntime } from './runtime';
import { WorldPageProps } from './types';
import { DEFAULT_TOON_MODE } from './world/data';
import { WorldFocusModal, type WorldFocusInfo } from './world/focus';
import {
  DEFAULT_CHARACTER_URL,
  CharacterSpeechBalloon,
  NavigationRouteProbe,
  Player,
} from './world/player';
import { Ground, Lighting, Scenery } from './world/scene';
import { getWorldSceneDocumentSession, WorldSceneDocumentRootMarkers } from './world/sceneDocument';
import { WorldSystems } from './world/useWorldSystems';
import { CloseUpControls } from '../components/cinematic/CloseUpControls';
import { FeatureAccessPanel } from '../components/feature/FeatureAccessPanel';
import { HudShell } from '../components/hud/HudShell';
import { PerformanceOverlay } from '../components/performance/PerformanceOverlay';
import { RideableUIRenderer, RideableVehicles } from '../components/rideable';
import { TeleportMarkers } from '../components/teleport/markers';
import { AIRPLANE_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

const WORLD_CHARACTER_MENU_PRESET: CharacterMenuPreset = {
  ...MENU_PRESETS.creative,
  id: 'world',
  name: '월드',
  theme: {
    ...MENU_PRESETS.creative.theme,
    bgColor: 'rgba(18, 20, 28, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    accentColor: '#ffd84a',
    surfaceColor: 'rgba(255, 255, 255, 0.05)',
    mutedTextColor: 'rgba(243, 244, 248, 0.76)',
  },
};

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

export { RICH_CAMERA_OPTION } from './world/data';
export { S3 };

setDefaultToonMode(DEFAULT_TOON_MODE);

const WorldEditorSurface = lazy(() => import('./WorldEditorSurface'));
const DEFAULT_EDITOR_SHELL_OPTIONS: NonNullable<WorldPageProps['editorShellOptions']> = {};
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
  compactHud = true,
  includeEditorAuxPanels = true,
  showDiagnostics = false,
  onRuntimeReady,
  sceneChildren,
  overlayChildren,
  editorShellOptions = DEFAULT_EDITOR_SHELL_OPTIONS,
  children,
}: WorldPageProps) => {
  const sceneDocumentSession = useMemo(() => getWorldSceneDocumentSession(), []);
  const runtime = useMemo(
    () => createWorldRuntime({ sceneDocumentSession }),
    [sceneDocumentSession],
  );
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const fogEnabled = useBuildingStore((s) => s.showFog);
  const fogColor = useBuildingStore((s) => s.fogColor);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
  const [focusedFeature, setFocusedFeature] = useState<WorldFocusInfo | null>(null);
  const [postprocessingEnabled, setPostprocessingEnabled] = useState(false);
  const worldMode = showEditor ? EDITOR_WORLD_MODE : DEFAULT_WORLD_MODE;
  const worldCameraOption = showEditor ? EDITOR_WORLD_CAMERA_OPTION : DEFAULT_WORLD_CAMERA_OPTION;
  const handleRuntimeReady = useCallback(() => {
    setRuntimeRevision((revision) => revision + 1);
    onRuntimeReady?.();
  }, [onRuntimeReady]);
  const handleFeatureFocus = useCallback((focus: WorldFocusInfo) => {
    setFocusedFeature(focus);
  }, []);
  const handleFeatureFocusClose = useCallback(() => {
    restoreCameraCloseUp();
    setFocusedFeature(null);
  }, []);
  const characterMenuRenderers = useMemo<CharacterMenuRenderers>(
    () => ({
      header: (menu) => (
        <div
          className={menu.classNameFor('header')}
          style={menu.styleFor('header', { borderColor: menu.preset.theme.borderColor })}
        >
          <div>
            <h2 className={menu.classNameFor('title')}>캐릭터 꾸미기</h2>
            <span style={{ color: menu.preset.theme.mutedTextColor }}>{menu.appearance.name}</span>
          </div>
          <div className={menu.classNameFor('actions')}>
            <button
              type="button"
              className={menu.classNameFor('ghostButton')}
              style={menu.styleFor('ghostButton', menu.getButtonStyle())}
              onClick={menu.actions.reset}
            >
              초기화
            </button>
            <button
              type="button"
              className={menu.classNameFor('primaryButton')}
              style={menu.styleFor('primaryButton', menu.getButtonStyle(true))}
              onClick={menu.actions.close}
            >
              완료
            </button>
          </div>
        </div>
      ),
      emptyAssets: (menu, slot) => (
        <div
          className={menu.classNameFor('emptyState')}
          style={menu.styleFor('emptyState', { borderColor: menu.preset.theme.borderColor })}
        >
          {menu.labelMaps.slots[slot]} 에셋이 아직 등록되지 않았습니다.
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
          <Suspense fallback={null}>
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
            {postprocessingEnabled && (
              <ToonOutlines edgeStrength={4} extraEffects={<ColorGrade intensity={0.8} />}>
                <group />
              </ToonOutlines>
            )}
            <GaesupWorldContent
              showGrid={EXAMPLE_CONFIG.showGrid}
              showAxes={EXAMPLE_CONFIG.showAxes}
            >
              <WorldSceneDocumentRootMarkers session={sceneDocumentSession} />
              <Physics debug={showDiagnostics} interpolate>
                {!showEditor && <Player />}
                {sceneChildren}
                <Ground showGrid={showDiagnostics && !showEditor} />
                {showEditor ? (
                  <Scenery enableCloseUp={!showEditor} />
                ) : (
                  <Scenery enableCloseUp={!showEditor} onFocus={handleFeatureFocus} />
                )}
                {!showEditor && <RideableVehicles />}
                {!showEditor && <Clicker />}
                {!showEditor && <GroundClicker />}
                {!showEditor && <TeleportOnClick modifierKey="altKey" />}
                <BuildingController showGrid={showEditor ? undefined : false} />
                {!showEditor && <CharacterSpeechBalloon />}
                <InteractionTracker />
                {!showEditor && <ToolUseController useKey="f" />}
                <Footprints />
                <GrassDriver />
                {!showEditor && <TeleportMarkers />}
                {!showEditor && <NavigationRouteProbe />}
                <RoomVisibilityDriver />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <WorldSystems runtime={runtime} onRuntimeReady={handleRuntimeReady} />
        {overlayChildren}

        {showHud && (
          <>
            <RuntimeSaveDiagnosticsToaster />
            <ToastHost position="top-right" />

            <HudShell showEnvironmentControls={!showEditor} compact={compactHud}>
              {!showEditor && <FeatureAccessPanel />}
              {!showEditor && <CloseUpControls />}
            </HudShell>
            {showDiagnostics && <PerformanceOverlay />}
            {!showEditor && (
              <WorldFocusModal focus={focusedFeature} onClose={handleFeatureFocusClose} />
            )}

            <InteractionPrompt enabled={!showEditor} />
            <DialogBox />
            <QuestLogUI toggleKey="j" />
            <MailboxUI toggleKey="m" />
            <CatalogUI toggleKey="k" />
            <InventoryUI toggleKey="i" />
            <CraftingUI toggleKey="v" />

            <HotbarUI />
            {!showEditor && <RideableUIRenderer />}
            <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />

            <CharacterCreator
              toggleKey="o"
              preset="world"
              customPresets={{ world: WORLD_CHARACTER_MENU_PRESET }}
            />
            <CharacterMenu
              toggleKey="c"
              preset="world"
              customPresets={{ world: WORLD_CHARACTER_MENU_PRESET }}
              hiddenSlots={['face', 'glasses']}
              features={{ savePresets: false, tagFilter: true, ownedOnly: true }}
              labels={{
                title: '캐릭터 꾸미기',
                tagFilter: '태그',
              }}
              renderers={characterMenuRenderers}
            />
            {showDiagnostics && (
              <button
                type="button"
                className={`world-postprocessing-toggle${postprocessingEnabled ? ' world-postprocessing-toggle--active' : ''}`}
                onClick={() => setPostprocessingEnabled((enabled) => !enabled)}
              >
                {postprocessingEnabled ? '후처리 끄기' : '후처리 켜기'}
              </button>
            )}
            {!showEditor && <TouchControls />}
          </>
        )}
      </GaesupWorld>
      {showEditor && (
        <Suspense fallback={null}>
          <GaesupRuntimeProvider runtime={runtime} revision={runtimeRevision}>
            <WorldEditorSurface
              showEditorShell={showEditorShell}
              includeEditorAuxPanels={includeEditorAuxPanels}
              editorShellOptions={editorShellOptions}
              sceneDocumentSession={sceneDocumentSession}
            />
          </GaesupRuntimeProvider>
        </Suspense>
      )}
      {children}
    </>
  );
};
