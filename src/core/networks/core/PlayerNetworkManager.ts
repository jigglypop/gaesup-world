import { PlayerState } from '../types';

type PlayerNetworkLogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

export interface PlayerNetworkManagerOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
  logLevel?: PlayerNetworkLogLevel;
  logToConsole?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
  onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  onPlayerLeave?: (playerId: string) => void;
  onChat?: (playerId: string, text: string, timestamp: number) => void;
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
  private logLevel: PlayerNetworkLogLevel;
  private logToConsole: boolean;
  
  // 콜백 함수들
  private onConnect?: () => void;
  private onDisconnect?: () => void;
  private onWelcome?: (localPlayerId: string, roomState?: Record<string, PlayerState>) => void;
  private onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  private onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  private onPlayerLeave?: (playerId: string) => void;
  private onChat?: (playerId: string, text: string, timestamp: number) => void;
  private onError?: (error: string) => void;

  constructor(options: PlayerNetworkManagerOptions) {
    this.url = options.url;
    this.roomId = options.roomId;
    this.playerName = options.playerName;
    this.playerColor = options.playerColor;
    this.logLevel = options.logLevel ?? 'none';
    this.logToConsole = options.logToConsole ?? false;
    if (options.onConnect) this.onConnect = options.onConnect;
    if (options.onDisconnect) this.onDisconnect = options.onDisconnect;
    if (options.onWelcome) this.onWelcome = options.onWelcome;
    if (options.onPlayerJoin) this.onPlayerJoin = options.onPlayerJoin;
    if (options.onPlayerUpdate) this.onPlayerUpdate = options.onPlayerUpdate;
    if (options.onPlayerLeave) this.onPlayerLeave = options.onPlayerLeave;
    if (options.onChat) this.onChat = options.onChat;
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

    this.info('[PlayerNetworkManager] Connecting WebSocket', this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.info('[PlayerNetworkManager] WebSocket connected');
      this.isConnected = true;
      
      // Join 메시지 전송
      this.ws!.send(JSON.stringify({
        type: 'Join',
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor
      }));
      
      if (this.onConnect) {
        this.onConnect();
      }
    };

    this.ws.onmessage = (event) => {
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

    this.ws.onerror = (error) => {
      this.error('[PlayerNetworkManager] WebSocket error', error);
      this.isConnected = false;
      if (this.onError) {
        this.onError('WebSocket 연결 에러');
      }
    };

    this.ws.onclose = () => {
      this.info('[PlayerNetworkManager] WebSocket closed');
      this.isConnected = false;
      this.players.clear();
      if (this.onDisconnect) {
        this.onDisconnect();
      }
    };
  }

  disconnect(): void {
    if (!this.ws) {
      this.players.clear();
      this.isConnected = false;
      this.localPlayerId = null;
      this.onDisconnect?.();
      return;
    }

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'Leave' }));
        } catch {
          // ignore
        }
      }
      this.ws.close();
      this.ws = null;
    }
    this.players.clear();
    this.isConnected = false;
    this.localPlayerId = null;
  }

  updateLocalPlayer(state: Partial<PlayerState>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'Update',
      state
    }));
  }

  sendChat(text: string, options?: { range?: number }): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const safeText = String(text ?? '').trim().slice(0, 200);
    if (!safeText) return;

    const payload = {
      type: 'Chat',
      text: safeText,
      ...(options?.range !== undefined ? { range: options.range } : {}),
    };
    this.ws.send(JSON.stringify(payload));
  }

  private handleServerMessage(message: ServerMessage): void {
    this.debug('[PlayerNetworkManager] Server message', message.type, message);
    
    switch (message.type) {
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
            Object.assign(existingPlayer, message.state);
            this.onPlayerUpdate?.(message.client_id, existingPlayer);
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
    onError?: (error: string) => void;
  }): void {
    if (callbacks.onConnect) this.onConnect = callbacks.onConnect;
    if (callbacks.onDisconnect) this.onDisconnect = callbacks.onDisconnect;
    if (callbacks.onWelcome) this.onWelcome = callbacks.onWelcome;
    if (callbacks.onPlayerJoin) this.onPlayerJoin = callbacks.onPlayerJoin;
    if (callbacks.onPlayerUpdate) this.onPlayerUpdate = callbacks.onPlayerUpdate;
    if (callbacks.onPlayerLeave) this.onPlayerLeave = callbacks.onPlayerLeave;
    if (callbacks.onChat) this.onChat = callbacks.onChat;
    if (callbacks.onError) this.onError = callbacks.onError;
  }

  getPlayers(): Map<string, PlayerState> {
    return new Map(this.players);
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

type ServerMessage = WelcomeMessage | PlayerJoinedMessage | PlayerLeftMessage | PlayerUpdateMessage | ChatMessage;