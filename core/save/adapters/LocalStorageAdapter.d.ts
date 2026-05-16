import type { SaveAdapter, SaveBlob } from '../types';
export declare class LocalStorageAdapter implements SaveAdapter {
    read(slot: string): Promise<SaveBlob | null>;
    write(slot: string, blob: SaveBlob): Promise<void>;
    list(): Promise<string[]>;
    remove(slot: string): Promise<void>;
}
