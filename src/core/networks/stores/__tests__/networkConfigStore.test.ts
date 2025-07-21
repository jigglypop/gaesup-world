import { useNetworkConfigStore } from '../networkConfigStore';
import { NetworkConfig } from '../../types';

describe('NetworkConfigStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useNetworkConfigStore.getState().resetConfig();
  });

  describe('기본 설정', () => {
    test('초기 설정값 확인', () => {
      const { config } = useNetworkConfigStore.getState();
      
      // 성능 설정
      expect(config.updateFrequency).toBe(30);
      expect(config.maxConnections).toBe(100);
      expect(config.messageQueueSize).toBe(1000);
      
      // 통신 설정
      expect(config.maxDistance).toBe(100.0);
      expect(config.signalStrength).toBe(1.0);
      expect(config.bandwidth).toBe(1000);
      expect(config.proximityRange).toBe(10.0);
      
      // 최적화 설정
      expect(config.enableBatching).toBe(true);
      expect(config.batchSize).toBe(10);
      expect(config.compressionLevel).toBe(1);
      expect(config.connectionPoolSize).toBe(50);
      
      // 디버깅 설정
      expect(config.enableDebugPanel).toBe(false);
      expect(config.enableVisualizer).toBe(false);
      expect(config.logLevel).toBe('warn');
    });

    test('설정 초기화', () => {
      const store = useNetworkConfigStore.getState();
      // 설정 변경
      store.updateConfig({
        updateFrequency: 60,
        maxConnections: 200,
        enableDebugPanel: true
      });
      
      let config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(60);
      expect(config.maxConnections).toBe(200);
      expect(config.enableDebugPanel).toBe(true);
      
      // 초기화
      store.resetConfig();
      
      config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(30);
      expect(config.maxConnections).toBe(100);
      expect(config.enableDebugPanel).toBe(false);
    });
  });

  describe('설정 업데이트', () => {
    test('전체 설정 부분 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      const updates: Partial<NetworkConfig> = {
        updateFrequency: 45,
        maxConnections: 150,
        enableDebugPanel: true,
        logLevel: 'debug'
      };
      
      store.updateConfig(updates);
      
      // 업데이트 후 새로운 상태 가져오기
      const config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(45);
      expect(config.maxConnections).toBe(150);
      expect(config.enableDebugPanel).toBe(true);
      expect(config.logLevel).toBe('debug');
      
      // 다른 설정은 변경되지 않아야 함
      expect(config.bandwidth).toBe(1000);
      expect(config.batchSize).toBe(10);
    });

    test('성능 설정 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      store.updatePerformanceConfig({
        updateFrequency: 60,
        maxConnections: 200,
        messageQueueSize: 2000
      });
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(60);
      expect(config.maxConnections).toBe(200);
      expect(config.messageQueueSize).toBe(2000);
      
      // 다른 카테고리 설정은 변경되지 않아야 함
      expect(config.bandwidth).toBe(1000);
      expect(config.enableBatching).toBe(true);
    });

    test('통신 설정 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      store.updateCommunicationConfig({
        maxDistance: 150.0,
        signalStrength: 2.0,
        bandwidth: 2000,
        proximityRange: 25.0
      });
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.maxDistance).toBe(150.0);
      expect(config.signalStrength).toBe(2.0);
      expect(config.bandwidth).toBe(2000);
      expect(config.proximityRange).toBe(25.0);
      
      // 다른 카테고리 설정은 변경되지 않아야 함
      expect(config.updateFrequency).toBe(30);
      expect(config.enableBatching).toBe(true);
    });

    test('최적화 설정 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      store.updateOptimizationConfig({
        enableBatching: false,
        batchSize: 20,
        compressionLevel: 5,
        connectionPoolSize: 100
      });
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.enableBatching).toBe(false);
      expect(config.batchSize).toBe(20);
      expect(config.compressionLevel).toBe(5);
      expect(config.connectionPoolSize).toBe(100);
      
      // 다른 카테고리 설정은 변경되지 않아야 함
      expect(config.updateFrequency).toBe(30);
      expect(config.bandwidth).toBe(1000);
    });

    test('디버깅 설정 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      store.updateDebugConfig({
        enableDebugPanel: true,
        enableVisualizer: true,
        logLevel: 'debug',
        debugUpdateInterval: 100
      });
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.enableDebugPanel).toBe(true);
      expect(config.enableVisualizer).toBe(true);
      expect(config.logLevel).toBe('debug');
      expect(config.debugUpdateInterval).toBe(100);
      
      // 다른 카테고리 설정은 변경되지 않아야 함
      expect(config.updateFrequency).toBe(30);
      expect(config.enableBatching).toBe(true);
    });

    test('여러 번의 부분 업데이트', () => {
      const store = useNetworkConfigStore.getState();
      
      // 첫 번째 업데이트
      store.updateConfig({ updateFrequency: 45 });
      let config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(45);
      
      // 두 번째 업데이트
      store.updateConfig({ maxConnections: 150 });
      config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(45); // 이전 값 유지
      expect(config.maxConnections).toBe(150);
      
      // 세 번째 업데이트
      store.updateConfig({ 
        updateFrequency: 60, // 다시 변경
        enableDebugPanel: true 
      });
      config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(60);
      expect(config.maxConnections).toBe(150); // 이전 값 유지
      expect(config.enableDebugPanel).toBe(true);
    });
  });

  describe('성능 프로필', () => {
    test('고성능 프로필 적용', () => {
      const store = useNetworkConfigStore.getState();
      store.resetToProfile('high');
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(60);
      expect(config.maxConnections).toBe(200);
      expect(config.messageQueueSize).toBe(2000);
      expect(config.enableBatching).toBe(true);
      expect(config.batchSize).toBe(20);
      expect(config.compressionLevel).toBe(3);
      expect(config.connectionPoolSize).toBe(100);
      expect(config.bandwidth).toBe(2000);
      expect(config.signalStrength).toBe(2.0);
    });

    test('균형 프로필 적용', () => {
      const store = useNetworkConfigStore.getState();
      store.resetToProfile('balanced');
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(30);
      expect(config.maxConnections).toBe(100);
      expect(config.messageQueueSize).toBe(1000);
      expect(config.enableBatching).toBe(true);
      expect(config.batchSize).toBe(10);
      expect(config.compressionLevel).toBe(1);
      expect(config.connectionPoolSize).toBe(50);
      expect(config.bandwidth).toBe(1000);
      expect(config.signalStrength).toBe(1.0);
    });

    test('저성능 프로필 적용', () => {
      const store = useNetworkConfigStore.getState();
      store.resetToProfile('low');
      
      const config = useNetworkConfigStore.getState().config;
      expect(config.updateFrequency).toBe(15);
      expect(config.maxConnections).toBe(50);
      expect(config.messageQueueSize).toBe(500);
      expect(config.enableBatching).toBe(false);
      expect(config.batchSize).toBe(5);
      expect(config.compressionLevel).toBe(0);
      expect(config.connectionPoolSize).toBe(25);
      expect(config.bandwidth).toBe(500);
      expect(config.signalStrength).toBe(0.5);
    });

    test('프로필 적용 후 개별 설정 변경', () => {
      const store = useNetworkConfigStore.getState();
      store.resetToProfile('high');
      
      // 개별 설정 변경
      store.updateConfig({
        enableDebugPanel: true,
        logLevel: 'debug'
      });
      
      const config = useNetworkConfigStore.getState().config;
      // 프로필 값은 유지되고 개별 설정만 변경되어야 함
      expect(config.updateFrequency).toBe(60); // 프로필 값 유지
      expect(config.maxConnections).toBe(200); // 프로필 값 유지
      expect(config.enableDebugPanel).toBe(true); // 개별 설정
      expect(config.logLevel).toBe('debug'); // 개별 설정
    });
  });

  describe('설정 유효성 검사', () => {
    test('유효한 설정 검증', () => {
      const store = useNetworkConfigStore.getState();
      const validation = store.validateConfig();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('성능 설정 유효성 검사', () => {
      const store = useNetworkConfigStore.getState();
      // 잘못된 updateFrequency
      store.updateConfig({ updateFrequency: 0 });
      let validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('updateFrequency must be between 1 and 120');
      
      // 잘못된 maxConnections
      store.resetConfig();
      store.updateConfig({ maxConnections: -5 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('maxConnections must be greater than 0');
      
      // 잘못된 messageQueueSize
      store.resetConfig();
      store.updateConfig({ messageQueueSize: 0 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('messageQueueSize must be greater than 0');
    });

    test('통신 설정 유효성 검사', () => {
      const store = useNetworkConfigStore.getState();
      // 잘못된 maxDistance
      store.updateConfig({ maxDistance: -10 });
      let validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('maxDistance must be greater than 0');
      
      // 잘못된 signalStrength
      store.resetConfig();
      store.updateConfig({ signalStrength: 0 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('signalStrength must be greater than 0');
      
      // 잘못된 bandwidth
      store.resetConfig();
      store.updateConfig({ bandwidth: -100 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('bandwidth must be greater than 0');
    });

    test('최적화 설정 유효성 검사', () => {
      const store = useNetworkConfigStore.getState();
      // 잘못된 compressionLevel (범위 초과)
      store.updateConfig({ compressionLevel: 15 });
      let validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('compressionLevel must be between 0 and 9');
      
      // 잘못된 compressionLevel (음수)
      store.resetConfig();
      store.updateConfig({ compressionLevel: -1 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('compressionLevel must be between 0 and 9');
      
      // 잘못된 connectionPoolSize
      store.resetConfig();
      store.updateConfig({ connectionPoolSize: -5 });
      validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('connectionPoolSize must be non-negative');
    });

    test('여러 오류 동시 검출', () => {
      const store = useNetworkConfigStore.getState();
      store.updateConfig({
        updateFrequency: 200, // 범위 초과
        maxConnections: -10, // 음수
        compressionLevel: -5, // 범위 벗어남
        reliableTimeout: 0 // 0 이하
      });
      
      const validation = store.validateConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(1);
      expect(validation.errors).toContain('updateFrequency must be between 1 and 120');
      expect(validation.errors).toContain('maxConnections must be greater than 0');
      expect(validation.errors).toContain('compressionLevel must be between 0 and 9');
      expect(validation.errors).toContain('reliableTimeout must be greater than 0');
    });
  });

  describe('경계값 테스트', () => {
    test('updateFrequency 경계값', () => {
      const store = useNetworkConfigStore.getState();
      // 최소값
      store.updateConfig({ updateFrequency: 1 });
      expect(store.validateConfig().isValid).toBe(true);
      
      // 최대값
      store.updateConfig({ updateFrequency: 120 });
      expect(store.validateConfig().isValid).toBe(true);
      
      // 경계 밖
      store.updateConfig({ updateFrequency: 0 });
      expect(store.validateConfig().isValid).toBe(false);
      
      store.updateConfig({ updateFrequency: 121 });
      expect(store.validateConfig().isValid).toBe(false);
    });

    test('compressionLevel 경계값', () => {
      const store = useNetworkConfigStore.getState();
      // 최소값
      store.updateConfig({ compressionLevel: 0 });
      expect(store.validateConfig().isValid).toBe(true);
      
      // 최대값
      store.updateConfig({ compressionLevel: 9 });
      expect(store.validateConfig().isValid).toBe(true);
      
      // 경계 밖
      store.updateConfig({ compressionLevel: -1 });
      expect(store.validateConfig().isValid).toBe(false);
      
      store.updateConfig({ compressionLevel: 10 });
      expect(store.validateConfig().isValid).toBe(false);
    });

    test('connectionPoolSize 0값 허용', () => {
      const store = useNetworkConfigStore.getState();
      store.updateConfig({ connectionPoolSize: 0 });
      expect(store.validateConfig().isValid).toBe(true);
    });
  });

  describe('타입 안전성', () => {
    test('logLevel enum 값', () => {
      const store = useNetworkConfigStore.getState();
      const validLogLevels: NetworkConfig['logLevel'][] = ['none', 'error', 'warn', 'info', 'debug'];
      
      validLogLevels.forEach(level => {
        store.resetConfig(); // 각 테스트마다 초기화
        store.updateConfig({ logLevel: level });
        const config = useNetworkConfigStore.getState().config;
        expect(config.logLevel).toBe(level);
      });
    });

    test('groupMessagePriority enum 값', () => {
      const store = useNetworkConfigStore.getState();
      const validPriorities: NetworkConfig['groupMessagePriority'][] = ['low', 'normal', 'high', 'critical'];
      
      validPriorities.forEach(priority => {
        store.resetConfig(); // 각 테스트마다 초기화
        store.updateConfig({ groupMessagePriority: priority });
        const config = useNetworkConfigStore.getState().config;
        expect(config.groupMessagePriority).toBe(priority);
      });
    });

    test('boolean 설정값', () => {
      const store = useNetworkConfigStore.getState();
      const booleanConfigs = [
        'enableBatching',
        'enableChatMessages',
        'enableActionMessages',
        'enableStateMessages',
        'enableSystemMessages',
        'enableAck',
        'autoJoinProximity',
        'enableDebugPanel',
        'enableVisualizer',
        'showConnectionLines',
        'showMessageFlow',
        'logToConsole',
        'logToFile',
        'enableEncryption',
        'enableRateLimit'
      ];
      
      booleanConfigs.forEach(configKey => {
        store.resetConfig(); // 각 테스트마다 초기화
        
        store.updateConfig({ [configKey]: true });
        let config = useNetworkConfigStore.getState().config;
        expect(config[configKey as keyof NetworkConfig]).toBe(true);
        
        store.updateConfig({ [configKey]: false });
        config = useNetworkConfigStore.getState().config;
        expect(config[configKey as keyof NetworkConfig]).toBe(false);
      });
    });
  });
}); 