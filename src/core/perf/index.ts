export * from './types';
export {
  detectCapabilities,
  classifyTier,
  profileForTier,
  autoDetectProfile,
} from './detect';
export { usePerfStore } from './stores/perfStore';
export {
  MAX_QUALITY_PIXEL_RATIO,
  QualityProfileProvider,
  resolveQualityDpr,
  useQualityProfile,
  type WorldQuality,
} from './quality';
export { readRendererStats } from './rendererStats';
export type { RendererInfoSource, RendererStats, RendererCounterScope } from './rendererStats';
