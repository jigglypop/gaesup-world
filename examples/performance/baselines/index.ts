import { parseRun, type LabRun } from '../model';

/** Recorded native runs; raw samples and the original source manifest stay intact. */
export async function loadBaselines(): Promise<LabRun[]> {
  const bundles = await Promise.all([import('./2026-09-19-initial.json'), import('./2026-09-20-s1.json'), import('./2026-09-20-assets.json'), import('./2026-09-20-s2.json'), import('./2026-09-20-s2-worlds.json'), import('./2026-09-20-s2-domains.json'), import('./2026-09-20-s2-gameplay.json'), import('./2026-09-20-s2-life.json'), import('./2026-09-20-s2-presentation.json'), import('./2026-09-20-s2-input.json'), import('./2026-09-20-s2-grass.json'), import('./2026-09-20-s2-world-bridge.json'), import('./2026-09-20-s2-npc-adapters.json'), import('./2026-09-20-s2-custom-input.json'), import('./2026-09-20-s2-input-actions.json'), import('./2026-09-20-s2-cinematics.json'), import('./2026-09-20-s2-gamepad.json'), import('./2026-09-20-s2-restore-observers.json')]);
  return bundles.flatMap(({ default: bundle }) => {
    const sources: Record<string, unknown> = bundle.sources;
    return bundle.runs.map(({ sourceHash, ...run }) => parseRun({ ...run, source: sources[sourceHash] }));
  });
}
