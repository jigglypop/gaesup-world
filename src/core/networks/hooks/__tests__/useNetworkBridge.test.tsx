import { renderHook, act, waitFor } from '@testing-library/react';
import { useNetworkBridge } from '../useNetworkBridge';

// useFrame 모킹
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

// BridgeFactory 모킹
jest.mock('@core/boilerplate', () => ({
  BridgeFactory: {
    get: jest.fn(),
    create: jest.fn()
  }
}));

// NetworkBridge 모킹
const mockBridge = {
  execute: jest.fn(),
  snapshot: jest.fn(),
  getNetworkStats: jest.fn(),
  getSystemState: jest.fn(),
  updateSystem: jest.fn()
};

describe('useNetworkBridge', () => {
  let mockUseFrame: jest.Mock;
  let mockBridgeFactory: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 모킹된 모듈들 가져오기
    const fiber = require('@react-three/fiber');
    const boilerplate = require('@core/boilerplate');
    
    mockUseFrame = fiber.useFrame as jest.Mock;
    mockBridgeFactory = boilerplate.BridgeFactory;
    
    mockBridgeFactory.get.mockReturnValue(mockBridge);
    mockBridgeFactory.create.mockReturnValue(mockBridge);
    mockUseFrame.mockImplementation(() => {
      // 테스트에서는 콜백을 저장만 하고 호출하지 않음
    });
    
    mockBridge.snapshot.mockReturnValue({
      nodes: new Map(),
      connections: new Map(),
      groups: new Map(),
      messages: [],
      stats: { totalNodes: 0, totalConnections: 0, totalMessages: 0 },
      performance: { updateTime: 0, messageProcessingTime: 0, connectionProcessingTime: 0 },
      timestamp: Date.now()
    });
    
    mockBridge.getNetworkStats.mockReturnValue({
      totalNodes: 0,
      totalConnections: 0,
      totalMessages: 0
    });
    
    mockBridge.getSystemState.mockReturnValue({
      isRunning: false
    });
  });

  describe('기본 초기화', () => {
    test('기본 옵션으로 훅 초기화', async () => {
      const { result } = renderHook(() => useNetworkBridge());
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      expect(result.current.bridge).toBe(mockBridge);
      expect(mockBridgeFactory.get).toHaveBeenCalledWith('networks');
    });

    test('브릿지가 없을 때 새로 생성', async () => {
      mockBridgeFactory.get.mockReturnValueOnce(null);
      
      const { result } = renderHook(() => useNetworkBridge());
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      expect(mockBridgeFactory.get).toHaveBeenCalledWith('networks');
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('networks');
      expect(result.current.bridge).toBe(mockBridge);
    });

    test('사용자 정의 systemId 사용', async () => {
      const { result } = renderHook(() => 
        useNetworkBridge({ systemId: 'custom-system' })
      );
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });
  });

  describe('설정 적용', () => {
    test('초기 설정 적용', () => {
      const config = {
        updateFrequency: 60,
        maxConnections: 200,
        enableDebugPanel: true
      };

      renderHook(() => useNetworkBridge({ 
        systemId: 'test',
        config 
      }));
      
      expect(mockBridge.execute).toHaveBeenCalledWith('test', {
        type: 'updateConfig',
        data: { config }
      });
    });
  });

  describe('명령 실행', () => {
    test('executeCommand 호출', async () => {
      const { result } = renderHook(() => useNetworkBridge());
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      const command = {
        type: 'registerNPC' as const,
        data: {
          npcId: 'npc-1',
          position: { x: 0, y: 0, z: 0 },
          metadata: {}
        }
      };

      act(() => {
        result.current.executeCommand(command);
      });
      
      expect(mockBridge.execute).toHaveBeenCalledWith('main', command);
    });

    test('브릿지가 준비되지 않았을 때 명령 무시', () => {
      mockBridgeFactory.get.mockReturnValue(null);
      mockBridgeFactory.create.mockReturnValue(null);
      
      const { result } = renderHook(() => useNetworkBridge());
      
      const command = {
        type: 'registerNPC' as const,
        data: {
          npcId: 'npc-1',
          position: { x: 0, y: 0, z: 0 },
          metadata: {}
        }
      };

      act(() => {
        result.current.executeCommand(command);
      });
      
      expect(mockBridge.execute).not.toHaveBeenCalled();
    });
  });

  describe('시스템 업데이트', () => {
    test('updateSystem 호출', async () => {
      const { result } = renderHook(() => useNetworkBridge());
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      act(() => {
        result.current.updateSystem(0.016);
      });
      
      expect(mockBridge.updateSystem).toHaveBeenCalledWith('main', 0.016);
    });

    test('자동 업데이트 테스트', async () => {
      let frameCallback: any = null;
      mockUseFrame.mockImplementation((callback) => {
        frameCallback = callback;
      });
      
      const { result } = renderHook(() => 
        useNetworkBridge({ enableAutoUpdate: true })
      );
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      // useFrame 콜백이 등록되었는지 확인
      expect(mockUseFrame).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    test('브릿지 생성 실패 시 처리', () => {
      mockBridgeFactory.get.mockReturnValue(null);
      mockBridgeFactory.create.mockReturnValue(null);
      
      const { result } = renderHook(() => useNetworkBridge());
      
      expect(result.current.bridge).toBeNull();
      expect(result.current.isReady).toBe(false);
    });

    test('브릿지가 없을 때 안전한 호출', () => {
      mockBridgeFactory.get.mockReturnValue(null);
      mockBridgeFactory.create.mockReturnValue(null);
      
      const { result } = renderHook(() => useNetworkBridge());
      
      // 에러 없이 호출되어야 함
      expect(() => {
        result.current.executeCommand({ type: 'start', data: {} });
        result.current.getSnapshot();
        result.current.getNetworkStats();
        result.current.getSystemState();
        result.current.updateSystem(0.016);
      }).not.toThrow();
    });
  });
}); 