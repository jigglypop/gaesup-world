# Networks Configuration

Networks 도메인의 실시간 NPC 네트워크 통신 시스템 설정입니다.

## 🌐 Network Performance Settings

### Update Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `updateFrequency` | number | 30 | 10-120 | 네트워크 업데이트 주기 (FPS) |
| `maxConnections` | number | 100 | 10-1000 | 최대 동시 연결 수 |
| `messageQueueSize` | number | 1000 | 100-10000 | 메시지 큐 최대 크기 |

### Optimization Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enableBatching` | boolean | true | - | 메시지 배치 처리 활성화 |
| `batchSize` | number | 10 | 1-100 | 배치당 메시지 수 |
| `compressionLevel` | number | 1 | 0-9 | 메시지 압축 레벨 (0=없음, 9=최대) |
| `connectionPoolSize` | number | 50 | 10-200 | 연결 풀 크기 |

## 📡 Communication Settings

### Distance & Range
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `maxDistance` | number | 100.0 | 10.0-1000.0 | 최대 통신 거리 |
| `signalStrength` | number | 1.0 | 0.1-10.0 | 신호 강도 배율 |
| `proximityRange` | number | 10.0 | 1.0-100.0 | 근접 통신 범위 |

### Quality Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `bandwidth` | number | 1000 | 100-10000 | 대역폭 (KB/s) |
| `latencySimulation` | number | 0 | 0-1000 | 지연시간 시뮬레이션 (ms) |
| `packetLoss` | number | 0.0 | 0.0-0.1 | 패킷 손실률 (0.0-10%) |

## 🔧 Message System Settings

### Message Types
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enableChatMessages` | boolean | true | - | 채팅 메시지 활성화 |
| `enableActionMessages` | boolean | true | - | 액션 메시지 활성화 |
| `enableStateMessages` | boolean | true | - | 상태 메시지 활성화 |
| `enableSystemMessages` | boolean | true | - | 시스템 메시지 활성화 |

### Priority System
| Priority | Queue Size | Processing Speed | Use Case |
|----------|------------|------------------|----------|
| `critical` | 50 | Immediate | 시스템 중요 메시지 |
| `high` | 100 | 1ms delay | 실시간 액션 |
| `normal` | 500 | 16ms delay | 일반 통신 |
| `low` | 1000 | 33ms delay | 배경 정보 |

### Reliability Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `reliableRetryCount` | number | 3 | 1-10 | 신뢰성 메시지 재시도 횟수 |
| `reliableTimeout` | number | 5000 | 1000-30000 | 신뢰성 메시지 타임아웃 (ms) |
| `enableAck` | boolean | true | - | 메시지 확인 응답 활성화 |

## 🎮 Group Communication Settings

### Group Types
| Group Type | Max Members | Range | Persistence |
|------------|-------------|-------|-------------|
| `party` | 8 | Unlimited | Session |
| `proximity` | 20 | 50.0 units | Dynamic |
| `broadcast` | 1000 | Unlimited | Temporary |
| `guild` | 100 | Unlimited | Persistent |

### Group Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `maxGroupSize` | number | 20 | 2-100 | 그룹 최대 크기 |
| `autoJoinProximity` | boolean | true | - | 근접 시 자동 그룹 참여 |
| `groupMessagePriority` | string | 'normal' | - | 그룹 메시지 기본 우선순위 |

## 🔍 Debug & Monitoring Settings

### Debug Panel
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enableDebugPanel` | boolean | false | - | 디버그 패널 표시 |
| `showConnectionLines` | boolean | false | - | 연결선 시각화 |
| `showMessageFlow` | boolean | false | - | 메시지 흐름 표시 |
| `debugUpdateInterval` | number | 500 | 100-2000 | 디버그 정보 업데이트 간격 (ms) |

### Visualizer Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enableVisualizer` | boolean | false | - | 네트워크 시각화 활성화 |
| `nodeSize` | number | 2.0 | 0.5-10.0 | 노드 크기 |
| `connectionWidth` | number | 1.0 | 0.1-5.0 | 연결선 두께 |
| `colorByStrength` | boolean | true | - | 신호 강도별 색상 구분 |

### Logging Settings
| Setting | Type | Default | Options | Description |
|---------|------|---------|---------|-------------|
| `logLevel` | string | 'warn' | 'none', 'error', 'warn', 'info', 'debug' | 로그 레벨 |
| `logToConsole` | boolean | true | - | 콘솔 로그 출력 |
| `logToFile` | boolean | false | - | 파일 로그 저장 |
| `maxLogEntries` | number | 1000 | 100-10000 | 최대 로그 항목 수 |

## ⚡ Performance Profiles

### High Performance Profile
```json
{
  "updateFrequency": 60,
  "maxConnections": 200,
  "enableBatching": true,
  "batchSize": 20,
  "compressionLevel": 3,
  "connectionPoolSize": 100
}
```

### Balanced Profile
```json
{
  "updateFrequency": 30,
  "maxConnections": 100,
  "enableBatching": true,
  "batchSize": 10,
  "compressionLevel": 1,
  "connectionPoolSize": 50
}
```

### Low Performance Profile
```json
{
  "updateFrequency": 15,
  "maxConnections": 50,
  "enableBatching": false,
  "batchSize": 5,
  "compressionLevel": 0,
  "connectionPoolSize": 25
}
```

## 🔧 Advanced Settings

### Memory Management
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `messageGCInterval` | number | 30000 | 5000-120000 | 메시지 가비지 컬렉션 간격 (ms) |
| `connectionTimeout` | number | 30000 | 5000-300000 | 연결 타임아웃 (ms) |
| `inactiveNodeCleanup` | number | 60000 | 10000-600000 | 비활성 노드 정리 간격 (ms) |

### Security Settings
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enableEncryption` | boolean | false | - | 메시지 암호화 활성화 |
| `enableRateLimit` | boolean | true | - | 요청 속도 제한 활성화 |
| `maxMessagesPerSecond` | number | 100 | 10-1000 | 초당 최대 메시지 수 |

### Experimental Features
| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `enablePrediction` | boolean | false | - | 네트워크 예측 활성화 |
| `enableCompression` | boolean | true | - | 실시간 압축 활성화 |
| `enableCaching` | boolean | true | - | 메시지 캐싱 활성화 |

## 📝 Configuration Examples

### Basic Setup
```typescript
const basicNetworkConfig: NetworkConfig = {
  // Performance
  updateFrequency: 30,
  maxConnections: 50,
  messageQueueSize: 500,
  
  // Communication
  maxDistance: 50.0,
  signalStrength: 1.0,
  bandwidth: 500,
  
  // Optimization
  enableBatching: true,
  compressionLevel: 1,
  connectionPoolSize: 25,
  
  // Debug
  enableDebugPanel: false,
  enableVisualizer: false,
  logLevel: 'warn'
};
```

### High-End Setup
```typescript
const highEndNetworkConfig: NetworkConfig = {
  // Performance
  updateFrequency: 60,
  maxConnections: 200,
  messageQueueSize: 2000,
  
  // Communication
  maxDistance: 100.0,
  signalStrength: 2.0,
  bandwidth: 2000,
  
  // Optimization
  enableBatching: true,
  compressionLevel: 3,
  connectionPoolSize: 100,
  
  // Debug
  enableDebugPanel: true,
  enableVisualizer: true,
  logLevel: 'info'
};
```

### Development Setup
```typescript
const devNetworkConfig: NetworkConfig = {
  // Performance (reduced for debug)
  updateFrequency: 15,
  maxConnections: 20,
  messageQueueSize: 200,
  
  // Communication
  maxDistance: 30.0,
  signalStrength: 1.0,
  bandwidth: 200,
  
  // Optimization (disabled for debugging)
  enableBatching: false,
  compressionLevel: 0,
  connectionPoolSize: 10,
  
  // Debug (full enabled)
  enableDebugPanel: true,
  enableVisualizer: true,
  logLevel: 'debug'
};
```

이 설정들을 통해 다양한 환경과 요구사항에 맞는 네트워크 성능을 조정할 수 있습니다. 