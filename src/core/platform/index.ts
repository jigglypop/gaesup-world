export {
  PLAYER_PROGRESS_DOMAINS,
  WORLD_SNAPSHOT_DOMAINS,
  collectSaveDomains,
  createPlayerProgress,
  createPlayerProgressFromSaveSystem,
  createWorldSnapshot,
  createWorldSnapshotFromSaveSystem,
  pickDomains,
} from './snapshot';
export type {
  CreatePlayerProgressOptions,
  CreateWorldSnapshotOptions,
  DomainSnapshot,
  PlayerProgress,
  PlayerProgressDomain,
  PlatformSaveBindingProvider,
  WorldSnapshot,
  WorldSnapshotDomain,
} from './snapshot';
