import { MessageQueue } from '../core/MessageQueue';
import type { NetworkMessage } from '../types';

function msg(id: string, priority: NetworkMessage['priority'] = 'normal'): NetworkMessage {
  return {
    id,
    from: 'a',
    to: 'b',
    type: 'chat',
    payload: {},
    priority,
    timestamp: Date.now(),
    reliability: 'reliable',
  };
}

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue(5, 3, true);
  });

  afterEach(() => {
    queue.clear();
  });

  // ---- enqueue / dequeue 기본 ----

  describe('enqueue / dequeue', () => {
    test('FIFO 순서로 dequeue', () => {
      queue.enqueue(msg('m1'));
      queue.enqueue(msg('m2'));
      expect(queue.dequeue()!.id).toBe('m1');
      expect(queue.dequeue()!.id).toBe('m2');
    });

    test('높은 우선순위가 먼저 dequeue', () => {
      queue.enqueue(msg('low', 'low'));
      queue.enqueue(msg('crit', 'critical'));
      queue.enqueue(msg('norm', 'normal'));

      expect(queue.dequeue()!.id).toBe('crit');
      expect(queue.dequeue()!.id).toBe('norm');
      expect(queue.dequeue()!.id).toBe('low');
    });

    test('빈 큐에서 dequeue하면 null', () => {
      expect(queue.dequeue()).toBeNull();
    });
  });

  // ---- eviction ----

  describe('eviction (maxSize 초과)', () => {
    test('같은 우선순위 큐가 가득 차면 가장 오래된 항목이 제거된다', () => {
      // maxSize = 5
      for (let i = 0; i < 5; i++) {
        expect(queue.enqueue(msg(`m${i}`))).toBe(true);
      }
      // 6번째: 같은 normal 큐에서 가장 오래된(m0)이 evict
      expect(queue.enqueue(msg('m5'))).toBe(true);
      expect(queue.getTotalSize()).toBe(5);

      // m0은 사라지고 m1이 첫 번째
      expect(queue.dequeue()!.id).toBe('m1');
    });

    test('높은 우선순위 큐가 가득 찼을 때, 낮은 우선순위에서 evict', () => {
      // low 큐에 3개 넣기
      for (let i = 0; i < 3; i++) {
        queue.enqueue(msg(`low${i}`, 'low'));
      }
      // high 큐를 maxSize(5)까지 채우기
      for (let i = 0; i < 5; i++) {
        queue.enqueue(msg(`high${i}`, 'high'));
      }

      // high 큐가 가득 찬 상태에서 high 메시지 추가 -> low에서 evict
      expect(queue.enqueue(msg('high5', 'high'))).toBe(true);
      // low 큐에서 가장 오래된 low0이 제거됨
      expect(queue.findMessage('low0')).toBeNull();
      expect(queue.findMessage('high5')).not.toBeNull();
    });

    test('evict 불가능하면 false', () => {
      // critical 5개로 가득 채움
      for (let i = 0; i < 5; i++) {
        queue.enqueue(msg(`c${i}`, 'critical'));
      }
      // critical보다 낮은 큐가 비어있고, 같은 큐에서 evict 시도
      // 같은 큐에서 evict되므로 true
      expect(queue.enqueue(msg('c5', 'critical'))).toBe(true);
      expect(queue.findMessage('c0')).toBeNull(); // c0이 evict됨
    });
  });

  // ---- dequeueBatch ----

  describe('dequeueBatch', () => {
    test('batchSize만큼 가져온다', () => {
      for (let i = 0; i < 5; i++) {
        queue.enqueue(msg(`m${i}`));
      }

      const batch = queue.dequeueBatch();
      expect(batch.length).toBe(3); // batchSize = 3
      expect(queue.getTotalSize()).toBe(2);
    });

    test('batching 비활성화 시 1개만 반환', () => {
      queue.updateBatchSettings(3, false);
      queue.enqueue(msg('m1'));
      queue.enqueue(msg('m2'));

      const batch = queue.dequeueBatch();
      expect(batch.length).toBe(1);
    });
  });

  // ---- findMessage / removeMessage ----

  describe('findMessage / removeMessage', () => {
    test('ID로 메시지 검색', () => {
      queue.enqueue(msg('target', 'high'));
      queue.enqueue(msg('other'));

      expect(queue.findMessage('target')!.id).toBe('target');
      expect(queue.findMessage('nonexistent')).toBeNull();
    });

    test('ID로 메시지 제거', () => {
      queue.enqueue(msg('rm'));
      expect(queue.removeMessage('rm')).toBe(true);
      expect(queue.getTotalSize()).toBe(0);
      expect(queue.removeMessage('rm')).toBe(false);
    });
  });

  // ---- getStats ----

  describe('getStats', () => {
    test('통계 반환', () => {
      queue.enqueue(msg('a', 'high'));
      queue.enqueue(msg('b', 'low'));

      const stats = queue.getStats();
      expect(stats.totalMessages).toBe(2);
      expect(stats.queueSizes['high']).toBe(1);
      expect(stats.queueSizes['low']).toBe(1);
      expect(stats.maxSize).toBe(5);
    });
  });
});
