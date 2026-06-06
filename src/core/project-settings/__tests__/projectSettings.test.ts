import {
  DEFAULT_PROJECT_SETTINGS,
  PROJECT_SETTINGS_VERSION,
  cloneProjectSettings,
  createProjectSettings,
  parseProjectSettings,
  serializeProjectSettings,
  validateProjectSettings,
} from '..';

describe('project settings', () => {
  test('creates merged project settings with stable defaults', () => {
    const settings = createProjectSettings({
      name: 'Studio',
      physics: { gravity: [0, -3, 0] },
      rendering: { backend: 'webgpu', postprocessing: { enabled: true, bloom: true } },
      input: { bindings: { interact: [{ device: 'keyboard', code: 'KeyF' }] } },
      build: { sourceMaps: true },
    });

    expect(settings.version).toBe(PROJECT_SETTINGS_VERSION);
    expect(settings.name).toBe('Studio');
    expect(settings.physics.gravity).toEqual([0, -3, 0]);
    expect(settings.rendering.backend).toBe('webgpu');
    expect(settings.rendering.postprocessing).toEqual({
      ...DEFAULT_PROJECT_SETTINGS.rendering.postprocessing,
      enabled: true,
      bloom: true,
    });
    expect(settings.input.bindings.interact).toEqual([{ device: 'keyboard', code: 'KeyF' }]);
    expect(settings.input.bindings.moveForward).toEqual(DEFAULT_PROJECT_SETTINGS.input.bindings.moveForward);
    expect(settings.build.sourceMaps).toBe(true);
  });

  test('serializes, parses, and clones project settings', () => {
    const settings = createProjectSettings({ name: 'Serializable' });
    const parsed = parseProjectSettings(serializeProjectSettings(settings));
    const cloned = cloneProjectSettings(settings);

    expect(parsed.valid).toBe(true);
    expect(parsed.settings).toEqual(settings);
    expect(cloned).toEqual(settings);
    expect(cloned).not.toBe(settings);
  });

  test('validates unsupported and unsafe settings', () => {
    const settings = createProjectSettings({
      physics: { timeStep: 0 },
      rendering: { pixelRatio: -1 },
      input: { bindings: { broken: [{ device: 'keyboard', code: '' }] } },
      build: { publicPath: '' },
      editor: { gridSize: 0 },
    });

    const result = validateProjectSettings(settings);

    expect(result.valid).toBe(false);
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      'invalid-physics-settings',
      'invalid-rendering-settings',
      'invalid-input-binding',
      'invalid-build-settings',
      'invalid-editor-settings',
    ]));
  });

  test('rejects unsupported project settings versions', () => {
    const parsed = parseProjectSettings({ version: 2, name: 'Future' });

    expect(parsed.valid).toBe(false);
    expect(parsed.issues[0]?.code).toBe('invalid-project-settings-version');
  });
});
