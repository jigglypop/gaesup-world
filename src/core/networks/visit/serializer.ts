import type { DomainBinding, SerializedDomainValue } from '../../save/types';
import {
  DEFAULT_VISIT_DOMAINS,
  type VisitBindingProvider,
  type VisitSnapshot,
} from './types';

export type SerializeVisitOptions = {
  hostId: string;
  hostName?: string;
  /** Domain keys to include. Defaults to `DEFAULT_VISIT_DOMAINS`. */
  domains?: readonly string[];
  /** Snapshot schema version. Defaults to `1`. */
  version?: number;
};

export type ApplyVisitOptions = {
  /** Restrict which domains in the snapshot are applied locally. */
  allowedDomains?: readonly string[];
  /**
   * Called for each domain right before its hydrate is invoked. Return
   * `false` to skip applying that domain.
   */
  filter?: (key: string, value: SerializedDomainValue) => boolean;
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
    try {
      domains[key] = binding.serialize();
    } catch {
      domains[key] = null;
    }
  }

  return {
    version: options.version ?? 1,
    hostId: options.hostId,
    ...(options.hostName ? { hostName: options.hostName } : {}),
    capturedAt: Date.now(),
    domains,
  };
}

export function applyVisitSnapshot(
  provider: VisitBindingProvider,
  snapshot: VisitSnapshot,
  options: ApplyVisitOptions = {},
): { applied: string[]; skipped: string[] } {
  const bindings = collectBindings(provider);
  const allowed = options.allowedDomains
    ? new Set(options.allowedDomains)
    : null;

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(snapshot.domains ?? {})) {
    if (allowed && !allowed.has(key)) {
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
