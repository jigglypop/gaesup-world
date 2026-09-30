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
  /**
   * All or nothing: every domain and its rollback are prepared before any changes, and a failing hydrate returns
   * the domains already applied to their prior state. Defaults to `false`.
   */
  atomic?: boolean;
};

export type VisitApplyResult = {
  applied: string[];
  skipped: string[];
  /** Domains whose preparation or hydrate threw. An atomic apply then rolls back and leaves `applied` empty. */
  failed?: { key: string; error: unknown }[];
  /** Atomic only: domains the rollback could not return to their prior state, so local state is mixed. */
  unrestored?: string[];
};

export type VisitRestorePoint = {
  domains: Record<string, SerializedDomainValue>;
  /** Restores every domain it can; a failing one is reported without undoing the others. */
  restore: () => VisitApplyResult;
};

type SelectedDomain = { key: string; value: SerializedDomainValue; binding: DomainBinding };

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
): VisitApplyResult {
  const domains = snapshot.domains ?? {};
  if (snapshot.version !== VISIT_SNAPSHOT_VERSION) {
    return { applied: [], skipped: Object.keys(domains) };
  }
  const skipped: string[] = [];
  const selected = selectDomains(
    collectBindings(provider),
    new Set(options.allowedDomains ?? DEFAULT_VISIT_DOMAINS),
    domains,
    options.filter,
    skipped,
  );
  return options.atomic ? hydrateAtomically(selected, skipped, Object.keys(domains)) : hydrateEach(selected, skipped);
}

function selectDomains(
  bindings: Map<string, DomainBinding>,
  allowed: ReadonlySet<string>,
  domains: Record<string, SerializedDomainValue>,
  filter: ApplyVisitOptions['filter'],
  skipped: string[],
): SelectedDomain[] {
  const selected: SelectedDomain[] = [];
  for (const [key, value] of Object.entries(domains)) {
    const binding = bindings.get(key);
    if (!allowed.has(key) || (filter && !filter(key, value)) || !binding) skipped.push(key);
    else selected.push({ key, value, binding });
  }
  return selected;
}

const withFailures = (
  result: VisitApplyResult,
  failed: NonNullable<VisitApplyResult['failed']>,
  unrestored: string[] = [],
): VisitApplyResult => ({
  ...result,
  ...(failed.length ? { failed } : {}),
  ...(unrestored.length ? { unrestored } : {}),
});

/** Each domain on its own: one that throws is reported and the rest still apply. */
function hydrateEach(selected: SelectedDomain[], skipped: string[]): VisitApplyResult {
  const applied: string[] = [];
  const failed: NonNullable<VisitApplyResult['failed']> = [];
  for (const { key, value, binding } of selected) {
    try {
      binding.hydrate(value);
      applied.push(key);
    } catch (error) {
      skipped.push(key);
      failed.push({ key, error });
    }
  }
  return withFailures({ applied, skipped }, failed);
}

const prepare = (binding: DomainBinding, value: SerializedDomainValue): (() => void) =>
  binding.prepareHydrate ? binding.prepareHydrate(value) : () => binding.hydrate(value);

function hydrateAtomically(selected: SelectedDomain[], skipped: string[], allKeys: string[]): VisitApplyResult {
  const steps: { key: string; apply: () => void; restore: () => void }[] = [];
  for (const { key, value, binding } of selected) {
    try {
      // The rollback is prepared from the current state before anything changes, like the apply itself.
      steps.push({ key, apply: prepare(binding, value), restore: prepare(binding, binding.serialize()) });
    } catch (error) {
      return withFailures({ applied: [], skipped: allKeys }, [{ key, error }]);
    }
  }
  for (let index = 0; index < steps.length; index++) {
    try {
      steps[index]!.apply();
    } catch (error) {
      // The failing domain may be half applied, so it is restored too, then the applied ones in reverse order.
      const unrestored: string[] = [];
      for (let back = index; back >= 0; back--) {
        const step = steps[back]!;
        try {
          step.restore();
        } catch {
          unrestored.push(step.key);
        }
      }
      return withFailures({ applied: [], skipped: allKeys }, [{ key: steps[index]!.key, error }], unrestored);
    }
  }
  return { applied: steps.map((step) => step.key), skipped };
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
    // Going home is best effort: rolling every domain back to the visited world because one failed would strand the player there.
    restore: () => {
      const skipped: string[] = [];
      return hydrateEach(selectDomains(collectBindings(provider), new Set(Object.keys(domains)), domains, undefined, skipped), skipped);
    },
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
