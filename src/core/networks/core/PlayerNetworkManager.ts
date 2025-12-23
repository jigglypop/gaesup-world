import { PlayerState } from '../types';

export interface PlayerNetworkManagerOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  onPlayerLeave?: (playerId: string) => void;
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
  
  // 콜백 함수들
  private onConnect?: () => void;
  private onDisconnect?: () => void;
  private onPlayerJoin?: (playerId: string, state: PlayerState) => void;
  private onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
  private onPlayerLeave?: (playerId: string) => void;
  private onError?: (error: string) => void;

  constructor(options: PlayerNetworkManagerOptions) {
    this.url = options.url;
    this.roomId = options.roomId;
    this.playerName = options.playerName;
    this.playerColor = options.playerColor;
    this.onConnect = options.onConnect;
    this.onDisconnect = options.onDisconnect;
    this.onPlayerJoin = options.onPlayerJoin;
    this.onPlayerUpdate = options.onPlayerUpdate;
    this.onPlayerLeave = options.onPlayerLeave;
    this.onError = options.onError;
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('[PlayerNetworkManager] 이미 연결되어 있습니다.');
      return;
    }

    console.log('[PlayerNetworkManager] WebSocket 연결 시도:', this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[PlayerNetworkManager] WebSocket 연결 성공');
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
      const message = JSON.parse(event.data) as ServerMessage;
      this.handleServerMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('[PlayerNetworkManager] WebSocket 에러:', error);
      this.isConnected = false;
      if (this.onError) {
        this.onError('WebSocket 연결 에러');
      }
    };

    this.ws.onclose = () => {
      console.log('[PlayerNetworkManager] WebSocket 연결 종료');
      this.isConnected = false;
      this.players.clear();
      if (this.onDisconnect) {
        this.onDisconnect();
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.players.clear();
    this.isConnected = false;
    if (this.onDisconnect) {
      this.onDisconnect();
    }
  }

  updateLocalPlayer(state: Partial<PlayerState>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'Update',
      state
    }));
  }

  private handleServerMessage(message: ServerMessage): void {
    console.log('[PlayerNetworkManager] 서버 메시지 수신:', message.type, message);
    
    switch (message.type) {
      case 'Welcome':
        this.localPlayerId = message.client_id;
        console.log('[PlayerNetworkManager] 내 ID:', this.localPlayerId);
        console.log('[PlayerNetworkManager] 방 상태:', message.room_state);
        
        if (message.room_state) {
          for (const [id, state] of Object.entries(message.room_state)) {
            console.log('[PlayerNetworkManager] 방에 있는 플레이어:', id, state);
            if (id !== this.localPlayerId) {
              this.players.set(id, state);
              if (this.onPlayerJoin) {
                this.onPlayerJoin(id, state);
              }
            }
          }
          console.log('[PlayerNetworkManager] 현재 플레이어 수:', this.players.size);
        }
        break;

      case 'PlayerJoined':
        console.log('[PlayerNetworkManager] 플레이어 입장:', message.client_id, message.state);
        if (message.client_id !== this.localPlayerId) {
          this.players.set(message.client_id, message.state);
          if (this.onPlayerJoin) {
            this.onPlayerJoin(message.client_id, message.state);
          }
          console.log('[PlayerNetworkManager] 현재 플레이어 수:', this.players.size);
        }
        break;

      case 'PlayerLeft':
        console.log('[PlayerNetworkManager] 플레이어 퇴장:', message.client_id);
        this.players.delete(message.client_id);
        if (this.onPlayerLeave) {
          this.onPlayerLeave(message.client_id);
        }
        break;

      case 'PlayerUpdate':
        console.log('[PlayerNetworkManager] 플레이어 업데이트:', message.client_id, message.state);
        const existingPlayer = this.players.get(message.client_id);
        if (existingPlayer) {
          Object.assign(existingPlayer, message.state);
          if (this.onPlayerUpdate) {
            this.onPlayerUpdate(message.client_id, existingPlayer);
          }
        }
        break;
    }
  }

  setCallbacks(callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onPlayerJoin?: (playerId: string, state: PlayerState) => void;
    onPlayerUpdate?: (playerId: string, state: PlayerState) => void;
    onPlayerLeave?: (playerId: string) => void;
    onError?: (error: string) => void;
  }): void {
    if (callbacks.onConnect) this.onConnect = callbacks.onConnect;
    if (callbacks.onDisconnect) this.onDisconnect = callbacks.onDisconnect;
    if (callbacks.onPlayerJoin) this.onPlayerJoin = callbacks.onPlayerJoin;
    if (callbacks.onPlayerUpdate) this.onPlayerUpdate = callbacks.onPlayerUpdate;
    if (callbacks.onPlayerLeave) this.onPlayerLeave = callbacks.onPlayerLeave;
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

type ServerMessage = WelcomeMessage | PlayerJoinedMessage | PlayerLeftMessage | PlayerUpdateMessage;