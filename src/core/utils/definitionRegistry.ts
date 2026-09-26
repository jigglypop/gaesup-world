import { isId, isRecord } from './guards';
import { logger } from './logger';

/** Deep frozen copy of plain definition data, so a registered definition never changes under its readers. */
function freezeCopy<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeCopy)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeCopy(entry)]))) as T;
  }
  return value;
}

const hasId = (value: unknown): boolean => isRecord<{ id: unknown }>(value) && isId(value.id);

/**
 * Game data definitions by id. The first definition of an id stays: registering the same data again is a no-op and
 * different data under a taken id is ignored with a warning. Readers get deep frozen copies.
 */
export class DefinitionRegistry<Id extends string, Def extends { id: Id }> {
  protected readonly defs = new Map<Id, Def>();

  /** `kind` names the id in messages, e.g. `ItemId`; `isValid` rejects definitions readers cannot use. */
  constructor(private readonly kind: string, private readonly isValid: (value: unknown) => boolean = hasId) {}

  register(def: Def): void {
    if (!hasId(def) || !this.isValid(def)) {
      logger.warn(`Ignored invalid ${this.kind} definition: ${String((def as { id?: unknown } | null)?.id)}`);
      return;
    }
    const existing = this.defs.get(def.id);
    if (!existing) {
      this.defs.set(def.id, freezeCopy(def));
    } else if (JSON.stringify(existing) !== JSON.stringify(def)) {
      logger.warn(`Ignored a second ${this.kind} definition for ${def.id}; the first one stays`);
    }
  }

  registerAll(defs: readonly Def[]): void {
    for (const def of defs) this.register(def);
  }

  get(id: Id): Def | undefined { return this.defs.get(id); }

  require(id: Id): Def {
    const def = this.defs.get(id);
    if (!def) throw new Error(`Unknown ${this.kind}: ${id}`);
    return def;
  }

  all(): Def[] { return Array.from(this.defs.values()); }
  has(id: Id): boolean { return this.defs.has(id); }
  clear(): void { this.defs.clear(); }
}
