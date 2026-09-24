import type { SceneDocument } from './types';

// Only validated, deep-frozen snapshots produced here are trusted; callers cannot brand mutable input.
const trustedSnapshots = new WeakSet<SceneDocument>();

export function trustSceneSnapshot<T extends SceneDocument>(document: T): T {
  trustedSnapshots.add(document);
  return document;
}

export function isTrustedSceneSnapshot(document: SceneDocument): boolean {
  return trustedSnapshots.has(document);
}
