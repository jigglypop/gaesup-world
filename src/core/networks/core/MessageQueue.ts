import { NetworkMessage } from '../types';
import { MessageProcessResult } from './types';

export class MessageQueue {
  private queues: Map<string, NetworkMessage[]> = new Map();
  private maxSize: number;
  private batchSize: number;
  private enableBatching: boolean;

  constructor(maxSize: number = 1000, batchSize: number = 10, enableBatching: boolean = true) {
    this.maxSize = maxSize;
    this.batchSize = batchSize;
    this.enableBatching = enableBatching;
  }

  // 메시지를 우선순위별 큐에 추가
  enqueue(message: NetworkMessage): boolean {
    const priorityKey = message.priority;
    
    if (!this.queues.has(priorityKey)) {
      this.queues.set(priorityKey, []);
    }

    const queue = this.queues.get(priorityKey)!;
    
    if (queue.length >= this.maxSize) {
      return false; // 큐가 가득 참
    }

    queue.push(message);
    return true;
  }

  // 우선순위에 따라 메시지 처리
  dequeue(): NetworkMessage | null {
    const priorities: Array<NetworkMessage['priority']> = ['critical', 'high', 'normal', 'low'];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift()!;
      }
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
    const priorities: Array<NetworkMessage['priority']> = ['critical', 'high', 'normal', 'low'];
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const count = Math.min(this.batchSize - batch.length, queue.length);
        batch.push(...queue.splice(0, count));
        
        if (batch.length >= this.batchSize) {
          break;
        }
      }
    }
    
    return batch;
  }

  // 특정 우선순위 큐 크기
  getQueueSize(priority: NetworkMessage['priority']): number {
    const queue = this.queues.get(priority);
    return queue ? queue.length : 0;
  }

  // 전체 큐 크기
  getTotalSize(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  // 큐 비우기
  clear(): void {
    this.queues.clear();
  }

  // 특정 메시지 찾기
  findMessage(messageId: string): NetworkMessage | null {
    for (const queue of this.queues.values()) {
      const message = queue.find(msg => msg.id === messageId);
      if (message) {
        return message;
      }
    }
    return null;
  }

  // 특정 메시지 제거
  removeMessage(messageId: string): boolean {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        queue.splice(index, 1);
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
      queueSizes[priority] = queue.length;
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