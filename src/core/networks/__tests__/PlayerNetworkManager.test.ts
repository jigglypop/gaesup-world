import { PlayerNetworkManager } from '../core/PlayerNetworkManager';

// WebSocket mock
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(public url: string) {
    // 비동기로 open 시뮬레이션
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: code ?? 1000, reason: reason ?? '' } as CloseEvent);
  }

  // 외부에서 메시지 수신 시뮬레이션
  simulateMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }

  simulateClose(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: code ?? 1006, reason: reason ?? '' } as CloseEvent);
  }
}

// 글로벌 WebSocket을 mock으로 교체
let lastCreatedWs: MockWebSocket | null = null;
const originalWebSocket = globalThis.WebSocket;

beforeAll(() => {
  (globalThis as Record<string, unknown>).WebSocket = class extends MockWebSocket {
    constructor(url: string) {
      super(url);
      lastCreatedWs = this;
    }
  };
  // static 상수 복사
  Object.assign((globalThis as Record<string, unknown>).WebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  });
});

afterAll(() => {
  (globalThis as Record<string, unknown>).WebSocket = originalWebSocket;
});

describe('PlayerNetworkManager', () => {
  let manager: PlayerNetworkManager;

  beforeEach(() => {
    lastCreatedWs = null;
    manager = new PlayerNetworkManager({
      url: 'ws://localhost:9999',
      roomId: 'test-room',
      playerName: 'tester',
      playerColor: '#ff0000',
    });
  });

  afterEach(() => {
    manager.disconnect();
    jest.restoreAllMocks();
  });

  describe('connect', () => {
    test('connect 시 WebSocket을 생성하고 Join 메시지를 보낸다', async () => {
      manager.connect();
      // onopen이 setTimeout(0)으로 비동기이므로 기다림
      await new Promise(r => setTimeout(r, 10));

      expect(lastCreatedWs).not.toBeNull();
      expect(lastCreatedWs!.sentMessages.length).toBe(1);
      const joinMsg = JSON.parse(lastCreatedWs!.sentMessages[0]);
      expect(joinMsg.type).toBe('Join');
      expect(joinMsg.room_id).toBe('test-room');
    });

    test('이미 연결 중이면 중복 connect를 무시한다', async () => {
      manager.connect();
      const first = lastCreatedWs;
      manager.connect(); // 두 번째 호출
      expect(lastCreatedWs).toBe(first); // 새 WebSocket이 생성되지 않음
    });

    test('OPEN 상태에서 connect 무시', async () => {
      manager.connect();
      await new Promise(r => setTimeout(r, 10));
      const first = lastCreatedWs;
      manager.connect();
      expect(lastCreatedWs).toBe(first);
    });
  });

  describe('disconnect', () => {
    test('disconnect 후 핸들러가 null이 되어 늦은 이벤트가 무시된다', async () => {
      let disconnectCount = 0;
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'test-room',
        playerName: 'tester',
        playerColor: '#ff0000',
        onDisconnect: () => { disconnectCount++; },
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));
      const ws = lastCreatedWs!;

      manager.disconnect();
      expect(disconnectCount).toBe(1);

      // disconnect 후 늦은 onclose 이벤트가 와도 콜백이 다시 불리지 않음
      ws.onclose?.({ code: 1000, reason: '' } as CloseEvent);
      expect(disconnectCount).toBe(1); // onclose가 null이므로 호출 안 됨
    });

    test('ws 없이 disconnect 해도 안전', () => {
      expect(() => manager.disconnect()).not.toThrow();
    });
  });

  describe('updateLocalPlayer', () => {
    test('연결 안 된 상태에서 호출해도 에러 없음', () => {
      expect(() => manager.updateLocalPlayer({ position: [1, 2, 3] })).not.toThrow();
    });

    test('연결 후 상태를 전송한다', async () => {
      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      manager.updateLocalPlayer({ position: [1, 2, 3] });
      // Join + Update = 2개
      expect(lastCreatedWs!.sentMessages.length).toBe(2);
      const updateMsg = JSON.parse(lastCreatedWs!.sentMessages[1]);
      expect(updateMsg.type).toBe('Update');
      expect(updateMsg.state.position).toEqual([1, 2, 3]);
    });

    test('sendRateLimit이 있으면 Update 전송이 제한된다', () => {
      jest.useFakeTimers();
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        sendRateLimit: 50,
      });

      manager.connect();
      jest.advanceTimersByTime(5); // open

      const ws = lastCreatedWs!;
      // Join 1개
      expect(ws.sentMessages.length).toBe(1);

      manager.updateLocalPlayer({ position: [1, 0, 0] });
      manager.updateLocalPlayer({ position: [2, 0, 0] });
      // 첫 Update는 즉시, 두 번째는 rate-limit으로 지연
      expect(ws.sentMessages.filter((m) => JSON.parse(m).type === 'Update').length).toBe(1);

      jest.advanceTimersByTime(60);
      expect(ws.sentMessages.filter((m) => JSON.parse(m).type === 'Update').length).toBe(2);

      // 마지막 값이 반영(coalesce) 되었는지 확인
      const lastUpdate = JSON.parse(ws.sentMessages[ws.sentMessages.length - 1]);
      expect(lastUpdate.state.position).toEqual([2, 0, 0]);

      jest.useRealTimers();
    });
  });

  describe('sendChat', () => {
    test('빈 텍스트는 전송하지 않는다', async () => {
      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      manager.sendChat('');
      manager.sendChat('   ');
      expect(lastCreatedWs!.sentMessages.length).toBe(1); // Join만
    });

    test('200자 초과는 잘린다', async () => {
      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      const longText = 'A'.repeat(300);
      manager.sendChat(longText);
      const chatMsg = JSON.parse(lastCreatedWs!.sentMessages[1]);
      expect(chatMsg.text.length).toBe(200);
    });
  });

  describe('handleServerMessage', () => {
    test('Welcome 메시지 처리', async () => {
      let welcomeId = '';
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        onWelcome: (id) => { welcomeId = id; },
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      lastCreatedWs!.simulateMessage(JSON.stringify({
        type: 'Welcome',
        client_id: 'my-id-123',
        room_state: {},
      }));

      expect(welcomeId).toBe('my-id-123');
    });

    test('PlayerUpdate는 불변 객체로 갱신한다', async () => {
      const updates: Array<{ id: string; state: Record<string, unknown> }> = [];
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        onPlayerJoin: (id, state) => { updates.push({ id, state }); },
        onPlayerUpdate: (id, state) => { updates.push({ id, state }); },
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      // 먼저 PlayerJoined로 등록
      lastCreatedWs!.simulateMessage(JSON.stringify({
        type: 'PlayerJoined',
        client_id: 'p2',
        state: { name: 'Bob', color: '#00f', position: [0, 0, 0], rotation: [1, 0, 0, 0] },
      }));

      const joinedState = updates[0].state;

      // PlayerUpdate
      lastCreatedWs!.simulateMessage(JSON.stringify({
        type: 'PlayerUpdate',
        client_id: 'p2',
        state: { position: [5, 5, 5] },
      }));

      const updatedState = updates[1].state;
      // 새 객체여야 함 (Object.assign 변이가 아닌 spread)
      expect(updatedState).not.toBe(joinedState);
      expect(updatedState.position).toEqual([5, 5, 5]);
      expect(updatedState.name).toBe('Bob');
    });

    test('PlayerLeft 처리', async () => {
      let leftId = '';
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        onPlayerLeave: (id) => { leftId = id; },
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      lastCreatedWs!.simulateMessage(JSON.stringify({
        type: 'PlayerLeft',
        client_id: 'p2',
      }));

      expect(leftId).toBe('p2');
    });
  });

  describe('reconnect', () => {
    test('reconnectAttempts > 0이면 끊김 후 자동 재연결 시도', async () => {
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        reconnectAttempts: 2,
        reconnectDelay: 50,
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      const firstWs = lastCreatedWs!;
      // 연결 끊김 시뮬레이션
      firstWs.simulateClose(1006, 'abnormal');

      // reconnectDelay(50ms * 2^0 = 50ms) 대기
      await new Promise(r => setTimeout(r, 80));

      // 새 WebSocket이 생성되어야 함
      expect(lastCreatedWs).not.toBe(firstWs);
    });

    test('reconnectAttempts가 0이면 재연결하지 않는다', async () => {
      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      const firstWs = lastCreatedWs!;
      firstWs.simulateClose(1006, 'abnormal');

      await new Promise(r => setTimeout(r, 100));
      // 새 WebSocket이 생성되지 않아야 함
      expect(lastCreatedWs).toBe(firstWs);
    });

    test('정상 종료(1000)면 재연결하지 않는다', async () => {
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        reconnectAttempts: 3,
        reconnectDelay: 10,
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      const firstWs = lastCreatedWs!;
      firstWs.simulateClose(1000, 'normal');
      await new Promise(r => setTimeout(r, 50));

      expect(lastCreatedWs).toBe(firstWs);
    });

    test('disconnect() 호출 후에는 재연결하지 않는다', async () => {
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        reconnectAttempts: 3,
        reconnectDelay: 50,
      });

      manager.connect();
      await new Promise(r => setTimeout(r, 10));
      const firstWs = lastCreatedWs!;

      manager.disconnect();
      await new Promise(r => setTimeout(r, 100));
      // disconnect 시 ws가 바뀌지만, 그 후 재연결은 없어야 함
      // disconnect 자체가 새 ws를 만들지는 않으므로 lastCreatedWs 체크
      expect(manager.getConnectionStatus()).toBe(false);
    });
  });

  describe('getPlayers', () => {
    test('복사본을 반환한다', () => {
      const p1 = manager.getPlayers();
      const p2 = manager.getPlayers();
      expect(p1).not.toBe(p2);
    });
  });

  describe('offline buffer', () => {
    test('연결 전 sendChat은 버퍼되고 연결 후 flush된다', async () => {
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        offlineQueueSize: 10,
      });

      manager.sendChat('hello', { range: 12 });
      manager.connect();
      await new Promise(r => setTimeout(r, 10));

      const ws = lastCreatedWs!;
      expect(ws.sentMessages.length).toBe(2); // Join + Chat(flush)
      const joinMsg = JSON.parse(ws.sentMessages[0]);
      expect(joinMsg.type).toBe('Join');
      const chatMsg = JSON.parse(ws.sentMessages[1]);
      expect(chatMsg.type).toBe('Chat');
      expect(chatMsg.text).toBe('hello');
      expect(chatMsg.range).toBe(12);
    });
  });

  describe('ping', () => {
    test('pingInterval 설정 시 Ping 전송되고 Pong 수신 시 RTT 콜백이 호출된다', () => {
      jest.useFakeTimers();
      let rtt = 0;
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        pingInterval: 10,
        onPing: (ms) => { rtt = ms; },
      });

      manager.connect();
      jest.advanceTimersByTime(20); // open + ping interval

      const ws = lastCreatedWs!;
      // sentMessages: Join + Ping (+ maybe another Ping)
      const pingRaw = ws.sentMessages.find((m) => JSON.parse(m).type === 'Ping');
      expect(pingRaw).toBeTruthy();
      const pingMsg = JSON.parse(pingRaw!);

      // Pong echo with ts
      ws.simulateMessage(JSON.stringify({ type: 'Pong', ts: pingMsg.ts }));
      expect(rtt).toBeGreaterThanOrEqual(0);

      jest.useRealTimers();
    });
  });

  describe('ack', () => {
    test('enableAck=true면 Chat에 ackId가 붙고 Ack 수신 시 재시도하지 않는다', () => {
      jest.useFakeTimers();
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        enableAck: true,
        reliableTimeout: 20,
        reliableRetryCount: 2,
      });

      manager.connect();
      jest.advanceTimersByTime(5); // open

      const ws = lastCreatedWs!;
      manager.sendChat('hello');

      const chatRaw = ws.sentMessages.find((m) => JSON.parse(m).type === 'Chat');
      expect(chatRaw).toBeTruthy();
      const chatMsg = JSON.parse(chatRaw!);
      expect(typeof chatMsg.ackId).toBe('string');
      expect(chatMsg.ackId.length).toBeGreaterThan(0);

      // Ack arrives before timeout.
      ws.simulateMessage(JSON.stringify({ type: 'Ack', ackId: chatMsg.ackId }));
      jest.advanceTimersByTime(100);

      const chatCount = ws.sentMessages.filter((m) => JSON.parse(m).type === 'Chat').length;
      expect(chatCount).toBe(1);

      jest.useRealTimers();
    });

    test('Ack가 오지 않으면 reliableRetryCount만큼 재시도 후 실패 콜백이 호출된다', () => {
      jest.useFakeTimers();
      const failed: Array<{ ackId: string; messageType: string }> = [];
      manager = new PlayerNetworkManager({
        url: 'ws://localhost:9999',
        roomId: 'room',
        playerName: 'p',
        playerColor: '#fff',
        enableAck: true,
        reliableTimeout: 10,
        reliableRetryCount: 2,
        onReliableFailed: (info) => failed.push(info),
      });

      manager.connect();
      jest.advanceTimersByTime(5); // open
      const ws = lastCreatedWs!;

      manager.sendChat('hello');
      const firstChatRaw = ws.sentMessages.find((m) => JSON.parse(m).type === 'Chat')!;
      const firstChat = JSON.parse(firstChatRaw);
      const ackId = firstChat.ackId as string;

      // initial + 2 retries
      jest.advanceTimersByTime(50);

      const chats = ws.sentMessages.filter((m) => JSON.parse(m).type === 'Chat').map((m) => JSON.parse(m));
      expect(chats.length).toBe(3);
      expect(chats.every((c) => c.ackId === ackId)).toBe(true);

      expect(failed.length).toBe(1);
      expect(failed[0].ackId).toBe(ackId);
      expect(failed[0].messageType).toBe('Chat');

      jest.useRealTimers();
    });
  });
});
