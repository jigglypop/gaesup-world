import { NetworkMessage } from '../types';
export declare class MessageQueue {
    private queues;
    private maxSize;
    private batchSize;
    private enableBatching;
    private totalSize;
    private static readonly prioritiesLowToHigh;
    private static readonly prioritiesHighToLow;
    constructor(maxSize?: number, batchSize?: number, enableBatching?: boolean);
    private getOrCreateQueue;
    private getQueueSizeInternal;
    private compactQueueIfNeeded;
    private shiftOne;
    enqueue(message: NetworkMessage): boolean;
    private evictOne;
    dequeue(): NetworkMessage | null;
    dequeueBatch(): NetworkMessage[];
    getQueueSize(priority: NetworkMessage['priority']): number;
    getTotalSize(): number;
    clear(): void;
    findMessage(messageId: string): NetworkMessage | null;
    removeMessage(messageId: string): boolean;
    updateBatchSettings(batchSize: number, enableBatching: boolean): void;
    updateMaxSize(maxSize: number): void;
    getStats(): {
        totalMessages: number;
        queueSizes: Record<string, number>;
        maxSize: number;
        batchSize: number;
        enableBatching: boolean;
    };
}
