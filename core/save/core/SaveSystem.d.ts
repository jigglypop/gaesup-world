import type { DomainBinding, SaveBlob, SaveDiagnosticListener, SaveSystemOptions } from '../types';
export declare class SaveSystem {
    private adapter;
    private bindings;
    private currentVersion;
    private migrations;
    private defaultSlot;
    private diagnosticListeners;
    constructor(opts: SaveSystemOptions);
    register(binding: DomainBinding): () => void;
    has(key: string): boolean;
    subscribeDiagnostics(listener: SaveDiagnosticListener): () => void;
    /**
     * Returns an iterator over registered domain bindings. Used by helpers
     * such as the visit-room snapshot serializer that need to read the
     * same set of (de)serializers as the autosave layer.
     */
    getBindings(): IterableIterator<DomainBinding>;
    createBlob(slot?: string): SaveBlob;
    hydrateBlob(raw: SaveBlob, slot?: string): boolean;
    save(slot?: string): Promise<void>;
    load(slot?: string): Promise<boolean>;
    list(): Promise<string[]>;
    remove(slot?: string): Promise<void>;
    private reportDiagnostic;
}
export declare class DuplicateSaveDomainBindingError extends Error {
    constructor(key: string);
}
export declare function createDefaultSaveSystem(): SaveSystem;
export declare function getSaveSystem(): SaveSystem;
