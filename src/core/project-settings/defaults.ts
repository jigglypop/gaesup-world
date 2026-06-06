import type { ProjectSettings } from './types';

export const PROJECT_SETTINGS_VERSION = 1 as const;

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  version: PROJECT_SETTINGS_VERSION,
  name: 'Gaesup World',
  physics: {
    enabled: true,
    gravity: [0, -9.81, 0],
    timeStep: 1 / 60,
    maxSubSteps: 4,
    solverIterations: 8,
    collisionMatrix: {
      default: ['default', 'environment', 'interactable'],
      environment: ['default', 'player', 'npc'],
      player: ['environment', 'interactable', 'npc'],
      npc: ['environment', 'player', 'interactable'],
      interactable: ['default', 'player', 'npc'],
    },
  },
  rendering: {
    backend: 'auto',
    pixelRatio: 1.5,
    shadows: true,
    antialias: true,
    toneMapping: 'aces',
    outputColorSpace: 'srgb',
    toon: {
      enabled: true,
    },
    postprocessing: {
      enabled: false,
      bloom: false,
      colorGrade: false,
      outline: true,
    },
  },
  input: {
    pointerLock: false,
    touchControls: true,
    gamepad: true,
    bindings: {
      moveForward: [{ device: 'keyboard', code: 'KeyW' }],
      moveBackward: [{ device: 'keyboard', code: 'KeyS' }],
      moveLeft: [{ device: 'keyboard', code: 'KeyA' }],
      moveRight: [{ device: 'keyboard', code: 'KeyD' }],
      run: [{ device: 'keyboard', code: 'ShiftLeft' }],
      jump: [{ device: 'keyboard', code: 'Space' }],
      interact: [{ device: 'keyboard', code: 'KeyE' }],
    },
  },
  build: {
    target: 'web',
    publicPath: '/',
    assetBaseUrl: '/',
    sourceMaps: false,
    minify: true,
    chunkStrategy: 'domain-split',
  },
  editor: {
    autosave: true,
    autosaveIntervalMs: 30000,
    gridSize: 1,
    snapMove: 0.5,
    snapRotateDegrees: 15,
    showGizmos: true,
  },
};
