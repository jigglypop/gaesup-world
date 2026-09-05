const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules', 'typescript'));
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-world-package-consumer-'));
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
  const npmCli = path.join(
    path.dirname(process.execPath),
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js',
  );
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

function isWithinDirectory(directory, file) {
  const relative = path.relative(directory, file);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function formatDiagnostic(diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (!diagnostic.file || diagnostic.start === undefined) return message;

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `${normalizePackagePath(path.relative(consumerRoot, diagnostic.file.fileName))}:${position.line + 1}:${position.character + 1} - ${message}`;
}

function assertStrictPackageDeclarations(configFileName) {
  const configPath = path.join(consumerRoot, configFileName);
  const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readResult.error) {
    throw new Error(formatDiagnostic(readResult.error));
  }

  const packageRoot = path.join(consumerRoot, 'node_modules', packageJson.name);
  for (const exactOptionalPropertyTypes of [false, true]) {
    const parsedConfig = ts.parseJsonConfigFileContent(
      readResult.config,
      ts.sys,
      consumerRoot,
      { exactOptionalPropertyTypes, noEmit: true, skipLibCheck: false },
      configPath,
    );
    const program = ts.createProgram({
      rootNames: parsedConfig.fileNames,
      options: parsedConfig.options,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(
        (diagnostic) =>
          diagnostic.category === ts.DiagnosticCategory.Error &&
          diagnostic.file &&
          isWithinDirectory(packageRoot, diagnostic.file.fileName),
      );

    if (diagnostics.length > 0) {
      throw new Error(
        [
          `Strict declaration verification failed for ${configFileName} with exactOptionalPropertyTypes=${exactOptionalPropertyTypes}.`,
          ...diagnostics.map(formatDiagnostic),
        ].join('\n'),
      );
    }
  }
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
    .map(([subpath]) =>
      subpath === '.' ? packageJson.name : `${packageJson.name}${subpath.slice(1)}`,
    )
    .sort();
}

function getConsumerPeerDependencies() {
  const peerDependencies = packageJson.peerDependencies ?? {};
  const peerMetadata = packageJson.peerDependenciesMeta ?? {};

  return Object.fromEntries(
    Object.entries(peerDependencies).filter(
      ([dependencyName]) => peerMetadata[dependencyName]?.optional !== true,
    ),
  );
}

function resetTmpRoot() {
  const resolvedTmpRoot = path.resolve(tmpRoot);
  const resolvedTempDirectory = path.resolve(os.tmpdir());

  if (!resolvedTmpRoot.startsWith(resolvedTempDirectory + path.sep)) {
    throw new Error(`Refusing to clean unexpected path: ${resolvedTmpRoot}`);
  }

  fs.rmSync(resolvedTmpRoot, { recursive: true, force: true });
  fs.mkdirSync(resolvedTmpRoot, { recursive: true });
}

function cleanupTmpRoot() {
  const resolvedTmpRoot = path.resolve(tmpRoot);
  const resolvedTempDirectory = path.resolve(os.tmpdir());

  if (!resolvedTmpRoot.startsWith(resolvedTempDirectory + path.sep)) {
    throw new Error(`Refusing to clean unexpected path: ${resolvedTmpRoot}`);
  }

  fs.rmSync(resolvedTmpRoot, { recursive: true, force: true });
}

function assertBuiltExportTargetsExist() {
  const missing = getExportTargets().filter((target) => !fs.existsSync(path.join(root, target)));
  if (missing.length > 0) {
    throw new Error(
      [
        'Package export targets are missing from dist/.',
        'Run `npm run build` before verifying package consumption.',
        ...missing.map((target) => `- ${target}`),
      ].join('\n'),
    );
  }
}

function collectDeclarationFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectDeclarationFiles(fullPath));
    } else if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.cts')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function snapshotDeclarationGraph() {
  const distRoot = path.join(root, 'dist');

  return collectDeclarationFiles(distRoot)
    .map((file) => {
      const relative = normalizePackagePath(path.relative(distRoot, file));
      const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      return `${relative}:${digest}`;
    })
    .join('\n');
}

function assertDeclarationFinalizerIdempotent() {
  const before = snapshotDeclarationGraph();
  run(process.execPath, [path.join(root, 'scripts', 'copy-cjs-types.cjs')]);
  const after = snapshotDeclarationGraph();

  if (after !== before) {
    throw new Error('Declaration finalizer changed the declaration graph on its second run.');
  }
}

function assertRendererDeclarationsAreR3FVersionNeutral() {
  const declarationPaths = [
    path.join(root, 'dist', 'core', 'rendering', 'webgpu.d.ts'),
    path.join(root, 'dist', 'core', 'rendering', 'webgpu.d.cts'),
  ];

  for (const declarationPath of declarationPaths) {
    if (!fs.existsSync(declarationPath)) {
      throw new Error(`Renderer declaration is missing: ${declarationPath}`);
    }
    if (fs.readFileSync(declarationPath, 'utf8').includes('@react-three/fiber')) {
      throw new Error(
        `Renderer declaration must not depend on version-specific R3F exports: ${declarationPath}`,
      );
    }
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
    /^(src|examples|demo-dist|server|scripts|docs|\.tmp)\//.test(file),
  );

  if (missingPackedTargets.length > 0) {
    throw new Error(
      [
        'npm pack did not include every package export target.',
        ...missingPackedTargets.map((target) => `- ${target}`),
      ].join('\n'),
    );
  }

  if (forbiddenFiles.length > 0) {
    throw new Error(
      [
        'npm pack included development-only files.',
        ...forbiddenFiles.map((target) => `- ${target}`),
      ].join('\n'),
    );
  }

  return tarballPath;
}

function createAutomationTypeProbe(typePrefix) {
  const qualify = (name) => `${typePrefix}${name}`;

  return `type ExpectedAutomationAction = {
  id: string;
  type: 'move' | 'click' | 'wait' | 'key' | 'custom';
  target?: Vector3;
  key?: string;
  duration?: number;
  delay?: number;
  beforeCallback?: () => void;
  afterCallback?: () => void;
  data?: Record<string, object | string | number | boolean | null | undefined>;
  timestamp?: number;
};
type ExpectedAutomationSettings = {
  throttle: number;
  autoStart: boolean;
  trackProgress: boolean;
  showVisualCues: boolean;
};
type ExpectedAutomationState = {
  isActive: boolean;
  queue: {
    actions: ExpectedAutomationAction[];
    currentIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    loop: boolean;
    maxRetries: number;
  };
  currentAction: ExpectedAutomationAction | null;
  executionStats: {
    totalExecuted: number;
    successRate: number;
    averageTime: number;
    errors: string[];
  };
  settings: ExpectedAutomationSettings;
};
type ExpectedAutomationConfig = {
  maxConcurrentActions: number;
  defaultDelay: number;
  retryDelay: number;
  timeoutDuration: number;
  enableLogging: boolean;
  visualCues: {
    showPath: boolean;
    showTargets: boolean;
    lineColor: string;
    targetColor: string;
  };
};
type ExpectedAutomationMetrics = {
  queueLength: number;
  executionTime: number;
  performance: number;
  memoryUsage: number;
  errorRate: number;
};
type IsExact<Actual, Expected> = [Actual] extends [Expected]
  ? [Expected] extends [Actual]
    ? true
    : false
  : false;
type AssertExact<Condition extends true> = Condition;
type AutomationActionContract = AssertExact<
  IsExact<${qualify('AutomationAction')}, ExpectedAutomationAction>
>;
type AutomationSettingsContract = AssertExact<
  IsExact<${qualify('AutomationSettings')}, ExpectedAutomationSettings>
>;
type AutomationStateContract = AssertExact<
  IsExact<${qualify('AutomationState')}, ExpectedAutomationState>
>;
type AutomationConfigContract = AssertExact<
  IsExact<${qualify('AutomationConfig')}, ExpectedAutomationConfig>
>;
type AutomationMetricsContract = AssertExact<
  IsExact<${qualify('AutomationMetrics')}, ExpectedAutomationMetrics>
>;
const automationActionTypes: Array<${qualify('AutomationAction')}['type']> = [
  'move',
  'click',
  'wait',
  'key',
  'custom',
];
declare const automationTarget: Vector3;
const automationBeforeCallback: NonNullable<${qualify(
    'AutomationAction',
  )}['beforeCallback']> = () => {};
const automationAfterCallback: NonNullable<${qualify(
    'AutomationAction',
  )}['afterCallback']> = () => {};
const minimalAutomationAction: ${qualify('AutomationAction')} = {
  id: 'minimal-action',
  type: 'wait',
};
const automationAction: ${qualify('AutomationAction')} = {
  id: 'consumer-action',
  type: 'custom',
  target: automationTarget,
  key: 'KeyE',
  duration: 10,
  delay: 20,
  beforeCallback: automationBeforeCallback,
  afterCallback: automationAfterCallback,
  data: {
    objectValue: { nested: true },
    stringValue: 'value',
    numberValue: 1,
    booleanValue: true,
    nullValue: null,
    undefinedValue: undefined,
  },
  timestamp: 1,
};
const automationSettings: ${qualify('AutomationSettings')} = {
  throttle: 100,
  autoStart: false,
  trackProgress: true,
  showVisualCues: true,
};
const automationState: ${qualify('AutomationState')} = {
  isActive: true,
  queue: {
    actions: [automationAction],
    currentIndex: 0,
    isRunning: true,
    isPaused: false,
    loop: false,
    maxRetries: 3,
  },
  currentAction: automationAction,
  executionStats: {
    totalExecuted: 1,
    successRate: 100,
    averageTime: 10,
    errors: [],
  },
  settings: automationSettings,
};
const automationConfig: ${qualify('AutomationConfig')} = {
  maxConcurrentActions: 1,
  defaultDelay: 100,
  retryDelay: 1000,
  timeoutDuration: 5000,
  enableLogging: true,
  visualCues: {
    showPath: true,
    showTargets: true,
    lineColor: '#00ff00',
    targetColor: '#ff0000',
  },
};
const automationMetrics: ${qualify('AutomationMetrics')} = {
  queueLength: 1,
  executionTime: 10,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0,
};
// @ts-expect-error Automation action type is a closed discriminant union.
const invalidAutomationType: ${qualify('AutomationAction')}['type'] = 'invalid';
// @ts-expect-error Automation action data excludes bigint values.
const invalidAutomationBigIntData: ${qualify('AutomationAction')}['data'] = { invalid: 1n };
// @ts-expect-error Automation action data excludes symbol values.
const invalidAutomationSymbolData: ${qualify('AutomationAction')}['data'] = { invalid: Symbol() };
automationBeforeCallback();
automationAfterCallback();
void automationActionTypes;
void minimalAutomationAction;
void automationAction;
void automationSettings;
void automationState;
void automationConfig;
void automationMetrics;
void invalidAutomationType;
void invalidAutomationBigIntData;
void invalidAutomationSymbolData;`;
}

function createRawInputTypeProbe(typePrefix, exactOptionalPropertyTypes) {
  const qualify = (name) => `${typePrefix}${name}`;
  const explicitUndefinedProbe = exactOptionalPropertyTypes
    ? `// @ts-expect-error isLookAround is exact optional and rejects explicit undefined.
const explicitUndefinedMouseLookAround: Partial<${qualify('MouseState')}> = { isLookAround: undefined };`
    : `const explicitUndefinedMouseLookAround: Partial<${qualify('MouseState')}> = { isLookAround: undefined };`;

  return `type ExpectedKeyboardState = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  shift: boolean;
  space: boolean;
  keyZ: boolean;
  keyR: boolean;
  keyF: boolean;
  keyE: boolean;
  escape: boolean;
};
type ExpectedMouseState = {
  target: Vector3;
  angle: number;
  isActive: boolean;
  hasArrived?: boolean;
  shouldRun: boolean;
  isLookAround?: boolean;
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
  wheel: number;
  position: Vector2;
};
type ExpectedGamepadState = {
  connected: boolean;
  leftStick: Vector2;
  rightStick: Vector2;
  triggers: {
    left: number;
    right: number;
  };
  buttons: Record<string, boolean>;
  vibration: {
    weak: number;
    strong: number;
  };
};
type ExpectedTouchState = {
  touches: Array<{
    id: number;
    position: Vector2;
    force: number;
  }>;
  gestures: {
    pinch: number;
    rotation: number;
    pan: Vector2;
  };
};
type IsRawInputExact<Actual, Expected> = (<Value>() => Value extends Actual ? 1 : 2) extends (
  <Value>() => Value extends Expected ? 1 : 2
)
  ? (<Value>() => Value extends Expected ? 1 : 2) extends (
      <Value>() => Value extends Actual ? 1 : 2
    )
    ? true
    : false
  : false;
type AssertRawInputExact<Condition extends true> = Condition;
type KeyboardStateContract = AssertRawInputExact<
  IsRawInputExact<${qualify('KeyboardState')}, ExpectedKeyboardState>
>;
type MouseStateContract = AssertRawInputExact<
  IsRawInputExact<${qualify('MouseState')}, ExpectedMouseState>
>;
type GamepadStateContract = AssertRawInputExact<
  IsRawInputExact<${qualify('GamepadState')}, ExpectedGamepadState>
>;
type TouchStateContract = AssertRawInputExact<
  IsRawInputExact<${qualify('TouchState')}, ExpectedTouchState>
>;
type MouseLookAroundOptionalContract = AssertRawInputExact<
  {} extends Pick<${qualify('MouseState')}, 'isLookAround'> ? true : false
>;
type MouseArrivalOptionalContract = AssertRawInputExact<
  {} extends Pick<${qualify('MouseState')}, 'hasArrived'> ? true : false
>;
type MouseArrivalValueContract = AssertRawInputExact<
  IsRawInputExact<Required<Pick<${qualify('MouseState')}, 'hasArrived'>>, { hasArrived: boolean }>
>;
type MouseLookAroundValueContract = AssertRawInputExact<
  IsRawInputExact<
    Required<Pick<${qualify('MouseState')}, 'isLookAround'>>,
    { isLookAround: boolean }
  >
>;
declare const rawInputVector2: Vector2;
declare const rawInputVector3: Vector3;
const keyboardState: ${qualify('KeyboardState')} = {
  forward: true,
  backward: false,
  leftward: false,
  rightward: true,
  shift: true,
  space: false,
  keyZ: false,
  keyR: false,
  keyF: false,
  keyE: true,
  escape: false,
};
const minimalMouseState: ${qualify('MouseState')} = {
  target: rawInputVector3,
  angle: 0,
  isActive: false,
  shouldRun: false,
  buttons: {
    left: false,
    right: false,
    middle: false,
  },
  wheel: 0,
  position: rawInputVector2,
};
const mouseState: ${qualify('MouseState')} = {
  ...minimalMouseState,
  isLookAround: true,
  hasArrived: true,
};
const gamepadState: ${qualify('GamepadState')} = {
  connected: true,
  leftStick: rawInputVector2,
  rightStick: rawInputVector2,
  triggers: {
    left: 0.25,
    right: 0.75,
  },
  buttons: { primary: true },
  vibration: {
    weak: 0.25,
    strong: 0.75,
  },
};
const touchState: ${qualify('TouchState')} = {
  touches: [
    {
      id: 1,
      position: rawInputVector2,
      force: 0.5,
    },
  ],
  gestures: {
    pinch: 1,
    rotation: 0,
    pan: rawInputVector2,
  },
};
${explicitUndefinedProbe}
void keyboardState;
void minimalMouseState;
void mouseState;
void gamepadState;
void touchState;
void explicitUndefinedMouseLookAround;`;
}

function createInteractionAggregateTypeProbe(typePrefix) {
  const qualify = (name) => `${typePrefix}${name}`;

  return `type ExpectedInteractionState = {
  keyboard: ${qualify('KeyboardState')};
  mouse: ${qualify('MouseState')};
  gamepad: ${qualify('GamepadState')};
  touch: ${qualify('TouchState')};
  lastUpdate: number;
  isActive: boolean;
};
type ExpectedInteractionConfig = {
  sensitivity: {
    mouse: number;
    gamepad: number;
    touch: number;
  };
  deadzone: {
    gamepad: number;
    touch: number;
  };
  smoothing: {
    mouse: number;
    gamepad: number;
  };
  invertY: boolean;
  enableVibration: boolean;
};
type ExpectedInteractionMetrics = {
  lastUpdate: number;
  inputLatency: number;
  frameTime: number;
  eventCount: number;
  activeInputs: string[];
  performanceScore: number;
};
type IsInteractionAggregateExact<Actual, Expected> = (<Value>() => Value extends Actual ? 1 : 2) extends (
  <Value>() => Value extends Expected ? 1 : 2
)
  ? (<Value>() => Value extends Expected ? 1 : 2) extends (
      <Value>() => Value extends Actual ? 1 : 2
    )
    ? true
    : false
  : false;
type AssertInteractionAggregateExact<Condition extends true> = Condition;
type InteractionStateContract = AssertInteractionAggregateExact<
  IsInteractionAggregateExact<${qualify('InteractionState')}, ExpectedInteractionState>
>;
type InteractionConfigContract = AssertInteractionAggregateExact<
  IsInteractionAggregateExact<${qualify('InteractionConfig')}, ExpectedInteractionConfig>
>;
type InteractionMetricsContract = AssertInteractionAggregateExact<
  IsInteractionAggregateExact<${qualify('InteractionMetrics')}, ExpectedInteractionMetrics>
>;
const interactionState: ${qualify('InteractionState')} = {
  keyboard: keyboardState,
  mouse: mouseState,
  gamepad: gamepadState,
  touch: touchState,
  lastUpdate: 1,
  isActive: true,
};
const interactionConfig: ${qualify('InteractionConfig')} = {
  sensitivity: {
    mouse: 1,
    gamepad: 1,
    touch: 1,
  },
  deadzone: {
    gamepad: 0.1,
    touch: 0.1,
  },
  smoothing: {
    mouse: 0.2,
    gamepad: 0.2,
  },
  invertY: false,
  enableVibration: true,
};
const interactionMetrics: ${qualify('InteractionMetrics')} = {
  lastUpdate: 1,
  inputLatency: 0,
  frameTime: 16,
  eventCount: 1,
  activeInputs: ['keyboard:keyE'],
  performanceScore: 100,
};
void interactionState;
void interactionConfig;
void interactionMetrics;`;
}

function createSceneDocumentRuntimeProbe(moduleName, idPrefix) {
  return `const sceneInitial = ${moduleName}.createSceneDocument({ id: '${idPrefix}-scene' });
const sceneCommand = {
  type: 'scene-object.create',
  object: ${moduleName}.createSceneObject({ id: '${idPrefix}-object', name: 'Package Object' }),
};
const directSceneResult = ${moduleName}.applySceneDocumentCommand(sceneInitial, sceneCommand);
if (!directSceneResult.accepted || directSceneResult.document.objects[0]?.id !== '${idPrefix}-object') {
  throw new Error('Direct scene document command application failed.');
}
const sceneController = ${moduleName}.createSceneDocumentController(sceneInitial);
const sceneResult = sceneController.dispatch(sceneCommand);
const sceneSnapshot = sceneController.getSnapshot();
if (
  !sceneResult.accepted ||
  sceneSnapshot !== sceneResult.document ||
  sceneController.getSnapshot() !== sceneSnapshot ||
  sceneSnapshot.objects[0]?.id !== '${idPrefix}-object' ||
  !Object.isFrozen(sceneSnapshot) ||
  !Object.isFrozen(sceneSnapshot.objects) ||
  !Object.isFrozen(sceneSnapshot.objects[0]?.transform.position)
) {
  throw new Error('Scene document controller did not publish its accepted result.');
}
if (${moduleName}.SCENE_DOCUMENT_SAVE_KEY !== 'scene-document') {
  throw new Error('Scene document save key export is incorrect.');
}
const sceneBinding = ${moduleName}.createSceneDocumentSaveBinding(sceneController);
if (sceneBinding.key !== 'scene-document') {
  throw new Error('Scene document save binding used the wrong persistence key.');
}
const serializedScene = sceneBinding.serialize();
if (serializedScene === sceneSnapshot || Object.isFrozen(serializedScene)) {
  throw new Error('Scene document save binding did not return a mutable owned clone.');
}`;
}

function writeConsumerProject(tarballPath) {
  fs.mkdirSync(consumerRoot, { recursive: true });

  const relativeTarball = normalizePackagePath(path.relative(consumerRoot, tarballPath));
  const consumerDependencies = {
    'gaesup-world': `file:${relativeTarball}`,
    ...getConsumerPeerDependencies(),
  };
  const allJsExportSpecifiers = JSON.stringify(getJsExportSpecifiers(), null, 2);
  const cjsTypeImports = getJsExportSpecifiers()
    .map((specifier, index) => {
      const namespace = specifier === packageJson.name ? 'rootModule' : `module${index}`;
      return `import ${namespace} = require('${specifier}');\nvoid ${namespace};`;
    })
    .join('\n');
  const cjsRootTypeProbe = `import type { CanvasProps } from '@react-three/fiber';
import type { Vector2, Vector3 } from 'three';
const rendererFactory: CanvasProps['gl'] = rootModule.createRenderer;
const physicsConfig: rootModule.PhysicsConfigType = { walkSpeed: 10 };
const sceneController = rootModule.createSceneDocumentController(
  rootModule.createSceneDocument({ id: 'cjs-consumer-scene' }),
);
const sceneCommand: rootModule.SceneDocumentCommand = {
  type: 'scene-object.create',
  object: rootModule.createSceneObject({ id: 'cjs-consumer-object', name: 'Consumer Object' }),
};
const directSceneResult: rootModule.SceneDocumentCommandResult =
  rootModule.applySceneDocumentCommand(rootModule.createSceneDocument({ id: 'cjs-direct-scene' }), sceneCommand);
const sceneResult: rootModule.SceneDocumentCommandResult = sceneController.dispatch(sceneCommand);
const sceneBinding = rootModule.createSceneDocumentSaveBinding(sceneController);
const sceneSaveKey: typeof rootModule.SCENE_DOCUMENT_SAVE_KEY = 'scene-document';
void rendererFactory;
void physicsConfig;
void directSceneResult;
void sceneResult;
void sceneBinding;
void sceneSaveKey;
${createAutomationTypeProbe('rootModule.')}
${createRawInputTypeProbe('rootModule.', true)}
${createInteractionAggregateTypeProbe('rootModule.')}`;
  const namedRuntimeModules = JSON.stringify(
    [
      [
        'gaesup-world',
        [
          'GaesupWorld',
          'ActionEquipmentPanel',
          'LegacyGrid',
          'createGaesupRuntime',
          'createBuildingPlugin',
          'applySceneDocumentCommand',
          'createSceneDocument',
          'createSceneDocumentController',
          'createSceneDocumentSaveBinding',
          'createSceneObject',
          'createSceneObjectEditorCommands',
          'SCENE_DOCUMENT_SAVE_KEY',
          'createRenderer',
          'isWebGPUAvailable',
          'requestCameraCloseUp',
          'playCameraCinematic',
          'TeleportOnClick',
          'TeleportMarker',
          'createTeleportDestination',
          'resolveEquippedCharacterAttachments',
        ],
      ],
      ['gaesup-world/admin', ['GaesupAdmin']],
      ['gaesup-world/assets', ['useAssetStore']],
      ['gaesup-world/blueprints', ['WARRIOR_BLUEPRINT']],
      ['gaesup-world/blueprints/editor', ['BlueprintEditor']],
      ['gaesup-world/building', ['BuildingUI', 'GrassDriver']],
      ['gaesup-world/editor', ['Editor', 'CinematicPanel', 'createEditorShell']],
      ['gaesup-world/gameplay', ['GameplayEventEngine', 'SEED_GAMEPLAY_EVENTS']],
      ['gaesup-world/navigation', ['NavigationSystem']],
      ['gaesup-world/network', ['ConnectionForm', 'defaultMultiplayerConfig']],
      ['gaesup-world/next', ['NextWorld', 'createThreeWebGpuBackend', 'isWebGpuAvailable']],
      ['gaesup-world/plugins', ['defineGaesupPlugin']],
      ['gaesup-world/postprocessing', ['ColorGrade', 'parseCubeLut']],
      ['gaesup-world/runtime', ['createGaesupRuntime', 'createDefaultSaveSystem']],
      ['gaesup-world/server-contracts', ['createGameCommand', 'createServerPluginHost']],
    ],
    null,
    2,
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
      2,
    ),
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: true,
          esModuleInterop: true,
          noEmit: true,
        },
        include: ['consumer.tsx'],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'tsconfig.cjs.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ['consumer.cts'],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'consumer.cts'),
    `${cjsTypeImports}\n${cjsRootTypeProbe}\n`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'tsconfig.raw-input-exact-false.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          exactOptionalPropertyTypes: false,
          skipLibCheck: true,
          noEmit: true,
        },
        include: [
          'raw-input-exact-false.ts',
          'raw-input-exact-false.cts',
          'renderer-exact-false.tsx',
          'renderer-exact-false.cts',
        ],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'raw-input-exact-false.ts'),
    `import type { Vector2, Vector3 } from 'three';
import type { GamepadState, KeyboardState, MouseState, TouchState } from 'gaesup-world';

${createRawInputTypeProbe('', false)}
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'raw-input-exact-false.cts'),
    `import type { Vector2, Vector3 } from 'three';
import rootModule = require('gaesup-world');

void rootModule;
${createRawInputTypeProbe('rootModule.', false)}
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'renderer-exact-false.tsx'),
    `import { Canvas } from '@react-three/fiber';
import { createRenderer } from 'gaesup-world';

const rendererCanvas = <Canvas gl={createRenderer} />;

void rendererCanvas;
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'renderer-exact-false.cts'),
    `import type { CanvasProps } from '@react-three/fiber';
import rootModule = require('gaesup-world');

const rendererFactory: CanvasProps['gl'] = rootModule.createRenderer;

void rendererFactory;
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'tsconfig.compat.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ['consumer-compat.ts'],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'consumer-compat.ts'),
    `import type { GltfAndSizeResult } from 'gaesup-world';
import type { GLTF } from 'three-stdlib';

declare const legacyGltf: GLTF;
const compatibleGltf: GltfAndSizeResult['gltf'] = legacyGltf;
const legacyRoundTripGltf: GLTF = compatibleGltf;

void compatibleGltf;
void legacyRoundTripGltf;
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'consumer.tsx'),
    `import { Canvas } from '@react-three/fiber';
import type { ComponentType } from 'react';
import type { Vector2, Vector3 } from 'three';

import {
  BuildingUI,
  DEFAULT_CHARACTER_ATTACHMENT_SOCKETS,
  DEFAULT_CHARACTER_EQUIPMENT_PRESETS,
  GaesupWorld,
  InventoryUI,
  QuestLogUI,
  ActionEquipmentPanel,
  SCENE_DOCUMENT_SAVE_KEY,
  TeleportMarker,
  TeleportOnClick,
  applyCharacterEquipmentPreset,
  applySceneDocumentCommand,
  createBuildingPlugin,
  createCameraCloseUpPreset,
  createCameraPlugin,
  createColliderComponent,
  createGaesupRuntime,
  createRenderer,
  createSceneComponent,
  createSceneDocument,
  createSceneDocumentController,
  createSceneDocumentSaveBinding,
  createSceneObject,
  createSceneObjectEditorCommands,
  createTeleportDestination,
  findTeleportDestination,
  playCameraCinematic,
  requestCameraCloseUp,
  resolveEquippedCharacterAttachments,
  restoreCameraCloseUp,
  teleportDestinationToVector3,
  toggleCharacterWeapon,
  createMeshRendererComponent,
  type AutomationAction,
  type AutomationConfig,
  type AutomationMetrics,
  type AutomationSettings,
  type AutomationState,
  type CanonicalSceneJsonObject,
  type GamepadState,
  type GaesupRuntime,
  type InteractionConfig,
  type InteractionMetrics,
  type InteractionState,
  type KeyboardState,
  type MeshRendererComponentData,
  type MouseState,
  type PhysicsConfigType,
  type SceneDocument,
  type SceneDocumentCommand,
  type SceneDocumentCommandResult,
  type SceneJsonAuthoringObject,
  type SceneJsonObject,
  type SceneJsonValue,
  type SceneVector3,
  type TouchState,
  type UsePhysicsBridgeOptions,
} from 'gaesup-world';
import { GaesupAdmin } from 'gaesup-world/admin';
import { HttpAssetSource } from 'gaesup-world/assets';
import { BlueprintFactory, BlueprintSpawner, WARRIOR_BLUEPRINT, type BlueprintAnimationClips, type BlueprintMovementInput } from 'gaesup-world/blueprints';
import { AnimationBridge, useBlueprintEntity } from 'gaesup-world';
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

function BlueprintConsumer(props: {
  body: import('react').RefObject<import('@react-three/rapier').RapierRigidBody>;
  model: import('react').RefObject<import('three').Group>;
  clips: BlueprintAnimationClips;
}) {
  const movement: BlueprintMovementInput = { forward: true, isGrounded: true, cameraYaw: 0 };
  const config = { rigidBodyRef: props.body, innerGroupRef: props.model, animationClips: props.clips };
  const entity = BlueprintFactory.getInstance().createEntity(WARRIOR_BLUEPRINT, config);
  entity.update(1 / 60, movement);
  entity.dispose();
  useBlueprintEntity({ ...config, blueprint: WARRIOR_BLUEPRINT.id, getMovementInput: () => movement });
  return <BlueprintSpawner blueprint={WARRIOR_BLUEPRINT} animationClips={props.clips} getMovementInput={() => movement} />;
}
void BlueprintConsumer;

function verifyScopedAnimationCleanup(action: import('three').AnimationAction) {
  const bridge = new AnimationBridge();
  bridge.registerAnimations('character', { walk: action });
  bridge.unregisterAnimations('character', { walk: action });
  bridge.unregisterAnimations('character');
  bridge.dispose();
}
void verifyScopedAnimationCleanup;

const runtime: GaesupRuntime = createGaesupRuntime({
  plugins: [createCameraPlugin(), createBuildingPlugin()],
});
const rendererCanvas = <Canvas gl={createRenderer} />;
declare module 'gaesup-world' {
  interface MeshRendererComponentData {
    consumerLabel?: string;
  }
}
const augmentedMeshData: MeshRendererComponentData = { consumerLabel: 'consumer' };
const indexedMeshData: MeshRendererComponentData = { assetId: 'mesh', customValue: 1 };
// @ts-expect-error Authoring data must pass through a canonical creation boundary first.
const strictSceneJsonFromAuthoring: SceneJsonObject = indexedMeshData;
const customMeshData = createMeshRendererComponent(indexedMeshData);
const colliderComponent = createColliderComponent({ shape: 'box', size: [1, 2, 3] });
const colliderSize: SceneVector3 | undefined = colliderComponent.data.size;
type RequiredSceneData = SceneJsonObject & { requiredValue: string };
const requiredSceneComponent = createSceneComponent<'consumer.required', RequiredSceneData>({
  type: 'consumer.required',
  data: { requiredValue: 'value' },
});
// @ts-expect-error An explicitly required component data shape cannot be omitted.
createSceneComponent<'consumer.required', RequiredSceneData>({ type: 'consumer.required' });
const sceneController = createSceneDocumentController(
  createSceneDocument({ id: 'package-consumer-scene' }),
);
const sceneCommand: SceneDocumentCommand = {
  type: 'scene-object.create',
  object: createSceneObject({ id: 'package-consumer-object', name: 'Consumer Object' }),
};
const directSceneCommandResult: SceneDocumentCommandResult = applySceneDocumentCommand(
  createSceneDocument({ id: 'package-consumer-direct-scene' }),
  sceneCommand,
);
const sceneCommandResult: SceneDocumentCommandResult = sceneController.dispatch(sceneCommand);
const sceneDocument: SceneDocument = sceneController.getSnapshot();
const sceneSaveBinding = createSceneDocumentSaveBinding(sceneController);
const sceneEditorCommands = createSceneObjectEditorCommands(sceneController);
const sceneSaveKey: typeof SCENE_DOCUMENT_SAVE_KEY = 'scene-document';
const invalidSceneJson: SceneJsonAuthoringObject = { invalid: undefined };
const readSceneJsonValue = (data: SceneJsonObject): SceneJsonValue => data.value;
// @ts-expect-error The stable SceneJsonObject contract excludes explicit undefined.
const invalidStrictSceneJson: SceneJsonObject = { invalid: undefined };
// @ts-expect-error Canonical scene JSON values exclude undefined.
const invalidCanonicalSceneJson: CanonicalSceneJsonObject = { invalid: undefined };
// @ts-expect-error Scene component data rejects non-JSON values.
createMeshRendererComponent({ assetId: 'mesh', invalid: new Date() });
const optionalUndefinedMeshData: MeshRendererComponentData = { invalid: undefined };
const symbolMeshData: MeshRendererComponentData = { [Symbol('invalid')]: 'value' };
declare const physicsBodyRef: UsePhysicsBridgeOptions['rigidBodyRef'];
const physicsBridgeOptions: UsePhysicsBridgeOptions = {
  entityId: 'consumer-physics',
  rigidBodyRef: physicsBodyRef,
};
const physicsConfig: PhysicsConfigType = { walkSpeed: 10 };
${createAutomationTypeProbe('')}
${createRawInputTypeProbe('', true)}
${createInteractionAggregateTypeProbe('')}

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
    glasses: null,
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
void rendererCanvas;
void augmentedMeshData;
void strictSceneJsonFromAuthoring;
void customMeshData.data.customValue;
void colliderSize;
void invalidSceneJson;
void invalidStrictSceneJson;
void invalidCanonicalSceneJson;
void readSceneJsonValue;
void optionalUndefinedMeshData;
void symbolMeshData;
void physicsBridgeOptions;
void physicsConfig;
void requiredSceneComponent;
void directSceneCommandResult;
void sceneCommandResult;
void sceneDocument;
void sceneSaveBinding;
void sceneEditorCommands;
void sceneSaveKey;
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
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'runtime-smoke.mjs'),
    `const allModules = ${allJsExportSpecifiers};
const namedModules = ${namedRuntimeModules};
const rootModule = await import('gaesup-world');
const nextModule = await import('gaesup-world/next');
const accessorArray = [];
Object.defineProperty(accessorArray, '0', {
  configurable: true,
  enumerable: true,
  get: () => 'value',
});
accessorArray.length = 1;

for (const invalidData of [
  null,
  { invalid: undefined },
  { [Symbol('invalid')]: 'value' },
  { invalid: accessorArray },
]) {
  try {
    rootModule.createMeshRendererComponent(invalidData);
    throw new Error('createMeshRendererComponent accepted non-canonical JSON data.');
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
  }
}

const authoringData = { nested: { value: 1 } };
const ownedComponent = rootModule.createMeshRendererComponent(authoringData);
authoringData.nested.value = 2;
if (
  ownedComponent.data === authoringData ||
  ownedComponent.data.nested === authoringData.nested ||
  ownedComponent.data.nested.value !== 1
) {
  throw new Error('Scene component data did not create an owned canonical copy.');
}

${createSceneDocumentRuntimeProbe('rootModule', 'esm-package')}

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

for (const name of [
  'applySceneDocumentCommand',
  'createRenderer',
  'createSceneDocumentController',
  'createSceneDocumentSaveBinding',
  'isWebGPUAvailable',
]) {
  if (typeof rootModule[name] !== 'function') {
    throw new Error('gaesup-world runtime export ' + name + ' is not a function');
  }
}

for (const name of ['createThreeWebGpuBackend', 'isWebGpuAvailable']) {
  if (typeof nextModule[name] !== 'function') {
    throw new Error('gaesup-world/next runtime export ' + name + ' is not a function');
  }
}

console.log('ESM runtime import smoke passed.');
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'runtime-smoke.cjs'),
    `const allModules = ${allJsExportSpecifiers};
const namedModules = ${namedRuntimeModules};
const rootModule = require('gaesup-world');
const nextModule = require('gaesup-world/next');
const accessorArray = [];
Object.defineProperty(accessorArray, '0', {
  configurable: true,
  enumerable: true,
  get: () => 'value',
});
accessorArray.length = 1;

for (const invalidData of [
  null,
  { invalid: undefined },
  { [Symbol('invalid')]: 'value' },
  { invalid: accessorArray },
]) {
  try {
    rootModule.createMeshRendererComponent(invalidData);
    throw new Error('createMeshRendererComponent accepted non-canonical JSON data.');
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
  }
}

const authoringData = { nested: { value: 1 } };
const ownedComponent = rootModule.createMeshRendererComponent(authoringData);
authoringData.nested.value = 2;
if (
  ownedComponent.data === authoringData ||
  ownedComponent.data.nested === authoringData.nested ||
  ownedComponent.data.nested.value !== 1
) {
  throw new Error('Scene component data did not create an owned canonical copy.');
}

${createSceneDocumentRuntimeProbe('rootModule', 'cjs-package')}

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

for (const name of [
  'applySceneDocumentCommand',
  'createRenderer',
  'createSceneDocumentController',
  'createSceneDocumentSaveBinding',
  'isWebGPUAvailable',
]) {
  if (typeof rootModule[name] !== 'function') {
    throw new Error('gaesup-world runtime export ' + name + ' is not a function');
  }
}

for (const name of ['createThreeWebGpuBackend', 'isWebGpuAvailable']) {
  if (typeof nextModule[name] !== 'function') {
    throw new Error('gaesup-world/next runtime export ' + name + ' is not a function');
  }
}

console.log('CJS runtime require smoke passed.');
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'index.html'),
    `<div id="root"></div><script type="module" src="/browser-app.tsx"></script>`,
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
    glasses: null,
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
`,
  );

  fs.writeFileSync(
    path.join(consumerRoot, 'vite.config.mjs'),
    `export default {
  build: {
    outDir: 'vite-dist',
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_ENABLE_BRIDGE_LOGS': JSON.stringify(''),
  },
};
`,
  );
}

function assertConsumerPeerDependenciesInstalled() {
  const missing = Object.keys(getConsumerPeerDependencies()).filter((dependencyName) => {
    const dependencyPath = path.join(consumerRoot, 'node_modules', ...dependencyName.split('/'));
    return !fs.existsSync(dependencyPath);
  });

  if (missing.length > 0) {
    throw new Error(
      [
        'Consumer project did not install every required or exercised peer dependency locally.',
        ...missing.map((dependencyName) => `- ${dependencyName}`),
      ].join('\n'),
    );
  }
}

function main() {
  try {
    resetTmpRoot();
    assertBuiltExportTargetsExist();
    assertDeclarationFinalizerIdempotent();
    assertRendererDeclarationsAreR3FVersionNeutral();
    const tarballPath = packPackage();
    writeConsumerProject(tarballPath);

    runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: consumerRoot,
    });
    assertConsumerPeerDependenciesInstalled();
    run(
      process.execPath,
      [path.join(root, 'node_modules', '@typescript', 'native', 'bin', 'tsc'), '-p', 'tsconfig.json'],
      {
        cwd: consumerRoot,
      },
    );
    run(
      process.execPath,
      [path.join(root, 'node_modules', '@typescript', 'native', 'bin', 'tsc'), '-p', 'tsconfig.cjs.json'],
      {
        cwd: consumerRoot,
      },
    );
    run(
      process.execPath,
      [
        path.join(root, 'node_modules', '@typescript', 'native', 'bin', 'tsc'),
        '-p',
        'tsconfig.raw-input-exact-false.json',
      ],
      {
        cwd: consumerRoot,
      },
    );
    run(
      process.execPath,
      [
        path.join(root, 'node_modules', '@typescript', 'native', 'bin', 'tsc'),
        '-p',
        'tsconfig.compat.json',
      ],
      {
        cwd: consumerRoot,
      },
    );
    assertStrictPackageDeclarations('tsconfig.json');
    assertStrictPackageDeclarations('tsconfig.cjs.json');
    assertStrictPackageDeclarations('tsconfig.compat.json');
    run(process.execPath, ['runtime-smoke.mjs'], { cwd: consumerRoot });
    run(process.execPath, ['runtime-smoke.cjs'], { cwd: consumerRoot });
    run(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], {
      cwd: consumerRoot,
    });

    console.log('Package consumer verification passed.');
  } finally {
    cleanupTmpRoot();
  }
}

main();
