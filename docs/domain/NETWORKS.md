# Networks Domain Design

## 🌐 개요

Networks 도메인은 다수의 NPC 간 실시간 네트워크 통신을 관리하는 시스템입니다. 
고성능 ref 기반 업데이트와 FPS 조절을 통해 최적화된 네트워크 통신을 제공합니다.

## 🏗️ 아키텍처

### Layer 1: Core Engine
- **NetworkSystem**: 핵심 네트워크 통신 엔진
- **NPCNetworkManager**: NPC 간 통신 관리자
- **ConnectionPool**: 연결 풀 관리
- **MessageQueue**: 메시지 큐 처리

### Layer 2: Bridge & State
- **NetworkBridge**: Bridge 패턴 구현
- **NetworkConfigStore**: 네트워크 설정 관리
- **NetworkStateStore**: 실시간 네트워크 상태

### Layer 3: UI & Hooks
- **useNetworkConnection**: 네트워크 연결 훅
- **useNPCCommunication**: NPC 통신 훅
- **NetworkDebugPanel**: 네트워크 디버깅 패널

## 📁 디렉토리 구조

```
src/core/networks/
├── bridge/
│   ├── NetworkBridge.ts          # Bridge 패턴 구현
│   ├── types.ts                  # Bridge 타입 정의
│   └── index.ts
├── core/
│   ├── NetworkSystem.ts          # 핵심 네트워크 엔진
│   ├── NPCNetworkManager.ts      # NPC 통신 관리
│   ├── ConnectionPool.ts         # 연결 풀 관리
│   ├── MessageQueue.ts           # 메시지 큐 처리
│   ├── types.ts                  # Core 타입 정의
│   └── index.ts
├── components/
│   ├── NetworkDebugPanel/        # 네트워크 상태 디버깅
│   ├── NPCNetworkVisualizer/     # 네트워크 연결 시각화
│   └── index.ts
├── hooks/
│   ├── useNetworkConnection.ts   # 네트워크 연결 관리
│   ├── useNPCCommunication.ts    # NPC 통신 인터페이스
│   ├── useNetworkPerformance.ts  # 성능 모니터링
│   └── index.ts
├── stores/
│   ├── networkConfigStore.ts     # 네트워크 설정
│   ├── networkStateStore.ts      # 네트워크 상태
│   └── index.ts
├── types/
│   └── index.ts                  # 공통 타입 정의
└── index.ts
```

## 🔧 핵심 기능

### 1. 실시간 NPC 통신
- **Point-to-Point**: 개별 NPC 간 직접 통신
- **Broadcast**: 모든 NPC에게 메시지 전송
- **Group Communication**: 특정 그룹 내 NPC 통신
- **Proximity-based**: 거리 기반 통신

### 2. 성능 최적화
- **Ref-based Updates**: useRef를 활용한 고성능 업데이트
- **FPS Throttling**: 네트워크 업데이트 주기 조절
- **Message Batching**: 메시지 배치 처리
- **Connection Pooling**: 연결 재사용

### 3. 메시지 시스템
- **Message Queue**: 순서 보장된 메시지 큐
- **Priority System**: 우선순위 기반 메시지 처리
- **Reliability**: 메시지 전송 보장
- **Compression**: 메시지 압축

## 📊 타입 정의

### Core Types
```typescript
// NPC 네트워크 노드
interface NPCNetworkNode {
  id: string;
  npcId: string;
  position: Vector3;
  connections: Set<string>;
  messageQueue: NetworkMessage[];
  lastUpdate: number;
  status: 'active' | 'idle' | 'disconnected';
}

// 네트워크 메시지
interface NetworkMessage {
  id: string;
  from: string;
  to: string | 'broadcast' | 'group';
  type: 'chat' | 'action' | 'state' | 'system';
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: number;
  reliability: 'unreliable' | 'reliable';
}

// 연결 정보
interface NetworkConnection {
  id: string;
  nodeA: string;
  nodeB: string;
  strength: number;
  latency: number;
  bandwidth: number;
  status: 'establishing' | 'active' | 'unstable' | 'disconnected';
}
```

### Bridge Commands
```typescript
type NetworkCommand = 
  | { type: 'connect'; npcId: string; targetId: string }
  | { type: 'disconnect'; npcId: string; targetId?: string }
  | { type: 'sendMessage'; message: NetworkMessage }
  | { type: 'broadcast'; message: Omit<NetworkMessage, 'to'> }
  | { type: 'updateSettings'; settings: Partial<NetworkConfig> }
  | { type: 'startMonitoring'; npcId: string }
  | { type: 'stopMonitoring'; npcId: string };
```

## ⚙️ 설정 시스템

### NetworkConfig
```typescript
interface NetworkConfig {
  // 성능 설정
  maxConnections: number;           // 최대 연결 수
  updateFrequency: number;          // 업데이트 주기 (FPS)
  messageQueueSize: number;         // 메시지 큐 크기
  
  // 통신 설정
  maxDistance: number;              // 최대 통신 거리
  signalStrength: number;           // 신호 강도
  bandwidth: number;                // 대역폭
  
  // 최적화 설정
  enableBatching: boolean;          // 메시지 배치 처리
  compressionLevel: number;         // 압축 레벨
  connectionPoolSize: number;       // 연결 풀 크기
  
  // 디버깅 설정
  enableDebugPanel: boolean;        // 디버그 패널 표시
  enableVisualizer: boolean;        // 네트워크 시각화
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}
```

## 🚀 성능 최적화 전략

### 1. Ref-based Architecture
```typescript
// 고성능 네트워크 업데이트
const useNetworkOptimization = () => {
  const networkStateRef = useRef<NetworkState>();
  const lastUpdateRef = useRef(0);
  const frameCountRef = useRef(0);
  
  useFrame((state, delta) => {
    frameCountRef.current++;
    
    // FPS 조절: config에 따라 업데이트 주기 조절
    if (frameCountRef.current % config.updateFrequency !== 0) return;
    
    // Ref 기반 상태 업데이트
    updateNetworkState(networkStateRef.current, delta);
  });
};
```

### 2. 메시지 배치 처리
```typescript
// 메시지를 배치로 처리하여 성능 향상
class MessageBatcher {
  private batch: NetworkMessage[] = [];
  private batchSize = 10;
  private batchTimeout = 16; // ~60fps
  
  addMessage(message: NetworkMessage) {
    this.batch.push(message);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }
  
  private flush() {
    if (this.batch.length > 0) {
      this.processBatch(this.batch);
      this.batch = [];
    }
  }
}
```

### 3. 연결 풀링
```typescript
// 연결 재사용으로 오버헤드 감소
class ConnectionPool {
  private availableConnections: NetworkConnection[] = [];
  private activeConnections: Map<string, NetworkConnection> = new Map();
  
  getConnection(nodeA: string, nodeB: string): NetworkConnection {
    const available = this.availableConnections.pop();
    if (available) {
      available.nodeA = nodeA;
      available.nodeB = nodeB;
      return available;
    }
    
    return this.createNewConnection(nodeA, nodeB);
  }
  
  releaseConnection(connection: NetworkConnection) {
    this.resetConnection(connection);
    this.availableConnections.push(connection);
  }
}
```

## 🔄 NPC 도메인 연동

### 1. NPC 네트워크 확장
```typescript
// 기존 NPCInstance에 네트워크 기능 추가
interface NPCInstance {
  // ... 기존 속성들
  networkNode?: NPCNetworkNode;
  communicationRange?: number;
  networkEnabled?: boolean;
}
```

### 2. 통신 이벤트 시스템
```typescript
// NPCEvent에 네트워크 이벤트 추가
type NPCEventPayload = 
  | { type: 'dialogue'; text: string; duration?: number }
  | { type: 'animation'; animationId: string; loop?: boolean }
  | { type: 'sound'; soundUrl: string; volume?: number }
  | { type: 'network'; message: NetworkMessage }  // NEW
  | { type: 'custom'; data: unknown };
```

## 🎮 사용 예시

### 1. NPC 간 통신 설정
```typescript
const MyNPCComponent = ({ npcId }: { npcId: string }) => {
  const { sendMessage, connectTo, disconnect } = useNPCCommunication(npcId);
  
  // 다른 NPC와 연결
  const handleConnect = (targetId: string) => {
    connectTo(targetId);
  };
  
  // 메시지 전송
  const handleSendMessage = (targetId: string, message: string) => {
    sendMessage({
      to: targetId,
      type: 'chat',
      payload: { text: message },
      priority: 'normal',
      reliability: 'reliable'
    });
  };
  
  return (
    <mesh>
      {/* NPC 렌더링 */}
    </mesh>
  );
};
```

### 2. 네트워크 상태 모니터링
```typescript
const NetworkMonitor = () => {
  const { connectionCount, messageRate, latency } = useNetworkPerformance();
  const { config, updateConfig } = useNetworkConfigStore();
  
  return (
    <div className="network-monitor">
      <h3>Network Status</h3>
      <p>Connections: {connectionCount}</p>
      <p>Message Rate: {messageRate}/s</p>
      <p>Latency: {latency}ms</p>
      
      <button onClick={() => updateConfig({ updateFrequency: 30 })}>
        Set 30 FPS
      </button>
    </div>
  );
};
```

## 📈 구현 우선순위

### Phase 1: Core Infrastructure
1. **NetworkSystem**: 기본 네트워크 엔진
2. **MessageQueue**: 메시지 큐 시스템
3. **ConnectionPool**: 연결 관리

### Phase 2: Bridge & State
1. **NetworkBridge**: Bridge 패턴 구현
2. **NetworkConfigStore**: 설정 시스템
3. **NetworkStateStore**: 상태 관리

### Phase 3: React Integration
1. **useNetworkConnection**: 기본 네트워크 훅
2. **useNPCCommunication**: NPC 통신 훅
3. **Network Components**: 디버깅 컴포넌트

### Phase 4: Performance & Features
1. **성능 최적화**: Ref 기반 업데이트
2. **고급 기능**: 그룹 통신, 근접 통신
3. **시각화**: 네트워크 연결 시각화

## 🧪 테스트 전략

### 1. 단위 테스트
- NetworkSystem 로직 테스트
- MessageQueue 처리 테스트
- ConnectionPool 관리 테스트

### 2. 통합 테스트
- NPC 간 통신 시나리오
- 성능 부하 테스트
- 연결 안정성 테스트

### 3. 시각적 테스트
- 네트워크 연결 시각화
- 메시지 플로우 확인
- 성능 모니터링 UI

이 설계를 바탕으로 단계적으로 구현하여 안정적이고 고성능의 NPC 네트워크 시스템을 구축할 수 있습니다. 