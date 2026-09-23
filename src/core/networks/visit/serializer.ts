import {
  DEFAULT_VISIT_DOMAINS,
  type VisitBindingProvider,
  type VisitSnapshot,
} from './types';
import type { DomainBinding, SerializedDomainValue } from '../../save/types';

const VISIT_SNAPSHOT_VERSION = 1;

export type SerializeVisitOptions = {
  hostId: string;
  hostName?: string;
  /** World snapshot id. Defaults to `hostId` for backward-compatible visit rooms. */
  worldId?: string;
  /** Domain keys to include. Defaults to `DEFAULT_VISIT_DOMAINS`. */
  domains?: readonly string[];
  /** Snapshot schema version. Defaults to `1`. */
  version?: number;
  /** Capture time. Defaults to `Date.now()`. */
  savedAt?: number;
};

export type ApplyVisitOptions = {
  /** Domains to apply locally. Defaults to `DEFAULT_VISIT_DOMAINS`. */
  allowedDomains?: readonly string[];
  /**
   * Called for each domain right before its hydrate is invoked. Return
   * `false` to skip applying that domain.
   */
  filter?: (key: string, value: SerializedDomainValue) => boolean;
  /** Validate every domain before mutating any of them. Defaults to `false`. */
  atomic?: boolean;
};

export type VisitRestorePoint = {
  domains: Record<string, SerializedDomainValue>;
  restore: () => { applied: string[]; skipped: string[] };
};

function collectBindings(provider: VisitBindingProvider): Map<string, DomainBinding> {
  const map = new Map<string, DomainBinding>();
  for (const binding of provider()) {
    if (!binding || typeof binding.key !== 'string') continue;
    map.set(binding.key, binding);
  }
  return map;
}

export function serializeVisit(
  provider: VisitBindingProvider,
  options: SerializeVisitOptions,
): VisitSnapshot {
  const bindings = collectBindings(provider);
  const targets = options.domains ?? DEFAULT_VISIT_DOMAINS;
  const domains: Record<string, SerializedDomainValue> = {};

  for (const key of targets) {
    const binding = bindings.get(key);
    if (!binding) continue;
    domains[key] = binding.serialize();
  }

  const savedAt = options.savedAt ?? Date.now();
  return {
    kind: 'world',
    worldId: options.worldId ?? options.hostId,
    version: options.version ?? VISIT_SNAPSHOT_VERSION,
    hostId: options.hostId,
    ...(options.hostName ? { hostName: options.hostName } : {}),
    savedAt,
    capturedAt: savedAt,
    domains,
  };
}

/** Unsupported snapshot versions are skipped before accessing local bindings. */
export function applyVisitSnapshot(
  provider: VisitBindingProvider,
  snapshot: VisitSnapshot,
  options: ApplyVisitOptions = {},
): { applied: string[]; skipped: string[] } {
  if (snapshot.version !== VISIT_SNAPSHOT_VERSION) {
    return { applied: [], skipped: Object.keys(snapshot.domains ?? {}) };
  }
  const bindings = collectBindings(provider);
  const allowed = new Set(options.allowedDomains ?? DEFAULT_VISIT_DOMAINS);

  const applied: string[] = [];
  const skipped: string[] = [];

  if (options.atomic) {
    return applyDomainsAtomically(bindings, allowed, snapshot.domains ?? {}, options.filter);
  }

  for (const [key, value] of Object.entries(snapshot.domains ?? {})) {
    if (!allowed.has(key)) {
      skipped.push(key);
      continue;
    }
    if (options.filter && !options.filter(key, value)) {
      skipped.push(key);
      continue;
    }
    const binding = bindings.get(key);
    if (!binding) {
      skipped.push(key);
      continue;
    }
    try {
      binding.hydrate(value);
      applied.push(key);
    } catch {
      skipped.push(key);
    }
  }

  return { applied, skipped };
}

function applyDomainsAtomically(
  bindings: Map<string, DomainBinding>,
  allowed: ReadonlySet<string>,
  domains: Record<string, SerializedDomainValue>,
  filter: ApplyVisitOptions['filter'],
): { applied: string[]; skipped: string[] } {
  const skipped: string[] = [];
  const pending: Array<{ key: string; apply: () => void }> = [];
  for (const [key, value] of Object.entries(domains)) {
    const binding = bindings.get(key);
    if (!allowed.has(key) || (filter && !filter(key, value)) || !binding) {
      skipped.push(key);
      continue;
    }
    try {
      const apply = binding.prepareHydrate
        ? binding.prepareHydrate(value)
        : () => binding.hydrate(value);
      pending.push({ key, apply });
    } catch {
      return { applied: [], skipped: Object.keys(domains) };
    }
  }
  const applied: string[] = [];
  for (const entry of pending) {
    try {
      entry.apply();
      applied.push(entry.key);
    } catch {
      skipped.push(entry.key);
    }
  }
  return { applied, skipped };
}

/**
 * Captures the local state of the given domains so a visit can be undone.
 * Domains without a local binding are ignored.
 */
export function captureVisitRestorePoint(
  provider: VisitBindingProvider,
  domainKeys: readonly string[] = DEFAULT_VISIT_DOMAINS,
): VisitRestorePoint {
  const bindings = collectBindings(provider);
  const domains: Record<string, SerializedDomainValue> = {};
  for (const key of domainKeys) {
    const binding = bindings.get(key);
    if (binding) domains[key] = binding.serialize();
  }
  return {
    domains,
    restore: () =>
      applyDomainsAtomically(collectBindings(provider), new Set(Object.keys(domains)), domains, undefined),
  };
}

/**
 * Returns a `VisitBindingProvider` backed by a save system instance. Lets
 * visit-room piggyback on the same serializers used for autosave without
 * duplicating wiring.
 */
export function visitProviderFromSaveSystem(
  saveSystem: { getBindings: () => Iterable<DomainBinding> },
): VisitBindingProvider {
  return () => saveSystem.getBindings();
}
