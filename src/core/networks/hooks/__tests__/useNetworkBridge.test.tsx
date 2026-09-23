import { renderHook, act, waitFor } from '@testing-library/react';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import type { NetworkCommand } from '../../types';
import { useNetworkBridge } from '../useNetworkBridge';

// BridgeFactory 모킹
jest.mock('@core/boilerplate', () => ({
  BridgeFactory: {
    get: jest.fn(),
    create: jest.fn(),
    getOrCreate: jest.fn()
  }
}));

// NetworkBridge 모킹
const mockBridge = {
  ensureMainEngine: jest.fn(),
  getEngine: jest.fn(),
  register: jest.fn(),
  execute: jest.fn(),
  snapshot: jest.fn(),
  getNetworkStats: jest.fn(),
  getSystemState: jest.fn(),
  updateSystem: jest.fn(),
  acquireUpdates: jest.fn(() => jest.fn()),
  dispose: jest.fn()
};

const mockBridgeFactory = jest.mocked(BridgeFactory);

describe('useNetworkBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockBridgeFactory.getOrCreate.mockImplementation((domain: string) => {
      return mockBridgeFactory.get(domain) ?? mockBridgeFactory.create(domain);
    });
    mockBridgeFactory.get.mockReturnValue(mockBridge);
    mockBridgeFactory.create.mockReturnValue(mockBridge);
    
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
    test('초기 설정 적용', async () => {
      const config = {
        updateFrequency: 60,
        maxConnections: 200,
        enableDebugPanel: true
      };

      renderHook(() => useNetworkBridge({ 
        systemId: 'test',
        config 
      }));

      await waitFor(() => {
        expect(mockBridge.execute).toHaveBeenCalledWith('test', {
          type: 'updateConfig',
          data: { config }
        });
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
      
      const command: NetworkCommand = {
        type: 'registerNPC',
        npcId: 'npc-1',
        position: new THREE.Vector3(0, 0, 0)
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
      
      const command: NetworkCommand = {
        type: 'registerNPC',
        npcId: 'npc-1',
        position: new THREE.Vector3(0, 0, 0)
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
      const { result } = renderHook(() => 
        useNetworkBridge({ enableAutoUpdate: true })
      );
      
      // useEffect가 실행될 때까지 대기
      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
      
      expect(mockBridge.acquireUpdates).toHaveBeenCalledWith('main', expect.anything());
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
        result.current.executeCommand({ type: 'startMonitoring', npcId: 'npc-1' });
        result.current.getSnapshot();
        result.current.getNetworkStats();
        result.current.getSystemState();
        result.current.updateSystem(0.016);
      }).not.toThrow();
    });
  });
});
