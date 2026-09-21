import { parseRun, type LabRun } from '../model';

/** Recorded native runs; raw samples and the original source manifest stay intact. */
export async function loadBaselines(): Promise<LabRun[]> {
  const bundles = await Promise.all([
    import('./2026-09-19-initial.json'), import('./2026-09-20-s1.json'), import('./2026-09-20-assets.json'),
    import('./2026-09-20-s2.json'), import('./2026-09-20-s2-worlds.json'), import('./2026-09-20-s2-domains.json'),
    import('./2026-09-20-s2-gameplay.json'), import('./2026-09-20-s2-life.json'), import('./2026-09-20-s2-presentation.json'),
    import('./2026-09-20-s2-input.json'), import('./2026-09-20-s2-grass.json'), import('./2026-09-20-s2-world-bridge.json'),
    import('./2026-09-20-s2-npc-adapters.json'), import('./2026-09-20-s2-custom-input.json'), import('./2026-09-20-s2-input-actions.json'),
    import('./2026-09-20-s2-cinematics.json'), import('./2026-09-20-s2-gamepad.json'), import('./2026-09-20-s2-restore-observers.json'),
    import('./2026-09-21-s2-save-hooks.json'), import('./2026-09-21-minihome.json'), import('./2026-09-21-s2-restore-effects.json'),
    import('./2026-09-21-s3-spatial.json'),
    import('./2026-09-21-s3-grounding.json'),
    import('./2026-09-21-s3-camera-smoothing.json'),
    import('./2026-09-21-s2-gameplay-commands.json'),
    import('./2026-09-21-s2-network-clock.json'),
    import('./2026-09-21-s2-physics-clock.json'),
  ]);
  return bundles.flatMap(({ default: bundle }) => {
    const sources: Record<string, unknown> = bundle.sources;
    return bundle.runs.map(({ sourceHash, ...run }) => parseRun({ ...run, source: sources[sourceHash] }));
  });
}
