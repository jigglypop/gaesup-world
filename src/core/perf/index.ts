export * from './types';
export {
  detectCapabilities,
  classifyTier,
  profileForTier,
  autoDetectProfile,
} from './detect';
export { usePerfStore } from './stores/perfStore';
export { readRendererStats } from './rendererStats';
export type { RendererInfoSource, RendererStats, RendererCounterScope } from './rendererStats';
