import { PlayerNetworkManager, type PlayerNetworkManagerOptions } from '../core/PlayerNetworkManager';
import { MAX_REMOTE_CHAT_TEXT_LENGTH, MAX_REMOTE_WIRE_MESSAGE_LENGTH } from '../core/remoteInputLimits';
import type { PlayerState } from '../types';

class InboundSocket {
  static OPEN = 1;
  static last: InboundSocket | null = null;
  readyState = InboundSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(readonly url: string) {
    InboundSocket.last = this;
  }

  send(): void {}

  close(): void {
    this.onclose?.({ code: 1000, reason: '' } as CloseEvent);
  }

  receive(message: object): void {
    this.onmessage?.({ data: JSON.stringify(message) } as MessageEvent);
  }
}

const originalWebSocket = globalThis.WebSocket;
beforeAll(() => {
  globalThis.WebSocket = InboundSocket as unknown as typeof WebSocket;
});
afterAll(() => {
  globalThis.WebSocket = originalWebSocket;
});

type Received = { joins: Map<string, PlayerState>; updates: Map<string, PlayerState>; chats: string[] };

function connect(options: Partial<PlayerNetworkManagerOptions> = {}): {
  manager: PlayerNetworkManager;
  socket: InboundSocket;
  received: Received;
} {
  const received: Received = { joins: new Map(), updates: new Map(), chats: [] };
  const manager = new PlayerNetworkManager({
    url: 'ws://room.test',
    roomId: 'room',
    playerName: 'local',
    playerColor: '#000000',
    onPlayerJoin: (id, state) => received.joins.set(id, state),
    onPlayerUpdate: (id, state) => received.updates.set(id, state),
    onChat: (_id, text) => received.chats.push(text),
    ...options,
  });
  manager.connect();
  const socket = InboundSocket.last;
  if (!socket) throw new Error('PlayerNetworkManager did not open a socket');
  socket.onopen?.(new Event('open'));
  socket.receive({ type: 'Welcome', client_id: 'local-id' });
  return { manager, socket, received };
}

const peerState = {
  name: 'peer',
  color: '#ff00ff',
  position: [1, 2, 3],
  rotation: [1, 0, 0, 0],
};

describe('PlayerNetworkManager inbound peer state', () => {
  test('unknown keys from peers are dropped instead of spread into player state', () => {
    const { manager, socket, received } = connect();
    socket.receive({
      type: 'PlayerJoined',
      client_id: 'peer-1',
      state: { ...peerState, isAdmin: true, constructor: 'x', payload: 'y'.repeat(10_000) },
    });
    socket.receive({ type: 'PlayerUpdate', client_id: 'peer-1', state: { animation: 'run', injected: 1 } });

    const joined = received.joins.get('peer-1');
    const updated = received.updates.get('peer-1');
    expect(joined && Object.keys(joined).sort()).toEqual(['color', 'name', 'position', 'rotation']);
    expect(updated && Object.keys(updated).sort()).toEqual(['animation', 'color', 'name', 'position', 'rotation']);
    expect(updated?.animation).toBe('run');
    manager.disconnect();
  });

  test('state arrays are copied, so later mutation of the parsed message cannot leak in', () => {
    const { manager, socket, received } = connect();
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-1', state: peerState });
    const first = received.joins.get('peer-1');
    socket.receive({ type: 'PlayerUpdate', client_id: 'peer-1', state: { position: [9, 9, 9] } });

    expect(first?.position).toEqual([1, 2, 3]);
    expect(received.updates.get('peer-1')?.position).toEqual([9, 9, 9]);
    manager.disconnect();
  });

  test('oversized strings are truncated and unsafe model URLs are ignored', () => {
    const { manager, socket, received } = connect();
    socket.receive({
      type: 'PlayerJoined',
      client_id: 'peer-1',
      state: { ...peerState, name: 'n'.repeat(500), modelUrl: 'javascript:alert(1)' },
    });
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-2', state: { ...peerState, modelUrl: 'data:model/gltf-binary;base64,AAAA' } });
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-3', state: { ...peerState, modelUrl: '/gltf/ally.glb' } });
    socket.receive({ type: 'Chat', client_id: 'peer-1', text: 'c'.repeat(1000), timestamp: 1 });

    expect(received.joins.get('peer-1')?.name).toHaveLength(64);
    expect(received.joins.get('peer-1')?.modelUrl).toBeUndefined();
    expect(received.joins.get('peer-2')?.modelUrl).toBeUndefined();
    expect(received.joins.get('peer-3')?.modelUrl).toBe('/gltf/ally.glb');
    expect(received.chats[0]).toHaveLength(200);
    manager.disconnect();
  });

  test('an application allowlist decides which remote model origins are loaded', () => {
    const { manager, socket, received } = connect({
      acceptModelUrl: (url) => url.startsWith('https://cdn.example.com/'),
    });
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-1', state: { ...peerState, modelUrl: 'https://evil.example.net/a.glb' } });
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-2', state: { ...peerState, modelUrl: 'https://cdn.example.com/a.glb' } });

    expect(received.joins.get('peer-1')?.modelUrl).toBeUndefined();
    expect(received.joins.get('peer-2')?.modelUrl).toBe('https://cdn.example.com/a.glb');
    manager.disconnect();
  });

  test('slim updates keep identity and animation from earlier messages; legacy full updates still apply', () => {
    const { manager, socket, received } = connect();
    const identity = { ...peerState, modelUrl: '/gltf/ally.glb', animation: 'run' };
    socket.receive({ type: 'PlayerJoined', client_id: 'peer-1', state: identity });
    socket.receive({ type: 'PlayerUpdate', client_id: 'peer-1', state: { position: [4, 5, 6], rotation: [1, 0, 0, 0], velocity: [0, 0, 0] } });
    expect(received.updates.get('peer-1')).toEqual({ ...identity, position: [4, 5, 6], velocity: [0, 0, 0] });

    const legacy = {
      name: 'renamed', color: '#00ff00', position: [7, 8, 9], rotation: [0, 0, 1, 0],
      animation: 'idle', velocity: [1, 0, 0], modelUrl: '/gltf/other.glb',
    };
    socket.receive({ type: 'PlayerUpdate', client_id: 'peer-1', state: legacy });
    expect(received.updates.get('peer-1')).toEqual(legacy);
    manager.disconnect();
  });

  test('an update for an unknown peer keeps defaults when fields are absent', () => {
    const { manager, socket, received } = connect();
    socket.receive({ type: 'PlayerUpdate', client_id: 'late-peer', state: { position: [4, 5, 6] } });

    expect(received.joins.get('late-peer')).toEqual({
      name: 'Player',
      color: '#ffffff',
      position: [4, 5, 6],
      rotation: [1, 0, 0, 0],
    });
    manager.disconnect();
  });

  test('room_state from Welcome is sanitized before it reaches listeners', () => {
    const onWelcome = jest.fn<void, [string, Record<string, PlayerState> | undefined]>();
    const received: Received = { joins: new Map(), updates: new Map(), chats: [] };
    const manager = new PlayerNetworkManager({
      url: 'ws://room.test',
      roomId: 'room',
      playerName: 'local',
      playerColor: '#000000',
      onWelcome,
      onPlayerJoin: (id, state) => received.joins.set(id, state),
    });
    manager.connect();
    const socket = InboundSocket.last;
    if (!socket) throw new Error('PlayerNetworkManager did not open a socket');
    socket.onopen?.(new Event('open'));
    socket.receive({
      type: 'Welcome',
      client_id: 'local-id',
      room_state: { 'peer-1': { ...peerState, extra: { nested: true } } },
    });

    const roomState = onWelcome.mock.calls[0]?.[1];
    expect(roomState?.['peer-1'] && Object.keys(roomState['peer-1']).sort()).toEqual(['color', 'name', 'position', 'rotation']);
    expect(received.joins.get('peer-1')).toEqual(roomState?.['peer-1']);
    manager.disconnect();
  });
});

describe('inbound wire limits', () => {
  const TOO_LARGE = '서버 메시지가 너무 큽니다';

  test('상한을 넘는 문자열 메시지는 JSON 파싱 전에 거부한다', () => {
    const errors: string[] = [];
    const { manager, socket, received } = connect({ onError: (error) => errors.push(error) });
    const oversized = JSON.stringify({ type: 'Chat', client_id: 'peer', text: 'x'.repeat(MAX_REMOTE_WIRE_MESSAGE_LENGTH), timestamp: 1 });
    const parse = jest.spyOn(JSON, 'parse');
    try {
      socket.onmessage?.({ data: oversized } as MessageEvent);
      expect(parse).not.toHaveBeenCalled();
    } finally {
      parse.mockRestore();
    }
    expect(received.chats).toEqual([]);
    expect(errors).toEqual([TOO_LARGE]);
    manager.disconnect();
  });

  test('큰 Blob은 읽기 전에, 큰 ArrayBuffer는 디코딩 전에 거부한다', () => {
    const errors: string[] = [];
    const { manager, socket } = connect({ onError: (error) => errors.push(error) });
    const text = jest.fn(async () => '{}');
    socket.onmessage?.({ data: { size: MAX_REMOTE_WIRE_MESSAGE_LENGTH + 1, text } } as unknown as MessageEvent);
    socket.onmessage?.({ data: new ArrayBuffer(MAX_REMOTE_WIRE_MESSAGE_LENGTH + 1) } as MessageEvent);
    expect(text).not.toHaveBeenCalled();
    expect(errors).toEqual([TOO_LARGE, TOO_LARGE]);
    manager.disconnect();
  });

  test('수신 채팅은 공용 상한 길이로 자른다', () => {
    const { manager, socket, received } = connect();
    socket.receive({ type: 'Chat', client_id: 'peer', text: '가'.repeat(MAX_REMOTE_CHAT_TEXT_LENGTH + 50), timestamp: 1 });
    expect(received.chats[0]).toHaveLength(MAX_REMOTE_CHAT_TEXT_LENGTH);
    manager.disconnect();
  });
});
