import { NetworkMessage } from '../../types';
import { MessageProcessResult } from '../types';

// MessageQueue 클래스 모의 구현
class MessageQueue {
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
}

describe('MessageQueue', () => {
  let messageQueue: MessageQueue;
  
  beforeEach(() => {
    messageQueue = new MessageQueue(1000, 10, true);
  });

  describe('기본 큐 동작', () => {
    test('메시지 추가 및 제거', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: { text: 'Hello' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      // 메시지 추가
      const added = messageQueue.enqueue(message);
      expect(added).toBe(true);
      expect(messageQueue.getTotalSize()).toBe(1);
      expect(messageQueue.getQueueSize('normal')).toBe(1);

      // 메시지 제거
      const dequeued = messageQueue.dequeue();
      expect(dequeued).toEqual(message);
      expect(messageQueue.getTotalSize()).toBe(0);
    });

    test('빈 큐에서 메시지 제거', () => {
      const dequeued = messageQueue.dequeue();
      expect(dequeued).toBeNull();
      expect(messageQueue.getTotalSize()).toBe(0);
    });

    test('큐 크기 제한', () => {
      const smallQueue = new MessageQueue(2, 10, true);
      
      const message1: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      const message2: NetworkMessage = {
        id: 'msg2',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      const message3: NetworkMessage = {
        id: 'msg3',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      expect(smallQueue.enqueue(message1)).toBe(true);
      expect(smallQueue.enqueue(message2)).toBe(true);
      expect(smallQueue.enqueue(message3)).toBe(false); // 큐가 가득 참
      
      expect(smallQueue.getTotalSize()).toBe(2);
    });
  });

  describe('우선순위 기반 처리', () => {
    test('우선순위별 메시지 처리 순서', () => {
      const messages: NetworkMessage[] = [
        {
          id: 'low1',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'low',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'critical1',
          from: 'node1',
          to: 'node2',
          type: 'system',
          payload: {},
          priority: 'critical',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'normal1',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'high1',
          from: 'node1',
          to: 'node2',
          type: 'action',
          payload: {},
          priority: 'high',
          timestamp: Date.now(),
          reliability: 'reliable'
        }
      ];

      // 순서대로 추가 (low, critical, normal, high)
      messages.forEach(msg => {
        messageQueue.enqueue(msg);
      });

      // 우선순위 순서로 처리되는지 확인 (critical, high, normal, low)
      expect(messageQueue.dequeue()?.id).toBe('critical1');
      expect(messageQueue.dequeue()?.id).toBe('high1');
      expect(messageQueue.dequeue()?.id).toBe('normal1');
      expect(messageQueue.dequeue()?.id).toBe('low1');
    });

    test('동일 우선순위 내에서 FIFO 순서', () => {
      const normalMessages: NetworkMessage[] = [
        {
          id: 'normal1',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'normal2',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now() + 1,
          reliability: 'reliable'
        },
        {
          id: 'normal3',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now() + 2,
          reliability: 'reliable'
        }
      ];

      normalMessages.forEach(msg => {
        messageQueue.enqueue(msg);
      });

      expect(messageQueue.dequeue()?.id).toBe('normal1');
      expect(messageQueue.dequeue()?.id).toBe('normal2');
      expect(messageQueue.dequeue()?.id).toBe('normal3');
    });
  });

  describe('배치 처리', () => {
    test('배치 크기만큼 메시지 가져오기', () => {
      const batchQueue = new MessageQueue(1000, 3, true);
      
      // 5개 메시지 추가
      for (let i = 1; i <= 5; i++) {
        const message: NetworkMessage = {
          id: `msg${i}`,
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        };
        batchQueue.enqueue(message);
      }

      // 첫 번째 배치 (3개)
      const batch1 = batchQueue.dequeueBatch();
      expect(batch1).toHaveLength(3);
      expect(batch1.map(msg => msg.id)).toEqual(['msg1', 'msg2', 'msg3']);

      // 두 번째 배치 (2개)
      const batch2 = batchQueue.dequeueBatch();
      expect(batch2).toHaveLength(2);
      expect(batch2.map(msg => msg.id)).toEqual(['msg4', 'msg5']);

      // 세 번째 배치 (빈 배열)
      const batch3 = batchQueue.dequeueBatch();
      expect(batch3).toHaveLength(0);
    });

    test('배치 비활성화 시 단일 메시지 처리', () => {
      const nonBatchQueue = new MessageQueue(1000, 10, false);
      
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      nonBatchQueue.enqueue(message);
      
      const batch = nonBatchQueue.dequeueBatch();
      expect(batch).toHaveLength(1);
      expect(batch[0].id).toBe('msg1');
    });

    test('우선순위별 배치 처리', () => {
      const batchQueue = new MessageQueue(1000, 5, true);
      
      // 다양한 우선순위 메시지 추가
      const messages = [
        { id: 'critical1', priority: 'critical' as const },
        { id: 'high1', priority: 'high' as const },
        { id: 'high2', priority: 'high' as const },
        { id: 'normal1', priority: 'normal' as const },
        { id: 'normal2', priority: 'normal' as const },
        { id: 'low1', priority: 'low' as const }
      ];

      messages.forEach(({ id, priority }) => {
        const message: NetworkMessage = {
          id,
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority,
          timestamp: Date.now(),
          reliability: 'reliable'
        };
        batchQueue.enqueue(message);
      });

      // 배치 처리 - 우선순위 순서로 가져와야 함
      const batch = batchQueue.dequeueBatch();
      expect(batch).toHaveLength(5);
      expect(batch.map(msg => msg.id)).toEqual(['critical1', 'high1', 'high2', 'normal1', 'normal2']);
    });
  });

  describe('메시지 검색 및 관리', () => {
    test('메시지 찾기', () => {
      const message: NetworkMessage = {
        id: 'findme',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: { text: 'Find this message' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      messageQueue.enqueue(message);
      
      const found = messageQueue.findMessage('findme');
      expect(found).toEqual(message);
      
      const notFound = messageQueue.findMessage('nonexistent');
      expect(notFound).toBeNull();
    });

    test('메시지 제거', () => {
      const messages: NetworkMessage[] = [
        {
          id: 'keep1',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'remove1',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'high',
          timestamp: Date.now(),
          reliability: 'reliable'
        },
        {
          id: 'keep2',
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        }
      ];

      messages.forEach(msg => messageQueue.enqueue(msg));
      expect(messageQueue.getTotalSize()).toBe(3);

      // 특정 메시지 제거
      const removed = messageQueue.removeMessage('remove1');
      expect(removed).toBe(true);
      expect(messageQueue.getTotalSize()).toBe(2);
      expect(messageQueue.findMessage('remove1')).toBeNull();
      expect(messageQueue.findMessage('keep1')).not.toBeNull();
      expect(messageQueue.findMessage('keep2')).not.toBeNull();

      // 존재하지 않는 메시지 제거 시도
      const notRemoved = messageQueue.removeMessage('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('큐 비우기', () => {
      // 여러 메시지 추가
      for (let i = 1; i <= 10; i++) {
        const message: NetworkMessage = {
          id: `msg${i}`,
          from: 'node1',
          to: 'node2',
          type: 'chat',
          payload: {},
          priority: i % 2 === 0 ? 'high' : 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        };
        messageQueue.enqueue(message);
      }

      expect(messageQueue.getTotalSize()).toBe(10);
      
      messageQueue.clear();
      
      expect(messageQueue.getTotalSize()).toBe(0);
      expect(messageQueue.getQueueSize('high')).toBe(0);
      expect(messageQueue.getQueueSize('normal')).toBe(0);
      expect(messageQueue.dequeue()).toBeNull();
    });
  });

  describe('큐 상태 모니터링', () => {
    test('우선순위별 큐 크기 확인', () => {
      // 다양한 우선순위 메시지 추가
      const priorities: Array<NetworkMessage['priority']> = ['critical', 'high', 'normal', 'low'];
      
      priorities.forEach((priority, index) => {
        for (let i = 0; i < index + 1; i++) {
          const message: NetworkMessage = {
            id: `${priority}_${i}`,
            from: 'node1',
            to: 'node2',
            type: 'chat',
            payload: {},
            priority,
            timestamp: Date.now(),
            reliability: 'reliable'
          };
          messageQueue.enqueue(message);
        }
      });

      expect(messageQueue.getQueueSize('critical')).toBe(1);
      expect(messageQueue.getQueueSize('high')).toBe(2);
      expect(messageQueue.getQueueSize('normal')).toBe(3);
      expect(messageQueue.getQueueSize('low')).toBe(4);
      expect(messageQueue.getTotalSize()).toBe(10);
    });

    test('존재하지 않는 우선순위 큐 크기', () => {
      expect(messageQueue.getQueueSize('normal')).toBe(0);
      
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: {},
        priority: 'high',
        timestamp: Date.now(),
        reliability: 'reliable'
      };
      
      messageQueue.enqueue(message);
      
      expect(messageQueue.getQueueSize('high')).toBe(1);
      expect(messageQueue.getQueueSize('normal')).toBe(0); // 여전히 0
    });
  });
}); 