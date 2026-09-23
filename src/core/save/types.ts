export type SerializedDomainValue = object | string | number | boolean | null | undefined;

export type SaveBlob = {
  version: number;
  savedAt: number;
  domains: Record<string, SerializedDomainValue>;
};

export type SaveAdapter = {
  read(slot: string): Promise<SaveBlob | null>;
  write(slot: string, blob: SaveBlob): Promise<void>;
  list(): Promise<string[]>;
  remove(slot: string): Promise<void>;
};

export type DomainBinding<T = SerializedDomainValue> = {
  key: string;
  serialize: () => T;
  /** Must restore serialize() output, including after a failed apply. Own only this domain's state. */
  hydrate: (data: T | null | undefined) => void;
  /** Validate and prepare without mutation; return the deferred application. */
  prepareHydrate?: (data: T | null | undefined) => () => void;
};

export type Migration = (blob: SaveBlob) => SaveBlob;

export type SaveDiagnosticPhase = 'serialize' | 'hydrate';

export type SaveDiagnostic = {
  phase: SaveDiagnosticPhase;
  /** Set when restoring an earlier snapshot itself failed. */
  operation?: 'rollback';
  key: string;
  slot: string;
  error: unknown;
};

export type SaveDiagnosticListener = (diagnostic: SaveDiagnostic) => void;

/** Enter only after all domains validate, before any apply. Release after apply/rollback.
 * Both phases are synchronous. A failed guard prevents application; releases always run.
 * Transient effects cancelled on entry are not replayed by rollback.
 * A release failure is reported/thrown without undoing the settled domain result.
 */
export type SaveRestoreGuard = () => (() => void) | void;

export type SaveSystemOptions = {
  adapter: SaveAdapter;
  defaultSlot?: string;
  currentVersion?: number;
  migrations?: Record<number, Migration>;
  onDiagnostic?: SaveDiagnosticListener;
};
