import { NetworkMessage } from '../types';

type QueueState = {
  items: NetworkMessage[];
  head: number;
};

export class MessageQueue {
  private queues: Map<NetworkMessage['priority'], QueueState> = new Map();
  private maxSize: number;
  private batchSize: number;
  private enableBatching: boolean;
  private totalSize: number = 0;

  private static readonly prioritiesLowToHigh: Array<NetworkMessage['priority']> = [
    'low',
    'normal',
    'high',
    'critical',
  ];
  private static readonly prioritiesHighToLow: Array<NetworkMessage['priority']> = [
    'critical',
    'high',
    'normal',
    'low',
  ];

  constructor(maxSize: number = 1000, batchSize: number = 10, enableBatching: boolean = true) {
    this.maxSize = Math.max(1, maxSize);
    this.batchSize = batchSize;
    this.enableBatching = enableBatching;
  }

  private getOrCreateQueue(priority: NetworkMessage['priority']): QueueState {
    const existing = this.queues.get(priority);
    if (existing) return existing;
    const created: QueueState = { items: [], head: 0 };
    this.queues.set(priority, created);
    return created;
  }

  private getQueueSizeInternal(queue: QueueState): number {
    return queue.items.length - queue.head;
  }

  private compactQueueIfNeeded(queue: QueueState): void {
    if (queue.head === 0) return;

    if (queue.head >= queue.items.length) {
      queue.items = [];
      queue.head = 0;
      return;
    }

    // Compact only when it meaningfully reduces retained memory/copy cost.
    if (queue.head > 64 && queue.head * 2 >= queue.items.length) {
      queue.items = queue.items.slice(queue.head);
      queue.head = 0;
    }
  }

  private shiftOne(queue: QueueState): NetworkMessage | null {
    if (this.getQueueSizeInternal(queue) <= 0) return null;
    const message = queue.items[queue.head] ?? null;
    queue.head += 1;
    this.totalSize = Math.max(0, this.totalSize - 1);
    this.compactQueueIfNeeded(queue);
    return message;
  }

  // 메시지를 우선순위별 큐에 추가
  enqueue(message: NetworkMessage): boolean {
    const priorityKey = message.priority;

    // Global maxSize across all priority queues.
    while (this.totalSize >= this.maxSize) {
      if (!this.evictOne(priorityKey)) return false;
    }

    const queue = this.getOrCreateQueue(priorityKey);
    queue.items.push(message);
    this.totalSize += 1;
    return true;
  }

  // 현재 우선순위보다 낮은 큐에서 가장 오래된 항목 1개 제거
  private evictOne(incomingPriority: NetworkMessage['priority']): boolean {
    const priorities = MessageQueue.prioritiesLowToHigh;
    const incomingIdx = priorities.indexOf(incomingPriority);

    // 낮은 우선순위부터 탐색
    for (let i = 0; i < incomingIdx; i++) {
      const key = priorities[i];
      if (!key) continue;
      const q = this.queues.get(key);
      if (!q) continue;
      if (this.shiftOne(q)) return true;
    }
    // 같은 우선순위 큐에서 가장 오래된 항목 제거
    const same = this.queues.get(incomingPriority);
    if (same && this.shiftOne(same)) return true;
    return false;
  }

  // 우선순위에 따라 메시지 처리
  dequeue(): NetworkMessage | null {
    for (const priority of MessageQueue.prioritiesHighToLow) {
      const queue = this.queues.get(priority);
      if (!queue) continue;
      const message = this.shiftOne(queue);
      if (message) return message;
    }
    return null;
  }

  // 배치 처리용 여러 메시지 가져오기
  dequeueBatch(): NetworkMessage[] {
    if (!this.enableBatching) {
      const message = this.dequeue();
      return message ? [message] : [];
    }

    const batch: NetworkMessage[] = [];
    for (const priority of MessageQueue.prioritiesHighToLow) {
      if (batch.length >= this.batchSize) break;
      const queue = this.queues.get(priority);
      if (!queue) continue;
      const remaining = this.batchSize - batch.length;
      const available = this.getQueueSizeInternal(queue);
      const count = Math.min(remaining, available);
      for (let i = 0; i < count; i++) {
        const message = this.shiftOne(queue);
        if (!message) break;
        batch.push(message);
      }
    }

    return batch;
  }

  // 특정 우선순위 큐 크기
  getQueueSize(priority: NetworkMessage['priority']): number {
    const queue = this.queues.get(priority);
    return queue ? this.getQueueSizeInternal(queue) : 0;
  }

  // 전체 큐 크기
  getTotalSize(): number {
    return this.totalSize;
  }

  // 큐 비우기
  clear(): void {
    this.queues.clear();
    this.totalSize = 0;
  }

  // 특정 메시지 찾기
  findMessage(messageId: string): NetworkMessage | null {
    for (const queue of this.queues.values()) {
      for (let i = queue.head; i < queue.items.length; i++) {
        const message = queue.items[i];
        if (message && message.id === messageId) return message;
      }
    }
    return null;
  }

  // 특정 메시지 제거
  removeMessage(messageId: string): boolean {
    for (const queue of this.queues.values()) {
      for (let i = queue.head; i < queue.items.length; i++) {
        const message = queue.items[i];
        if (!message || message.id !== messageId) continue;

        if (i === queue.head) {
          this.shiftOne(queue);
          return true;
        }

        queue.items.splice(i, 1);
        this.totalSize = Math.max(0, this.totalSize - 1);
        this.compactQueueIfNeeded(queue);
        return true;
      }
    }
    return false;
  }

  // 배치 설정 업데이트
  updateBatchSettings(batchSize: number, enableBatching: boolean): void {
    this.batchSize = Math.max(1, batchSize);
    this.enableBatching = enableBatching;
  }

  // 큐 최대 크기 업데이트
  updateMaxSize(maxSize: number): void {
    this.maxSize = Math.max(1, maxSize);
    while (this.totalSize > this.maxSize) {
      // Incoming priority 'critical' will evict from lowest priority first.
      if (!this.evictOne('critical')) break;
    }
  }

  // 큐 통계 정보
  getStats(): {
    totalMessages: number;
    queueSizes: Record<string, number>;
    maxSize: number;
    batchSize: number;
    enableBatching: boolean;
  } {
    const queueSizes: Record<string, number> = {};
    for (const [priority, queue] of this.queues.entries()) {
      queueSizes[priority] = this.getQueueSizeInternal(queue);
    }

    return {
      totalMessages: this.getTotalSize(),
      queueSizes,
      maxSize: this.maxSize,
      batchSize: this.batchSize,
      enableBatching: this.enableBatching
    };
  }
} 