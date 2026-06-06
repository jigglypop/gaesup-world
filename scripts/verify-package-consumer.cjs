const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const tmpRoot = path.join(root, '.tmp', 'package-consumer');
const consumerRoot = path.join(tmpRoot, 'consumer');
const packageJsonPath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function run(command, args, options = {}) {
  childProcess.execFileSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: 'inherit',
    env: process.env,
  });
}

function runWithOutput(command, args, options = {}) {
  return childProcess.execFileSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: process.env,
  });
}

function npmCommand() {
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (fs.existsSync(npmCli)) {
    return { command: process.execPath, args: [npmCli] };
  }
  return { command: 'npm', args: [] };
}

function runNpm(args, options = {}) {
  const npm = npmCommand();
  run(npm.command, [...npm.args, ...args], options);
}

function runNpmWithOutput(args, options = {}) {
  const npm = npmCommand();
  return runWithOutput(npm.command, [...npm.args, ...args], options);
}

function normalizePackagePath(filePath) {
  return filePath.replace(/^\.\//, '').replace(/\\/g, '/');
}

function getExportTargets() {
  const targets = [];

  for (const entry of Object.values(packageJson.exports)) {
    if (typeof entry === 'string') {
      targets.push(entry);
      continue;
    }

    if (entry.import && entry.import.types) targets.push(entry.import.types);
    if (entry.import && entry.import.default) targets.push(entry.import.default);
    if (entry.require && entry.require.types) targets.push(entry.require.types);
    if (entry.require && entry.require.default) targets.push(entry.require.default);
  }

  return targets.map(normalizePackagePath).sort();
}

function getJsExportSpecifiers() {
  return Object.entries(packageJson.exports)
    .filter(([, entry]) => typeof entry !== 'string')
    .map(([subpath]) => (subpath === '.' ? packageJson.name : `${packageJson.name}${subpath.slice(1)}`))
    .sort();
}

function resetTmpRoot() {
  const resolvedTmpRoot = path.resolve(tmpRoot);
  const resolvedRoot = path.resolve(root);

  if (!resolvedTmpRoot.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`Refusing to clean unexpected path: ${resolvedTmpRoot}`);
  }

  fs.rmSync(resolvedTmpRoot, { recursive: true, force: true });
  fs.mkdirSync(resolvedTmpRoot, { recursive: true });
}

function assertBuiltExportTargetsExist() {
  const missing = getExportTargets().filter((target) => !fs.existsSync(path.join(root, target)));
  if (missing.length > 0) {
    throw new Error(
      [
        'Package export targets are missing from dist/.',
        'Run `npm run build` before verifying package consumption.',
        ...missing.map((target) => `- ${target}`),
      ].join('\n')
    );
  }
}

function packPackage() {
  const output = runNpmWithOutput([
    'pack',
    '--json',
    '--ignore-scripts',
    '--pack-destination',
    tmpRoot,
  ]);
  const packResult = JSON.parse(output)[0];
  const tarballPath = path.join(tmpRoot, packResult.filename);
  const packedFiles = new Set(packResult.files.map((file) => normalizePackagePath(file.path)));
  const missingPackedTargets = getExportTargets().filter((target) => !packedFiles.has(target));
  const forbiddenFiles = Array.from(packedFiles).filter((file) =>
    /^(src|examples|demo-dist|server|scripts|docs|\.tmp)\//.test(file)
  );

  if (missingPackedTargets.length > 0) {
    throw new Error(
      [
        'npm pack did not include every package export target.',
        ...missingPackedTargets.map((target) => `- ${target}`),
      ].join('\n')
    );
  }

  if (forbiddenFiles.length > 0) {
    throw new Error(
      [
        'npm pack included development-only files.',
        ...forbiddenFiles.map((target) => `- ${target}`),
      ].join('\n')
    );
  }

  return tarballPath;
}

function writeConsumerProject(tarballPath) {
  fs.mkdirSync(consumerRoot, { recursive: true });

  const relativeTarball = normalizePackagePath(path.relative(consumerRoot, tarballPath));
  const consumerDependencies = {
    'gaesup-world': `file:${relativeTarball}`,
    ...packageJson.peerDependencies,
  };
  const allJsExportSpecifiers = JSON.stringify(getJsExportSpecifiers(), null, 2);
  const namedRuntimeModules = JSON.stringify(
    [
      ['gaesup-world', ['GaesupWorld', 'ActionEquipmentPanel', 'createGaesupRuntime', 'createBuildingPlugin', 'requestCameraCloseUp', 'playCameraCinematic', 'TeleportOnClick', 'TeleportMarker', 'createTeleportDestination', 'resolveEquippedCharacterAttachments']],
      ['gaesup-world/admin', ['GaesupAdmin']],
      ['gaesup-world/assets', ['useAssetStore']],
      ['gaesup-world/blueprints', ['WARRIOR_BLUEPRINT']],
      ['gaesup-world/blueprints/editor', ['BlueprintEditor']],
      ['gaesup-world/building', ['BuildingUI', 'GrassDriver']],
      ['gaesup-world/editor', ['Editor', 'CinematicPanel', 'createEditorShell']],
      ['gaesup-world/gameplay', ['GameplayEventEngine', 'SEED_GAMEPLAY_EVENTS']],
      ['gaesup-world/navigation', ['NavigationSystem']],
      ['gaesup-world/network', ['ConnectionForm', 'defaultMultiplayerConfig']],
      ['gaesup-world/plugins', ['defineGaesupPlugin']],
      ['gaesup-world/postprocessing', ['ColorGrade', 'parseCubeLut']],
      ['gaesup-world/runtime', ['createGaesupRuntime', 'createDefaultSaveSystem']],
      ['gaesup-world/server-contracts', ['createGameCommand', 'createServerPluginHost']],
    ],
    null,
    2
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'gaesup-world-package-consumer',
        private: true,
        type: 'module',
        dependencies: consumerDependencies,
        devDependencies: {},
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          esModuleInterop: true,
          noEmit: true,
        },
        include: ['consumer.tsx'],
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'consumer.tsx'),
    `import type { ComponentType } from 'react';

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
`
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'runtime-smoke.mjs'),
    `const allModules = ${allJsExportSpecifiers};
const namedModules = ${namedRuntimeModules};

for (const specifier of allModules) {
  await import(specifier);
}

for (const [specifier, names] of namedModules) {
  const mod = await import(specifier);
  for (const name of names) {
    if (!(name in mod)) {
      throw new Error(\`\${specifier} is missing runtime export \${name}\`);
    }
  }
}

console.log('ESM runtime import smoke passed.');
`
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'runtime-smoke.cjs'),
    `const allModules = ${allJsExportSpecifiers};
const namedModules = ${namedRuntimeModules};

for (const specifier of allModules) {
  require(specifier);
}

for (const [specifier, names] of namedModules) {
  const mod = require(specifier);
  for (const name of names) {
    if (!(name in mod)) {
      throw new Error(\`\${specifier} is missing runtime export \${name}\`);
    }
  }
}

console.log('CJS runtime require smoke passed.');
`
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'index.html'),
    `<div id="root"></div><script type="module" src="/browser-app.tsx"></script>`
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'browser-app.tsx'),
    `import React from 'react';
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
`
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'vite.config.mjs'),
    `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'vite-dist',
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(''),
  },
});
`
  );
}

function assertConsumerPeerDependenciesInstalled() {
  const missing = Object.keys(packageJson.peerDependencies ?? {}).filter((dependencyName) => {
    const dependencyPath = path.join(consumerRoot, 'node_modules', ...dependencyName.split('/'));
    return !fs.existsSync(dependencyPath);
  });

  if (missing.length > 0) {
    throw new Error(
      [
        'Consumer project did not install every gaesup-world peer dependency locally.',
        ...missing.map((dependencyName) => `- ${dependencyName}`),
      ].join('\n')
    );
  }
}

function main() {
  resetTmpRoot();
  assertBuiltExportTargetsExist();
  const tarballPath = packPackage();
  writeConsumerProject(tarballPath);

  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--legacy-peer-deps'], {
    cwd: consumerRoot,
  });
  assertConsumerPeerDependenciesInstalled();
  run(process.execPath, [path.join(root, 'node_modules', 'typescript', 'lib', 'tsc.js'), '-p', 'tsconfig.json'], {
    cwd: consumerRoot,
  });
  run(process.execPath, ['runtime-smoke.mjs'], { cwd: consumerRoot });
  run(process.execPath, ['runtime-smoke.cjs'], { cwd: consumerRoot });
  run(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], {
    cwd: consumerRoot,
  });

  console.log('Package consumer verification passed.');
}

main();
