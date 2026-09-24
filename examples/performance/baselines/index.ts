import { parseRun, type LabRun } from '../model';

type BaselineBundle = { sources: Record<string, unknown>; runs: Array<Record<string, unknown> & { sourceHash: string }> };
type BundleLoader = () => Promise<{ default: BaselineBundle }>;

/**
 * Recorded native runs (16.7MB in total), keyed by file with the scenarios they cover. The Lab fetches only the
 * bundles of a scenario it opens; __tests__/baselines.test.ts keeps these lists equal to the JSON contents.
 */
const bundles: Record<string, readonly [BundleLoader, readonly string[]]> = {
  '2026-09-19-initial': [() => import('./2026-09-19-initial.json'), ['audio-lifecycle', 'camera-obstacles', 'entity-lifecycle', 'gpu-material', 'metrics', 'save-transaction', 'spatial-query', 'state-hooks', 'test-contract']],
  '2026-09-20-assets': [() => import('./2026-09-20-assets.json'), ['asset-switch']],
  '2026-09-20-s1': [() => import('./2026-09-20-s1.json'), ['audio-lifecycle', 'entity-lifecycle', 'gpu-material', 'material-editor', 'save-lifecycle', 'save-transaction', 'state-hooks']],
  '2026-09-20-s2-cinematics': [() => import('./2026-09-20-s2-cinematics.json'), ['cinematic-editor-ownership', 'cinematic-lifetime', 'world-cinematic-lifecycle']],
  '2026-09-20-s2-custom-input': [() => import('./2026-09-20-s2-custom-input.json'), ['world-custom-input', 'world-input-source-lifecycle']],
  '2026-09-20-s2-domains': [() => import('./2026-09-20-s2-domains.json'), ['asset-switch', 'clock-lifecycle', 'state-hooks', 'world-configuration', 'world-domains', 'world-input-state', 'world-interactions', 'world-navigation', 'world-obstacle-registry', 'world-render-state', 'world-storage']],
  '2026-09-20-s2-gamepad': [() => import('./2026-09-20-s2-gamepad.json'), ['gamepad-motion-scene', 'hardware-gamepad-routing']],
  '2026-09-20-s2-gameplay': [() => import('./2026-09-20-s2-gameplay.json'), ['world-gameplay']],
  '2026-09-20-s2-grass': [() => import('./2026-09-20-s2-grass.json'), ['grass-rendering', 'world-grass']],
  '2026-09-20-s2-input-actions': [() => import('./2026-09-20-s2-input-actions.json'), ['interaction-target-ownership', 'interaction-world-tracking', 'tool-action-ownership']],
  '2026-09-20-s2-input': [() => import('./2026-09-20-s2-input.json'), ['editor-shortcuts', 'world-keyboard-focus']],
  '2026-09-20-s2-life': [() => import('./2026-09-20-s2-life.json'), ['catalog-tracking', 'world-life']],
  '2026-09-20-s2-npc-adapters': [() => import('./2026-09-20-s2-npc-adapters.json'), ['npc-adapter-isolation', 'npc-frame-ownership', 'npc-policy-lifetime']],
  '2026-09-20-s2-presentation': [() => import('./2026-09-20-s2-presentation.json'), ['world-audio', 'world-character-scene']],
  '2026-09-20-s2-restore-observers': [() => import('./2026-09-20-s2-restore-observers.json'), ['world-paused-time-restore', 'world-restore-observers', 'world-restore-races']],
  '2026-09-20-s2-world-bridge': [() => import('./2026-09-20-s2-world-bridge.json'), ['world-objects', 'world-snapshot', 'world-view-picking']],
  '2026-09-20-s2-worlds': [() => import('./2026-09-20-s2-worlds.json'), ['asset-switch', 'clock-lifecycle', 'state-hooks', 'tick-determinism', 'world-configuration', 'world-input-state', 'world-interactions', 'world-isolation', 'world-navigation', 'world-storage']],
  '2026-09-20-s2': [() => import('./2026-09-20-s2.json'), ['clock-lifecycle', 'state-hooks', 'tick-determinism', 'world-isolation', 'world-storage']],
  '2026-09-21-minihome': [() => import('./2026-09-21-minihome.json'), ['minihome-api', 'minihome-lifecycle', 'minihome-rendering']],
  '2026-09-21-s2-gameplay-commands': [() => import('./2026-09-21-s2-gameplay-commands.json'), ['gameplay-command-order', 'gameplay-dispatch', 'world-gameplay-restore']],
  '2026-09-21-s2-network-clock': [() => import('./2026-09-21-s2-network-clock.json'), ['clock-lifecycle', 'gameplay-command-order', 'tick-determinism', 'world-gameplay-restore', 'world-network-clock', 'world-network-consumers']],
  '2026-09-21-s2-physics-clock': [() => import('./2026-09-21-s2-physics-clock.json'), ['world-physics-clock']],
  '2026-09-21-s2-restore-effects': [() => import('./2026-09-21-s2-restore-effects.json'), ['world-restore-audio-decode', 'world-restore-effects']],
  '2026-09-21-s2-save-hooks': [() => import('./2026-09-21-s2-save-hooks.json'), ['save-hook-sharing', 'world-save-hooks']],
  '2026-09-21-s3-camera-smoothing': [() => import('./2026-09-21-s3-camera-smoothing.json'), ['camera-smoothing']],
  '2026-09-21-s3-grounding': [() => import('./2026-09-21-s3-grounding.json'), ['entity-grounding', 'locomotion']],
  '2026-09-21-s3-spatial': [() => import('./2026-09-21-s3-spatial.json'), ['camera-obstacles', 'camera-radius', 'spatial-query', 'spatial-scale']],
  '2026-09-22-s3-npc': [() => import('./2026-09-22-s3-npc.json'), ['npc-distance', 'npc-perception']],
};

export const baselineScenarios: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(bundles).map(([file, [, scenarioIds]]) => [file, scenarioIds]),
);

export const hasBaselines = (scenarioId: string): boolean =>
  Object.values(bundles).some(([, scenarioIds]) => scenarioIds.includes(scenarioId));

const loaded = new Map<string, Promise<LabRun[]>>();

/** Runs of every bundle that covers the scenario, each bundle fetched and parsed once; failures can be retried. */
export async function loadBaselines(scenarioId: string): Promise<LabRun[]> {
  const groups = await Promise.all(Object.entries(bundles)
    .filter(([, [, scenarioIds]]) => scenarioIds.includes(scenarioId))
    .map(([file, [load]]) => {
      let runs = loaded.get(file);
      if (!runs) {
        runs = load().then(({ default: bundle }) =>
          bundle.runs.map(({ sourceHash, ...run }) => parseRun({ ...run, source: bundle.sources[sourceHash] })));
        loaded.set(file, runs);
        runs.catch(() => loaded.delete(file));
      }
      return runs;
    }));
  return groups.flat();
}
