import 'reflect-metadata'
import './core/initializeBridges';

export {
  GaesupWorld,
  GaesupController,
  // Animation
  
  AnimationDebugPanel,
  // Camera
  Camera,
  CameraDebugPanel,
  CameraPresets,
  // Motions
  MotionController,
  MotionDebugPanel,
  MotionUI,
  Teleport,
  // Interaction
  Clicker,
  Gamepad,
  GroundClicker,
  // World
  World,
  WorldContainer,
  // UI
  SpeechBalloon,
  // Networks (multiplayer)
  useMultiplayer,
  usePlayerNetwork,
  useNetworkBridge,
  useNetworkMessage,
  useNetworkGroup,
  useNetworkStats,
  useNPCConnection,
  defaultMultiplayerConfig,
  MultiplayerCanvas,
  RemotePlayer,
  ConnectionForm,
  PlayerInfoOverlay,
  // Building
  V3,
  V30,
  V31,
  MiniMap,
  MinimapPlatform,
  BuildingSystem,
  TileSystem,
  WallSystem,
  BuildingUI,
  GridHelper,
  useGaesupController,
  useTeleport,
  useBuildingEditor,
  useBuildingStore,
  BuildingController,
  Editor,
  FocusableObject,
  GaeSupProps,
  GaesupWorldContent,
  useGaesupStore,
  // NPC
  useNPCStore,
  // Environment meshes
  Sakura,
  SakuraBatch,
  Sand,
  SandBatch,
  Snowfield,
  SnowfieldBatch,
  Snow,
  Grass,
  Water,
  Billboard,
  // Toon / Outline
  createToonMaterial,
  getToonGradient,
  setDefaultToonMode,
  getDefaultToonMode,
  disposeToonGradients,
  applyToonToScene,
  ToonOutlines,
  Outlined,
} from './core';
export type {
  SakuraTreeEntry,
  SandEntry,
  SnowfieldEntry,
  ToonOutlinesProps,
  OutlinedProps,
} from './core';
export { GaesupAdmin } from './admin';
