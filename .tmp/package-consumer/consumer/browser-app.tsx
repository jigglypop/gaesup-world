import React from 'react';
import { createRoot } from 'react-dom/client';

import 'gaesup-world/style.css';

import {
  BuildingUI,
  DEFAULT_CHARACTER_ATTACHMENT_SOCKETS,
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  GaesupWorld,
  InventoryUI,
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
} from 'gaesup-world';
import { GaesupAdmin } from 'gaesup-world/admin';
import { WARRIOR_BLUEPRINT } from 'gaesup-world/blueprints';
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
import { GrassDriver } from 'gaesup-world/building';
import { CinematicPanel, Editor, createEditorShell } from 'gaesup-world/editor';
import { GameplayEventEngine, SEED_GAMEPLAY_EVENTS } from 'gaesup-world/gameplay';
import { NavigationSystem } from 'gaesup-world/navigation';
import { ConnectionForm, defaultMultiplayerConfig } from 'gaesup-world/network';
import { ColorGrade, parseCubeLut } from 'gaesup-world/postprocessing';
import { defineGaesupPlugin } from 'gaesup-world/plugins';
import { createDefaultSaveSystem } from 'gaesup-world/runtime';
import { createGameCommand } from 'gaesup-world/server-contracts';

const runtime = createGaesupRuntime({
  plugins: [createCameraPlugin(), createBuildingPlugin()],
});
const plugin = defineGaesupPlugin({
  id: 'browser.consumer',
  name: 'Browser Consumer',
  version: '0.0.0',
  setup() {},
});
const shell = createEditorShell();
const gameplay = new GameplayEventEngine({ blueprints: SEED_GAMEPLAY_EVENTS });
const navigation = NavigationSystem.getInstance();
const saveSystem = createDefaultSaveSystem();
const command = createGameCommand({
  domain: 'browser',
  action: 'smoke',
  actorId: 'actor-1',
  payload: {},
});
const closeUpPreset = createCameraCloseUpPreset({ x: 0, y: 1, z: 0 });
const teleportDestination = createTeleportDestination({
  id: 'browser-spawn',
  name: 'Browser Spawn',
  position: [0, 0, 0],
});
const teleportPosition = teleportDestinationToVector3(teleportDestination);
const foundTeleportDestination = findTeleportDestination([teleportDestination], 'browser-spawn');
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
  { kind: 'npcMove', npcId: 'browser-npc', position: [1, 0, 1], durationMs: 1 },
  { kind: 'event', name: 'browser:event', payload: { ok: true }, durationMs: 1 },
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

function BrowserSmoke() {
  void runtime;
  void plugin;
  void shell;
  void gameplay;
  void navigation;
  void saveSystem;
  void command;
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
  void parseCubeLut;
  void BuildingUI;
  void InventoryUI;
  void ActionEquipmentPanel;
  void TeleportOnClick;
  void TeleportMarker;
  void GaesupAdmin;
  void BlueprintEditor;
  void GrassDriver;
  void Editor;
  void CinematicPanel;
  void ConnectionForm;
  void ColorGrade;
  return React.createElement(GaesupWorld, {}, React.createElement('div', {}, 'package browser smoke'));
}

createRoot(document.getElementById('root')!).render(React.createElement(BrowserSmoke));
