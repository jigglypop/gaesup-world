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
  hydrate: (data: T | null | undefined) => void;
};

export type Migration = (blob: SaveBlob) => SaveBlob;

export type SaveDiagnosticPhase = 'serialize' | 'hydrate';

export type SaveDiagnostic = {
  phase: SaveDiagnosticPhase;
  key: string;
  slot: string;
  error: unknown;
};

export type SaveDiagnosticListener = (diagnostic: SaveDiagnostic) => void;

export type SaveSystemOptions = {
  adapter: SaveAdapter;
  defaultSlot?: string;
  currentVersion?: number;
  migrations?: Record<number, Migration>;
  onDiagnostic?: SaveDiagnosticListener;
};
