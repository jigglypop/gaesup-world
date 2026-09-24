import {
  clampRemoteString,
  MAX_REMOTE_CHAT_TEXT_LENGTH,
  MAX_REMOTE_MODEL_URL_LENGTH,
  MAX_REMOTE_WIRE_MESSAGE_LENGTH,
} from './remoteInputLimits';
import { NetworkPayload, PlayerState } from '../types';

type PlayerNetworkLogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

/** `reconnecting` disconnects keep remote players until the next Welcome reconciles them. */
export type PlayerDisconnectInfo = { reconnecting: boolean };

export interface PlayerNetworkManagerOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
  /** Sent with Join so peers can load the avatar before its first Update. */
  modelUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  /**
   * Once the server has answered a ping, a ping still unanswered when the next one is due
   * marks the socket half-open: it is dropped and reconnected without waiting for TCP.
   */
  pingInterval?: number;
  sendRateLimit?: number;
  offlineQueueSize?: number;
  enableAck?: boolean;
  reliableTimeout?: number;
  reliableRetryCount?: number;
  logLevel?: PlayerNetworkLogLevel;
  logToConsole?: boolean;
  /**
   * Remote peers choose their own `modelUrl`, which every client then fetches.
   * By default only http(s) and relative URLs are accepted; supply an allowlist to restrict origins.
   */
  acceptModelUrl?: (url: string) => boolean;
  onConnect?: () => void;
  onDisconnect?: (info?: PlayerDisconnectInfo) => void;
  onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
  onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  onPlayerLeave?: (playerId: string) => void;
  onChat?: (playerId: string, text: string, timestamp: number) => void;
  onPing?: (rttMs: number) => void;
  onReliableFailed?: (info: { ackId: string; messageType: string }) => void;
  onError?: (error: string) => void;
}

type TextReadablePayload = {
  text: () => Promise<string>;
};
type WebSocketMessageData = string | ArrayBuffer | Blob | TextReadablePayload | null | undefined;
type PlayerNetworkLogArg = object | string | number | boolean | bigint | symbol | null | undefined;

const isTextReadablePayload = (value: WebSocketMessageData): value is TextReadablePayload => {
  if (typeof value !== 'object' || value === null) return false;
  return 'text' in value && typeof value.text === 'function';
};

type StickyField = 'name' | 'color' | 'modelUrl' | 'animation';
/** Receivers merge updates, so these ride along only when they differ from what the connection already sent. */
const STICKY_FIELDS: readonly StickyField[] = ['name', 'color', 'modelUrl', 'animation'];
/** Remote players survive a reconnect for this long before they are dropped. */
const DISCONNECT_GRACE_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
/** Application close code for a socket abandoned after a missed pong. */
const PONG_TIMEOUT_CLOSE_CODE = 4000;

export class PlayerNetworkManager {
  private ws: WebSocket | null = null;
  private url: string;
  private roomId: string;
  private playerName: string;
  private playerColor: string;
  private modelUrl: string | undefined;
  private players: Map<string, PlayerState> = new Map();
  private localPlayerId: string | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private logLevel: PlayerNetworkLogLevel;
  private logToConsole: boolean;
  private acceptModelUrl: ((url: string) => boolean) | undefined;
  private reconnectAttemptsMax: number;
  private reconnectDelayMs: number;
  private reconnectAttemptsUsed: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = false;
  private pingIntervalMs: number;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private lastPingSentAt: number = 0;
  /** 0 until the server answers a ping on the current connection; half-open detection starts then. */
  private lastPongAt: number = 0;
  private retainedIds: Set<string> = new Set();
  private retainTimer: ReturnType<typeof setTimeout> | null = null;

  private updateRateLimitMs: number;
  private lastUpdateSentAt: number = 0;
  private pendingUpdate: Partial<PlayerState> | null = null;
  private updateFlushTimer: ReturnType<typeof setTimeout> | null = null;
  private sentFields: Partial<Pick<PlayerState, StickyField>> = {};

  private offlineQueueSize: number;
  private pendingChats: Array<{ text: string; range?: number }> = [];

  // Optional app-level ACK (server must echo Ack for dedupe/retry).
  private enableAck: boolean;
  private reliableTimeoutMs: number;
  private reliableRetryCount: number;
  private ackIdCounter: number = 1;
  private pendingAcks: Map<
    string,
    { raw: string; messageType: string; retriesLeft: number; timer: ReturnType<typeof setTimeout> | null }
  > = new Map();
  
  // 콜백 함수들
  private onConnect?: () => void;
  private onDisconnect?: (info?: PlayerDisconnectInfo) => void;
  private onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
  private onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  private onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  private onPlayerLeave?: (playerId: string) => void;
  private onChat?: (playerId: string, text: string, timestamp: number) => void;
  private onPing?: (rttMs: number) => void;
  private onReliableFailed?: (info: { ackId: string; messageType: string }) => void;
  private onError?: (error: string) => void;

  constructor(options: PlayerNetworkManagerOptions) {
    this.url = options.url;
    this.roomId = options.roomId;
    this.playerName = options.playerName;
    this.playerColor = options.playerColor;
    this.modelUrl = options.modelUrl;
    this.reconnectAttemptsMax = Math.max(0, Math.floor(options.reconnectAttempts ?? 0));
    this.reconnectDelayMs = Math.max(0, Math.floor(options.reconnectDelay ?? 1000));
    this.pingIntervalMs = Math.max(0, Math.floor(options.pingInterval ?? 0));
    this.updateRateLimitMs = Math.max(0, Math.floor(options.sendRateLimit ?? 0));
    this.offlineQueueSize = Math.max(0, Math.floor(options.offlineQueueSize ?? 50));
    this.enableAck = !!options.enableAck;
    this.reliableTimeoutMs = Math.max(0, Math.floor(options.reliableTimeout ?? 5000));
    this.reliableRetryCount = Math.max(0, Math.floor(options.reliableRetryCount ?? 0));
    this.logLevel = options.logLevel ?? 'none';
    this.logToConsole = options.logToConsole ?? false;
    this.acceptModelUrl = options.acceptModelUrl;
    if (options.onConnect) this.onConnect = options.onConnect;
    if (options.onDisconnect) this.onDisconnect = options.onDisconnect;
    if (options.onWelcome) this.onWelcome = options.onWelcome;
    if (options.onPlayerJoin) this.onPlayerJoin = options.onPlayerJoin;
    if (options.onPlayerUpdate) this.onPlayerUpdate = options.onPlayerUpdate;
    if (options.onPlayerLeave) this.onPlayerLeave = options.onPlayerLeave;
    if (options.onChat) this.onChat = options.onChat;
    if (options.onPing) this.onPing = options.onPing;
    if (options.onReliableFailed) this.onReliableFailed = options.onReliableFailed;
    if (options.onError) this.onError = options.onError;
  }

  private shouldLog(level: Exclude<PlayerNetworkLogLevel, 'none'>): boolean {
    if (!this.logToConsole) return false;
    const levels: Record<PlayerNetworkLogLevel, number> = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    };
    return levels[level] <= levels[this.logLevel];
  }

  private debug(message: string, ...args: PlayerNetworkLogArg[]): void {
    if (!this.shouldLog('debug')) return;
    console.log(message, ...args);
  }

  private info(message: string, ...args: PlayerNetworkLogArg[]): void {
    if (!this.shouldLog('info')) return;
    console.info(message, ...args);
  }

  private warn(message: string, ...args: PlayerNetworkLogArg[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(message, ...args);
  }

  private error(message: string, ...args: PlayerNetworkLogArg[]): void {
    if (!this.shouldLog('error')) return;
    console.error(message, ...args);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.warn('[PlayerNetworkManager] Already connected');
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.warn('[PlayerNetworkManager] Already connecting');
      return;
    }
    if (this.isConnecting) {
      this.warn('[PlayerNetworkManager] Already connecting');
      return;
    }

    this.shouldReconnect = this.reconnectAttemptsMax > 0;
    this.clearReconnectTimer();
    this.isConnecting = true;

    this.info('[PlayerNetworkManager] Connecting WebSocket', this.url);
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.isConnecting = false;
      this.isConnected = false;
      this.onError?.('WebSocket 연결 실패');
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      if (this.ws !== ws) return;
      this.info('[PlayerNetworkManager] WebSocket connected');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttemptsUsed = 0;
      this.startPingLoop();
      // A new connection may reach a server that never saw this player, so its first Update is complete.
      this.sentFields = {};

      // Join 메시지 전송
      ws.send(JSON.stringify({
        type: 'Join',
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor,
        ...(this.modelUrl ? { modelUrl: this.modelUrl } : {}),
      }));

      // Resend in-flight reliable messages, when present, after reconnect.
      this.resumePendingAcks();
      // Flush buffered messages after resuming existing ACKs to avoid resending new messages.
      this.flushOfflineQueue();
      
      if (this.onConnect) {
        this.onConnect();
      }
    };

    ws.onmessage = (event) => {
      // Browser WebSocket can deliver string | Blob | ArrayBuffer.
      // Avoid throwing inside the handler (would silently break updates).
      const handleText = (text: string) => {
        if (this.ws !== ws || ws.readyState !== WebSocket.OPEN) return;
        if (text.length > MAX_REMOTE_WIRE_MESSAGE_LENGTH) {
          this.onError?.('서버 메시지가 너무 큽니다');
          return;
        }
        try {
          const message: unknown = JSON.parse(text);
          if (!isServerMessage(message)) {
            this.onError?.('서버 메시지 형식이 올바르지 않습니다');
            return;
          }
          this.handleServerMessage(message);
        } catch {
          this.onError?.('서버 메시지 파싱 실패');
        }
      };

      const data = event.data as WebSocketMessageData;
      if (typeof data === 'string') {
        handleText(data);
        return;
      }

      if (isTextReadablePayload(data)) {
        if ('size' in data && typeof data.size === 'number' && data.size > MAX_REMOTE_WIRE_MESSAGE_LENGTH) {
          this.onError?.('서버 메시지가 너무 큽니다');
          return;
        }
        data
          .text()
          .then((t: string) => handleText(t))
          .catch(() => {
            if (this.ws === ws && ws.readyState === WebSocket.OPEN) {
              this.onError?.('서버 메시지 수신 실패');
            }
          });
        return;
      }

      if (data instanceof ArrayBuffer) {
        if (data.byteLength > MAX_REMOTE_WIRE_MESSAGE_LENGTH) {
          this.onError?.('서버 메시지가 너무 큽니다');
          return;
        }
        try {
          const text = new TextDecoder().decode(new Uint8Array(data));
          handleText(text);
        } catch {
          this.onError?.('서버 메시지 디코딩 실패');
        }
      }
    };

    ws.onerror = (error) => {
      if (this.ws !== ws) return;
      this.error('[PlayerNetworkManager] WebSocket error', error);
      this.isConnected = false;
      this.isConnecting = false;
      if (this.onError) {
        this.onError('WebSocket 연결 에러');
      }
    };

    ws.onclose = (event) => {
      if (this.ws !== ws) return;
      this.info('[PlayerNetworkManager] WebSocket closed', { code: event.code, reason: event.reason });
      this.handleClosed(event.code);
    };
  }

  /** Shared by real closes and abandoned half-open sockets. */
  private handleClosed(code: number): void {
    this.isConnected = false;
    this.isConnecting = false;
    this.stopPingLoop();
    this.pausePendingAcks();
    this.localPlayerId = null;

    // Do not reconnect on normal closures.
    if (code === 1000 || code === 1001) {
      this.shouldReconnect = false;
    }

    // If the socket was closed (network drop), retry automatically when configured.
    // disconnect() disables shouldReconnect so it won't loop.
    const reconnecting = this.tryReconnect();
    // A short drop keeps remote avatars mounted; the next Welcome reconciles them.
    if (reconnecting) this.retainPlayers();
    else this.clearPlayers();
    this.onDisconnect?.({ reconnecting });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopPingLoop();
    this.clearUpdateFlushTimer();
    this.clearAllPendingAcks(true);
    this.pendingUpdate = null;
    this.pendingChats = [];

    if (!this.ws) {
      this.clearPlayers();
      this.isConnected = false;
      this.isConnecting = false;
      this.localPlayerId = null;
      this.onDisconnect?.({ reconnecting: false });
      return;
    }

    const ws = this.ws;
    // Detach handlers first to avoid late events calling callbacks after disconnect().
    detachHandlers(ws);

    if (ws.readyState === WebSocket.OPEN) {
        try {
        ws.send(JSON.stringify({ type: 'Leave' }));
        } catch {
          // ignore
        }
      }
    try {
      ws.close();
    } catch {
      // ignore
    }

    this.ws = null;
    this.clearPlayers();
    this.isConnected = false;
    this.isConnecting = false;
    this.localPlayerId = null;
    this.onDisconnect?.({ reconnecting: false });
  }

  updateLocalPlayer(state: Partial<PlayerState>): void {
    // Coalesce latest update for offline/reconnect and for rate limiting.
    this.pendingUpdate = this.pendingUpdate ? { ...this.pendingUpdate, ...state } : { ...state };

    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // The only send-rate limit on the Update path; excess updates coalesce instead of being dropped.
    const now = Date.now();
    if (this.updateRateLimitMs <= 0 || now - this.lastUpdateSentAt >= this.updateRateLimitMs) {
      this.lastUpdateSentAt = now;
      const payload = this.pendingUpdate;
      this.pendingUpdate = null;
      if (!payload) return;
      this.sendUpdate(ws, payload);
      return;
    }

    // Schedule a flush at the next permitted time.
    if (this.updateFlushTimer) return;
    const delay = Math.max(0, this.updateRateLimitMs - (now - this.lastUpdateSentAt));
    this.updateFlushTimer = setTimeout(() => {
      this.updateFlushTimer = null;
      const p = this.pendingUpdate;
      // keep pendingUpdate for coalescing if still rate-limited; updateLocalPlayer handles it.
      if (!p) return;
      this.updateLocalPlayer(p);
    }, delay);
  }

  /** `state` is owned by the manager; unchanged sticky fields are removed before it goes on the wire. */
  private sendUpdate(ws: WebSocket, state: Partial<PlayerState>): void {
    const sent = this.sentFields;
    for (const key of STICKY_FIELDS) {
      if (state[key] === sent[key]) delete state[key];
    }
    if (Object.keys(state).length === 0) return;
    ws.send(JSON.stringify({ type: 'Update', state }));
    for (const key of STICKY_FIELDS) {
      const value = state[key];
      if (value !== undefined) sent[key] = value;
    }
  }

  sendChat(text: string, options?: { range?: number }): void {
    const safeText = String(text ?? '').trim().slice(0, MAX_REMOTE_CHAT_TEXT_LENGTH);
    if (!safeText) return;

    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      if (this.offlineQueueSize <= 0) return;
      if (this.pendingChats.length >= this.offlineQueueSize) this.pendingChats.shift();
      if (options?.range !== undefined) {
        this.pendingChats.push({ text: safeText, range: options.range });
      } else {
        this.pendingChats.push({ text: safeText });
      }
      return;
    }

    const payload = {
      type: 'Chat' as const,
      text: safeText,
      ...(options?.range !== undefined ? { range: options.range } : {}),
    };

    if (this.enableAck) {
      this.sendReliable(payload);
      return;
    }

    ws.send(JSON.stringify(payload));
  }

  private handleServerMessage(message: ServerMessage): void {
    this.debug('[PlayerNetworkManager] Server message', message.type, message);
    
    switch (message.type) {
      case 'Ack': {
        if (typeof message.ackId === 'string' && message.ackId) {
          this.ackReceived(message.ackId);
        }
        break;
      }
      case 'Pong': {
        this.lastPongAt = Date.now();
        if (typeof message.ts === 'number' && message.ts > 0) {
          const rtt = Math.max(0, Date.now() - message.ts);
          this.onPing?.(rtt);
        } else if (this.lastPingSentAt > 0) {
          const rtt = Math.max(0, Date.now() - this.lastPingSentAt);
          this.onPing?.(rtt);
        }
        break;
      }
      case 'Welcome': {
        this.localPlayerId = message.client_id;
        let roomState: Record<string, PlayerState> | undefined;
        if (message.room_state) {
          roomState = {};
          for (const [id, state] of Object.entries(message.room_state)) {
            roomState[id] = this.completePlayerState(state);
          }
        }
        this.onWelcome?.(this.localPlayerId, roomState);
        this.releaseRetained(roomState);

        if (roomState) {
          for (const [id, state] of Object.entries(roomState)) {
            if (id === this.localPlayerId) continue;
            // Players kept through a reconnect are updated in place instead of joining again.
            const known = this.players.has(id);
            this.players.set(id, state);
            if (known) this.onPlayerUpdate?.(id, state);
            else this.onPlayerJoin?.(id, state);
          }
        }
        break;
      }

      case 'PlayerJoined':
        this.debug('[PlayerNetworkManager] PlayerJoined', message.client_id);
        if (message.client_id !== this.localPlayerId) {
          const state = this.completePlayerState(message.state);
          this.players.set(message.client_id, state);
          if (this.onPlayerJoin) {
            this.onPlayerJoin(message.client_id, state);
          }
        }
        break;

      case 'PlayerLeft':
        this.debug('[PlayerNetworkManager] PlayerLeft', message.client_id);
        this.players.delete(message.client_id);
        if (this.onPlayerLeave) {
          this.onPlayerLeave(message.client_id);
        }
        break;

      case 'PlayerUpdate':
        this.debug('[PlayerNetworkManager] PlayerUpdate', message.client_id);
        {
          const update = this.copyPlayerState(message.state);
          const existingPlayer = this.players.get(message.client_id);
          if (existingPlayer) {
            // Avoid mutating shared references; create a new state object.
            const next: PlayerState = { ...existingPlayer, ...update };
            this.players.set(message.client_id, next);
            this.onPlayerUpdate?.(message.client_id, next);
            break;
          }

          // Be robust to out-of-order delivery: accept updates even if we missed Welcome/Joined.
          const created = this.completePlayerState(update);
          this.players.set(message.client_id, created);
          // Treat as join+update so UI renders immediately.
          this.onPlayerJoin?.(message.client_id, created);
          this.onPlayerUpdate?.(message.client_id, created);
        }
        break;

      case 'Chat':
        this.onChat?.(message.client_id, message.text.slice(0, MAX_REMOTE_CHAT_TEXT_LENGTH), message.timestamp);
        break;

      default:
        // Ignore unknown message types for forward compatibility.
        break;
    }
  }

  /** Copies only known, bounded fields so peers cannot inject extra keys or oversized values. */
  private copyPlayerState(state: Partial<PlayerState>): Partial<PlayerState> {
    const out: Partial<PlayerState> = {};
    if (typeof state.name === 'string') out.name = clampRemoteString('name', state.name);
    if (typeof state.color === 'string') out.color = clampRemoteString('color', state.color);
    if (typeof state.animation === 'string') out.animation = clampRemoteString('animation', state.animation);
    if (typeof state.modelUrl === 'string' && isSafeModelUrl(state.modelUrl)
      && (this.acceptModelUrl?.(state.modelUrl) ?? true)) {
      out.modelUrl = state.modelUrl;
    }
    if (state.position) out.position = [state.position[0], state.position[1], state.position[2]];
    if (state.rotation) out.rotation = [state.rotation[0], state.rotation[1], state.rotation[2], state.rotation[3]];
    if (state.velocity) out.velocity = [state.velocity[0], state.velocity[1], state.velocity[2]];
    return out;
  }

  private completePlayerState(state: Partial<PlayerState>): PlayerState {
    return {
      name: 'Player',
      color: '#ffffff',
      position: [0, 0, 0],
      rotation: [1, 0, 0, 0],
      ...this.copyPlayerState(state),
    };
  }

  setCallbacks(callbacks: {
    onConnect?: () => void;
    onDisconnect?: (info?: PlayerDisconnectInfo) => void;
    onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
    onPlayerJoin?: (playerId: string, state: PlayerState) => void;
    onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
    onPlayerLeave?: (playerId: string) => void;
    onChat?: (playerId: string, text: string, timestamp: number) => void;
    onPing?: (rttMs: number) => void;
    onReliableFailed?: (info: { ackId: string; messageType: string }) => void;
    onError?: (error: string) => void;
  }): void {
    if (callbacks.onConnect) this.onConnect = callbacks.onConnect;
    if (callbacks.onDisconnect) this.onDisconnect = callbacks.onDisconnect;
    if (callbacks.onWelcome) this.onWelcome = callbacks.onWelcome;
    if (callbacks.onPlayerJoin) this.onPlayerJoin = callbacks.onPlayerJoin;
    if (callbacks.onPlayerUpdate) this.onPlayerUpdate = callbacks.onPlayerUpdate;
    if (callbacks.onPlayerLeave) this.onPlayerLeave = callbacks.onPlayerLeave;
    if (callbacks.onChat) this.onChat = callbacks.onChat;
    if (callbacks.onPing) this.onPing = callbacks.onPing;
    if (callbacks.onReliableFailed) this.onReliableFailed = callbacks.onReliableFailed;
    if (callbacks.onError) this.onError = callbacks.onError;
  }

  getPlayers(): Map<string, PlayerState> {
    return new Map(this.players);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private startPingLoop(): void {
    this.lastPingSentAt = 0;
    this.lastPongAt = 0;
    if (this.pingIntervalMs <= 0) return;
    this.stopPingLoop();

    this.pingTimer = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      // A server that answers pings but let the last one go a whole interval unanswered is half-open.
      if (this.lastPongAt > 0 && this.lastPongAt < this.lastPingSentAt) {
        this.abandonSocket(ws);
        return;
      }
      const ts = Date.now();
      this.lastPingSentAt = ts;
      try {
        ws.send(JSON.stringify({ type: 'Ping', ts }));
      } catch {
        // ignore
      }
    }, this.pingIntervalMs);
  }

  private stopPingLoop(): void {
    if (!this.pingTimer) return;
    clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  /** Closing a half-open socket can take minutes, so it is detached and treated as closed now. */
  private abandonSocket(ws: WebSocket): void {
    this.warn('[PlayerNetworkManager] Pong timeout; reconnecting');
    detachHandlers(ws);
    try {
      ws.close(PONG_TIMEOUT_CLOSE_CODE, 'pong timeout');
    } catch {
      // ignore
    }
    this.handleClosed(PONG_TIMEOUT_CLOSE_CODE);
  }

  private retainPlayers(): void {
    for (const id of this.players.keys()) this.retainedIds.add(id);
    if (this.retainTimer || this.retainedIds.size === 0) return;
    this.retainTimer = setTimeout(() => {
      this.retainTimer = null;
      this.releaseRetained();
    }, DISCONNECT_GRACE_MS);
  }

  /** Players kept through a reconnect leave unless the new room state still lists them. */
  private releaseRetained(room?: Record<string, PlayerState>): void {
    this.clearRetainTimer();
    for (const id of this.retainedIds) {
      if (room && Object.hasOwn(room, id) && id !== this.localPlayerId) continue;
      if (this.players.delete(id)) this.onPlayerLeave?.(id);
    }
    this.retainedIds.clear();
  }

  private clearRetainTimer(): void {
    if (!this.retainTimer) return;
    clearTimeout(this.retainTimer);
    this.retainTimer = null;
  }

  private clearPlayers(): void {
    this.clearRetainTimer();
    this.retainedIds.clear();
    this.players.clear();
  }

  private clearUpdateFlushTimer(): void {
    if (!this.updateFlushTimer) return;
    clearTimeout(this.updateFlushTimer);
    this.updateFlushTimer = null;
  }

  private flushOfflineQueue(): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (this.pendingChats.length > 0) {
      const chats = this.pendingChats;
      this.pendingChats = [];
      for (const c of chats) {
        try {
          const payload = {
            type: 'Chat',
            text: c.text,
            ...(c.range !== undefined ? { range: c.range } : {}),
          };

          if (this.enableAck) {
            this.sendReliable(payload);
          } else {
            ws.send(JSON.stringify(payload));
          }
        } catch {
          // If sending fails mid-flush, re-buffer remaining and stop.
          if (this.offlineQueueSize > 0) {
            this.pendingChats = chats.slice(chats.indexOf(c));
          }
          break;
        }
      }
    }

    if (this.pendingUpdate) {
      const u = this.pendingUpdate;
      this.pendingUpdate = null;
      this.updateLocalPlayer(u);
    }
  }

  /** Schedules the next attempt; returns false when this disconnect is final. */
  private tryReconnect(): boolean {
    if (!this.shouldReconnect) return false;
    if (this.reconnectAttemptsMax <= 0) return false;
    if (this.reconnectAttemptsUsed >= this.reconnectAttemptsMax) return false;
    if (this.isConnecting) return false;

    const attempt = this.reconnectAttemptsUsed + 1;
    // Exponential backoff, capped to keep UI responsive. Jitter in [0.5, 1) spreads clients
    // that lost the same server so they do not all return at once.
    const base = this.reconnectDelayMs || 0;
    const backoff = Math.min(MAX_RECONNECT_DELAY_MS, base * Math.pow(2, this.reconnectAttemptsUsed));
    const delay = Math.floor(backoff * (0.5 + Math.random() * 0.5));
    this.reconnectAttemptsUsed = attempt;

    this.warn('[PlayerNetworkManager] Reconnecting...', { attempt, delay });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.shouldReconnect) return;
      this.connect();
    }, delay);
    return true;
  }

  private nextAckId(): string {
    const n = this.ackIdCounter++;
    return `ack_${Date.now()}_${n}`;
  }

  private sendReliable(payload: { type: string; [k: string]: NetworkPayload }): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const ackId = this.nextAckId();
    const messageType = String(payload.type ?? 'Unknown');
    const raw = JSON.stringify({ ...payload, ackId });

    ws.send(raw);
    this.trackPendingAck({ ackId, raw, messageType });
  }

  private trackPendingAck(args: { ackId: string; raw: string; messageType: string }): void {
    if (!this.enableAck) return;
    // Replace the previous entry with the same ackId (shouldn't happen, but keep it safe).
    this.stopAckTimer(args.ackId);

    this.pendingAcks.set(args.ackId, {
      raw: args.raw,
      messageType: args.messageType,
      retriesLeft: this.reliableRetryCount,
      timer: null,
    });

    this.scheduleAckTimeout(args.ackId);
  }

  private scheduleAckTimeout(ackId: string): void {
    if (!this.enableAck) return;
    const entry = this.pendingAcks.get(ackId);
    if (!entry) return;
    if (this.reliableTimeoutMs <= 0) return;

    entry.timer = setTimeout(() => {
      const e = this.pendingAcks.get(ackId);
      if (!e) return;

      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        // Pause retries until we reconnect.
        e.timer = null;
        return;
      }

      if (e.retriesLeft <= 0) {
        this.pendingAcks.delete(ackId);
        this.onReliableFailed?.({ ackId, messageType: e.messageType });
        return;
      }

      e.retriesLeft -= 1;
      try {
        ws.send(e.raw);
      } catch {
        // If send fails, keep entry and try again after reconnect.
        e.timer = null;
        return;
      }

      this.scheduleAckTimeout(ackId);
    }, this.reliableTimeoutMs);
  }

  private stopAckTimer(ackId: string): void {
    const entry = this.pendingAcks.get(ackId);
    if (!entry || !entry.timer) return;
    clearTimeout(entry.timer);
    entry.timer = null;
  }

  private ackReceived(ackId: string): void {
    const entry = this.pendingAcks.get(ackId);
    if (!entry) return;
    this.stopAckTimer(ackId);
    this.pendingAcks.delete(ackId);
  }

  private pausePendingAcks(): void {
    // Keep entries but stop timers; they'll resume after reconnect.
    for (const [ackId, entry] of this.pendingAcks.entries()) {
      if (entry.timer) {
        clearTimeout(entry.timer);
        entry.timer = null;
      }
      // Also drop entries when ACK is disabled to avoid unbounded growth.
      if (!this.enableAck) {
        this.pendingAcks.delete(ackId);
      }
    }
  }

  private resumePendingAcks(): void {
    if (!this.enableAck) return;
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    for (const [ackId, entry] of this.pendingAcks.entries()) {
      // Best-effort resend once after reconnect.
      try {
        ws.send(entry.raw);
      } catch {
        // leave it pending
        continue;
      }
      this.scheduleAckTimeout(ackId);
    }
  }

  private clearAllPendingAcks(clearEntries: boolean): void {
    for (const [ackId, entry] of this.pendingAcks.entries()) {
      if (entry.timer) clearTimeout(entry.timer);
      entry.timer = null;
      if (clearEntries) this.pendingAcks.delete(ackId);
    }
    if (clearEntries) this.pendingAcks.clear();
  }
} 

type WelcomeMessage = {
  type: 'Welcome';
  client_id: string;
  room_state?: Record<string, PlayerState>;
};

type PlayerJoinedMessage = {
  type: 'PlayerJoined';
  client_id: string;
  state: PlayerState;
};

type PlayerLeftMessage = {
  type: 'PlayerLeft';
  client_id: string;
};

type PlayerUpdateMessage = {
  type: 'PlayerUpdate';
  client_id: string;
  state: Partial<PlayerState>;
};

type ChatMessage = {
  type: 'Chat';
  client_id: string;
  text: string;
  timestamp: number;
};

type PongMessage = {
  type: 'Pong';
  ts?: number;
};

type AckMessage = {
  type: 'Ack';
  ackId: string;
};

type ServerMessage = WelcomeMessage | PlayerJoinedMessage | PlayerLeftMessage | PlayerUpdateMessage | ChatMessage | PongMessage | AckMessage;

/** Late events from a socket we gave up on must not reach callbacks. */
function detachHandlers(ws: WebSocket): void {
  ws.onopen = null;
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteTuple(value: unknown, length: number): boolean {
  return Array.isArray(value) && value.length === length
    && value.every((component: unknown) => typeof component === 'number' && Number.isFinite(component));
}

function isSafeModelUrl(url: string): boolean {
  if (!url || url.length > MAX_REMOTE_MODEL_URL_LENGTH) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url)?.[1]?.toLowerCase();
  return scheme === undefined || scheme === 'http' || scheme === 'https';
}

function isPlayerState(value: unknown, partial: boolean): boolean {
  if (!isRecord(value)) return false;
  for (const key of ['name', 'color', 'animation', 'modelUrl']) {
    if (!(key in value)) continue;
    const field = value[key];
    if (typeof field !== 'string') return false;
  }
  if ('position' in value && !isFiniteTuple(value['position'], 3)) return false;
  if ('rotation' in value && !isFiniteTuple(value['rotation'], 4)) return false;
  if ('velocity' in value && !isFiniteTuple(value['velocity'], 3)) return false;
  return partial || ['name', 'color', 'position', 'rotation'].every((key) => key in value);
}

function isServerMessage(value: unknown): value is ServerMessage {
  if (!isRecord(value)) return false;
  if (value['type'] === 'Ack') return typeof value['ackId'] === 'string' && value['ackId'].length > 0;
  if (value['type'] === 'Pong') {
    return value['ts'] === undefined || (typeof value['ts'] === 'number' && Number.isFinite(value['ts']));
  }
  if (typeof value['client_id'] !== 'string' || !value['client_id'].trim()) return false;
  switch (value['type']) {
    case 'Welcome':
      return value['room_state'] === undefined || (isRecord(value['room_state'])
        && Object.entries(value['room_state']).every(([id, state]) => id.trim().length > 0 && isPlayerState(state, false)));
    case 'PlayerJoined':
      return isPlayerState(value['state'], false);
    case 'PlayerUpdate':
      return isPlayerState(value['state'], true);
    case 'PlayerLeft':
      return true;
    case 'Chat':
      return typeof value['text'] === 'string'
        && typeof value['timestamp'] === 'number' && Number.isFinite(value['timestamp']);
    default:
      return false;
  }
}
