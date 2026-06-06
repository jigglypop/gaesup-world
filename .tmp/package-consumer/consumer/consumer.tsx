import type { ComponentType } from 'react';

import {
  BuildingUI,
  DEFAULT_CHARACTER_ATTACHMENT_SOCKETS,
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  GaesupWorld,
  InventoryUI,
  QuestLogUI,
  ActionEquipmentPanel,
  TeleportMarker,
  TeleportOnClick,
  applyCharacterEquipmentPreset,
  createBuildingPlugin,
  createCameraCloseUpPreset,
  createCameraPlugin,
  createGaesupRuntime,
  createTeleportDestination,
  findTeleportDestination,
  playCameraCinematic,
  requestCameraCloseUp,
  resolveEquippedCharacterAttachments,
  restoreCameraCloseUp,
  teleportDestinationToVector3,
  toggleCharacterWeapon,
  type GaesupRuntime,
} from 'gaesup-world';
import { GaesupAdmin } from 'gaesup-world/admin';
import { HttpAssetSource } from 'gaesup-world/assets';
import { WARRIOR_BLUEPRINT } from 'gaesup-world/blueprints';
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
import { GrassDriver } from 'gaesup-world/building';
import { CinematicPanel, Editor, createEditorShell } from 'gaesup-world/editor';
import { GameplayEventEngine, SEED_GAMEPLAY_EVENTS } from 'gaesup-world/gameplay';
import { NavigationSystem } from 'gaesup-world/navigation';
import {
  ConnectionForm,
  MultiplayerCanvas,
  defaultMultiplayerConfig,
  useMultiplayer,
} from 'gaesup-world/network';
import { ColorGrade, parseCubeLut } from 'gaesup-world/postprocessing';
import { defineGaesupPlugin } from 'gaesup-world/plugins';
import { createDefaultSaveSystem } from 'gaesup-world/runtime';
import { createGameCommand, createServerPluginHost } from 'gaesup-world/server-contracts';

const runtime: GaesupRuntime = createGaesupRuntime({
  plugins: [createCameraPlugin(), createBuildingPlugin()],
});

const components: ComponentType<any>[] = [
  GaesupWorld as ComponentType<any>,
  BuildingUI as ComponentType<any>,
  InventoryUI as ComponentType<any>,
  QuestLogUI as ComponentType<any>,
  ActionEquipmentPanel as ComponentType<any>,
  TeleportOnClick as ComponentType<any>,
  TeleportMarker as ComponentType<any>,
  GaesupAdmin as ComponentType<any>,
  BlueprintEditor as ComponentType<any>,
  GrassDriver as ComponentType<any>,
  Editor as ComponentType<any>,
  CinematicPanel as ComponentType<any>,
  ConnectionForm as ComponentType<any>,
  MultiplayerCanvas as ComponentType<any>,
  ColorGrade as ComponentType<any>,
];

const plugin = defineGaesupPlugin({
  id: 'consumer.plugin',
  name: 'Consumer Plugin',
  version: '0.0.0',
  setup() {},
});

const shell = createEditorShell();
const gameplay = new GameplayEventEngine({ blueprints: SEED_GAMEPLAY_EVENTS });
const navigation = NavigationSystem.getInstance();
const saveSystem = createDefaultSaveSystem();
const host = createServerPluginHost();
const command = createGameCommand({
  domain: 'consumer',
  action: 'command',
  actorId: 'actor-1',
  payload: { ok: true },
});
const assets = new HttpAssetSource('/assets');
const closeUpPreset = createCameraCloseUpPreset([0, 1, 0]);
const teleportDestination = createTeleportDestination({
  id: 'consumer-spawn',
  name: 'Consumer Spawn',
  position: [0, 0, 0],
});
const teleportPosition = teleportDestinationToVector3(teleportDestination);
const foundTeleportDestination = findTeleportDestination([teleportDestination], 'consumer-spawn');
applyCharacterEquipmentPreset(DEFAULT_CHARACTER_EQUIPMENT_PRESETS[0]!);
const cinematicPlayback = playCameraCinematic([
  { kind: 'lookAt', target: [0, 1, 0], durationMs: 1, focusDistance: 4 },
  { kind: 'dolly', target: [0, 1, 2], toDistance: 3, durationMs: 1 },
  { kind: 'orbit', target: [0, 1, 0], radius: 5, angleDeg: 45, durationMs: 1 },
  { kind: 'shake', intensity: 0.1, durationMs: 1 },
  { kind: 'fade', direction: 'inOut', durationMs: 1 },
  { kind: 'expression', face: 'wink', durationMs: 1 },
  { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 1 },
  { kind: 'teleport', position: [0, 0, 1], durationMs: 1 },
  { kind: 'animation', name: 'wave', durationMs: 1 },
  { kind: 'npcMove', npcId: 'consumer-npc', position: [1, 0, 1], durationMs: 1 },
  { kind: 'event', name: 'consumer:event', payload: { ok: true }, durationMs: 1 },
], {
  restoreOnComplete: false,
  onTeleport: () => {},
  onAnimation: () => {},
  onNpcMove: () => {},
  onEvent: () => {},
});
const attachments = resolveEquippedCharacterAttachments({
  outfits: {
    hat: null,
    top: null,
    bottom: null,
    shoes: null,
    face: null,
    weapon: 'starter-sword',
    accessory: null,
  },
  assets: {
    'starter-sword': {
      id: 'starter-sword',
      name: 'Starter Sword',
      kind: 'weapon',
      slot: 'weapon',
    },
  },
});

void runtime;
void components;
void plugin;
void shell;
void gameplay;
void navigation;
void saveSystem;
void host;
void command;
void assets;
void closeUpPreset;
void teleportDestination;
void teleportPosition;
void foundTeleportDestination;
void cinematicPlayback;
void attachments;
void DEFAULT_CHARACTER_ATTACHMENT_SOCKETS;
void DEFAULT_CHARACTER_EQUIPMENT_PRESETS;
void toggleCharacterWeapon;
void playCameraCinematic;
void requestCameraCloseUp;
void restoreCameraCloseUp;
void WARRIOR_BLUEPRINT;
void defaultMultiplayerConfig;
void useMultiplayer;
void parseCubeLut;
