import { PlayerState } from '../types';

type PlayerNetworkLogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

export interface PlayerNetworkManagerOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
  sendRateLimit?: number;
  offlineQueueSize?: number;
  enableAck?: boolean;
  reliableTimeout?: number;
  reliableRetryCount?: number;
  logLevel?: PlayerNetworkLogLevel;
  logToConsole?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
  onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  onPlayerLeave?: (playerId: string) => void;
  onChat?: (playerId: string, text: string, timestamp: number) => void;
  onPing?: (rttMs: number) => void;
  onReliableFailed?: (info: { ackId: string; messageType: string }) => void;
  onError?: (error: string) => void;
}

export class PlayerNetworkManager {
  private ws: WebSocket | null = null;
  private url: string;
  private roomId: string;
  private playerName: string;
  private playerColor: string;
  private players: Map<string, PlayerState> = new Map();
  private localPlayerId: string | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private logLevel: PlayerNetworkLogLevel;
  private logToConsole: boolean;
  private reconnectAttemptsMax: number;
  private reconnectDelayMs: number;
  private reconnectAttemptsUsed: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = false;
  private pingIntervalMs: number;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private lastPingSentAt: number = 0;

  private updateRateLimitMs: number;
  private lastUpdateSentAt: number = 0;
  private pendingUpdate: Partial<PlayerState> | null = null;
  private updateFlushTimer: ReturnType<typeof setTimeout> | null = null;

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
  private onDisconnect?: () => void;
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

  private debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    console.log(message, ...args);
  }

  private info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    console.info(message, ...args);
  }

  private warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(message, ...args);
  }

  private error(message: string, ...args: unknown[]): void {
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
      this.info('[PlayerNetworkManager] WebSocket connected');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttemptsUsed = 0;
      this.startPingLoop();
      
      // Join 메시지 전송
      ws.send(JSON.stringify({
        type: 'Join',
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor
      }));

      // Flush buffered messages after Join to keep ordering sane.
      this.flushOfflineQueue();
      // Resend in-flight reliable messages (if any) after reconnect.
      this.resumePendingAcks();
      
      if (this.onConnect) {
        this.onConnect();
      }
    };

    ws.onmessage = (event) => {
      // Browser WebSocket can deliver string | Blob | ArrayBuffer.
      // Avoid throwing inside the handler (would silently break updates).
      const handleText = (text: string) => {
        try {
          const message = JSON.parse(text) as ServerMessage;
          this.handleServerMessage(message);
        } catch {
          this.onError?.('서버 메시지 파싱 실패');
        }
      };

      const data = event.data as unknown;
      if (typeof data === 'string') {
        handleText(data);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybeBlob = data as any;
      if (maybeBlob && typeof maybeBlob.text === 'function') {
        maybeBlob
          .text()
          .then((t: string) => handleText(t))
          .catch(() => this.onError?.('서버 메시지 수신 실패'));
        return;
      }

      if (data instanceof ArrayBuffer) {
        try {
          const text = new TextDecoder().decode(new Uint8Array(data));
          handleText(text);
        } catch {
          this.onError?.('서버 메시지 디코딩 실패');
        }
      }
    };

    ws.onerror = (error) => {
      this.error('[PlayerNetworkManager] WebSocket error', error);
      this.isConnected = false;
      this.isConnecting = false;
      if (this.onError) {
        this.onError('WebSocket 연결 에러');
      }
    };

    ws.onclose = (event) => {
      this.info('[PlayerNetworkManager] WebSocket closed', { code: event.code, reason: event.reason });
      const wasConnected = this.isConnected || this.isConnecting;
      this.isConnected = false;
      this.isConnecting = false;
      this.stopPingLoop();
      this.pausePendingAcks();
      this.players.clear();
      this.localPlayerId = null;
      if (this.onDisconnect) {
        this.onDisconnect();
      }

      // Do not reconnect on normal closures.
      if (event.code === 1000 || event.code === 1001) {
        this.shouldReconnect = false;
      }

      // If the socket was closed (network drop), retry automatically when configured.
      // disconnect() disables shouldReconnect so it won't loop.
      if (wasConnected) this.tryReconnect();
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopPingLoop();
    this.clearUpdateFlushTimer();
    this.clearAllPendingAcks(true);

    if (!this.ws) {
      this.players.clear();
      this.isConnected = false;
      this.isConnecting = false;
      this.localPlayerId = null;
      this.onDisconnect?.();
      return;
    }

    const ws = this.ws;
    // Detach handlers first to avoid late events calling callbacks after disconnect().
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;

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
    this.players.clear();
    this.isConnected = false;
    this.isConnecting = false;
    this.localPlayerId = null;
    this.pendingUpdate = null;
    this.pendingChats = [];
    this.onDisconnect?.();
  }

  updateLocalPlayer(state: Partial<PlayerState>): void {
    // Coalesce latest update for offline/reconnect and for rate limiting.
    this.pendingUpdate = this.pendingUpdate ? { ...this.pendingUpdate, ...state } : { ...state };

    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    if (this.updateRateLimitMs <= 0 || now - this.lastUpdateSentAt >= this.updateRateLimitMs) {
      this.lastUpdateSentAt = now;
      const payload = this.pendingUpdate;
      this.pendingUpdate = null;
      if (!payload) return;
      ws.send(JSON.stringify({ type: 'Update', state: payload }));
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

  sendChat(text: string, options?: { range?: number }): void {
    const safeText = String(text ?? '').trim().slice(0, 200);
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
        if (typeof message.ts === 'number' && message.ts > 0) {
          const rtt = Math.max(0, Date.now() - message.ts);
          this.onPing?.(rtt);
        } else if (this.lastPingSentAt > 0) {
          const rtt = Math.max(0, Date.now() - this.lastPingSentAt);
          this.onPing?.(rtt);
        }
        break;
      }
      case 'Welcome':
        this.localPlayerId = message.client_id;
        this.onWelcome?.(this.localPlayerId, message.room_state);
        
        if (message.room_state) {
          for (const [id, state] of Object.entries(message.room_state)) {
            if (id !== this.localPlayerId) {
              this.players.set(id, state);
              if (this.onPlayerJoin) {
                this.onPlayerJoin(id, state);
              }
            }
          }
        }
        break;

      case 'PlayerJoined':
        this.debug('[PlayerNetworkManager] PlayerJoined', message.client_id);
        if (message.client_id !== this.localPlayerId) {
          this.players.set(message.client_id, message.state);
          if (this.onPlayerJoin) {
            this.onPlayerJoin(message.client_id, message.state);
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
          const existingPlayer = this.players.get(message.client_id);
          if (existingPlayer) {
            // Avoid mutating shared references; create a new state object.
            const next: PlayerState = { ...existingPlayer, ...message.state };
            this.players.set(message.client_id, next);
            this.onPlayerUpdate?.(message.client_id, next);
            break;
          }

          // Be robust to out-of-order delivery: accept updates even if we missed Welcome/Joined.
          const state = message.state as Partial<PlayerState> | undefined;
          const created: PlayerState = {
            name: state?.name ?? 'Player',
            color: state?.color ?? '#ffffff',
            position: state?.position ?? [0, 0, 0],
            rotation: state?.rotation ?? [1, 0, 0, 0],
            ...(state ?? {}),
          };
          this.players.set(message.client_id, created);
          // Treat as join+update so UI renders immediately.
          this.onPlayerJoin?.(message.client_id, created);
          this.onPlayerUpdate?.(message.client_id, created);
        }
        break;

      case 'Chat':
        this.onChat?.(message.client_id, message.text, message.timestamp);
        break;

      default:
        // Ignore unknown message types for forward compatibility.
        break;
    }
  }

  setCallbacks(callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
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
    if (this.pingIntervalMs <= 0) return;
    this.stopPingLoop();

    this.pingTimer = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
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

  private tryReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.reconnectAttemptsMax <= 0) return;
    if (this.reconnectAttemptsUsed >= this.reconnectAttemptsMax) return;
    if (this.isConnecting) return;

    const attempt = this.reconnectAttemptsUsed + 1;
    // Exponential backoff, capped to keep UI responsive.
    const base = this.reconnectDelayMs || 0;
    const delay = Math.min(30000, Math.floor(base * Math.pow(2, this.reconnectAttemptsUsed)));
    this.reconnectAttemptsUsed = attempt;

    this.warn('[PlayerNetworkManager] Reconnecting...', { attempt, delay });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.shouldReconnect) return;
      this.connect();
    }, delay);
  }

  private nextAckId(): string {
    const n = this.ackIdCounter++;
    return `ack_${Date.now()}_${n}`;
  }

  private sendReliable(payload: { type: string; [k: string]: unknown }): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const ackId = this.nextAckId();
    const messageType = String(payload.type ?? 'Unknown');
    const raw = JSON.stringify({ ...payload, ackId });

    try {
      ws.send(raw);
    } catch {
      return;
    }

    this.trackPendingAck({ ackId, raw, messageType });
  }

  private trackPendingAck(args: { ackId: string; raw: string; messageType: string }): void {
    if (!this.enableAck) return;
    // Replace any previous entry with the same ackId (shouldn't happen, but keep it safe).
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