import React from 'react';
import { renderHook, act } from '@testing-library/react';
import * as THREE from 'three';
import { useBuildingEditor } from '../useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';

// THREE.js 모킹
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  
  const mockPlane = {
    normal: new originalThree.Vector3(0, 1, 0),
    constant: 0
  };

  const mockRay = {
    intersectPlane: jest.fn()
  };

  const mockRaycaster = {
    setFromCamera: jest.fn(),
    ray: mockRay
  };

  return {
    ...originalThree,
    Vector2: jest.fn((x = 0, y = 0) => ({ x, y })),
    Vector3: jest.fn((x = 0, y = 0, z = 0) => ({ x, y, z })),
    Plane: jest.fn(() => mockPlane),
    Raycaster: jest.fn(() => mockRaycaster)
  };
});

// @react-three/fiber 모킹
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(() => ({
    camera: {
      position: { x: 0, y: 10, z: 10 },
      rotation: { x: 0, y: 0, z: 0 }
    },
    raycaster: {
      setFromCamera: jest.fn(),
      ray: {
        // Match THREE.Ray.intersectPlane(plane, target): mutate target and return it.
        intersectPlane: jest.fn((_plane: any, target: any) => {
          if (target) {
            target.x = 10;
            target.y = 0;
            target.z = 15;
          }
          return target;
        })
      }
    }
  }))
}));

// BuildingStore 모킹
jest.mock('../../stores/buildingStore', () => {
  const useBuildingStore = jest.fn();
  (useBuildingStore as any).getState = jest.fn();
  return { useBuildingStore };
});

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;

describe('useBuildingEditor 훅 테스트', () => {
  let mockStore: any;
  let mockUseThree: any;

  beforeEach(() => {
    // 모킹된 스토어와 useThree 참조
    mockStore = useBuildingStore as jest.Mock;
    mockUseThree = require('@react-three/fiber').useThree;
    
    // 기본 모킹 설정
    mockStore.mockReturnValue({
      editMode: 'none',
      selectedWallGroupId: 'test-wall-group',
      selectedTileGroupId: 'test-tile-group',
      snapPosition: jest.fn((pos) => pos),
      addWall: jest.fn(),
      addTile: jest.fn(),
      removeWall: jest.fn(),
      removeTile: jest.fn(),
      setHoverPosition: jest.fn(),
    });

    // Zustand-style store API: useBuildingStore.getState()
    (mockStore as any).getState = jest.fn(() => ({
      currentWallRotation: 0,
      checkWallPosition: jest.fn(() => false),
      checkTilePosition: jest.fn(() => false),
      currentTileMultiplier: 1
    }));

    mockUseThree.mockReturnValue({
      camera: {
        position: { x: 0, y: 10, z: 10 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      raycaster: {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn(() => ({ x: 5, y: 0, z: 5 }))
        }
      }
    });

    // console.warn 모킹
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('훅 초기화', () => {
    test('useBuildingEditor가 올바르게 초기화되어야 함', () => {
      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      expect(result.current).toHaveProperty('updateMousePosition');
      expect(result.current).toHaveProperty('placeWall');
      expect(result.current).toHaveProperty('placeTile');
      expect(result.current).toHaveProperty('handleWallClick');
      expect(result.current).toHaveProperty('handleTileClick');
      expect(result.current).toHaveProperty('getGroundPosition');
    });

    test('모든 반환 함수가 함수 타입이어야 함', () => {
      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      expect(typeof result.current.updateMousePosition).toBe('function');
      expect(typeof result.current.placeWall).toBe('function');
      expect(typeof result.current.placeTile).toBe('function');
      expect(typeof result.current.handleWallClick).toBe('function');
      expect(typeof result.current.handleTileClick).toBe('function');
      expect(typeof result.current.getGroundPosition).toBe('function');
    });
  });

  describe('마우스 위치 업데이트', () => {
    test('마우스 이벤트가 올바르게 처리되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: jest.fn((pos) => ({ x: Math.round(pos.x), y: pos.y, z: Math.round(pos.z) }))
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const mockEvent = {
        target: {
          clientWidth: 800,
          clientHeight: 600
        },
        clientX: 400,
        clientY: 300
      } as any;

      act(() => {
        result.current.updateMousePosition(mockEvent);
      });

      expect(mockSetHoverPosition).toHaveBeenCalled();
    });

    test('편집 모드가 아닐 때 호버 위치가 null로 설정되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'none',
        setHoverPosition: mockSetHoverPosition
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const mockEvent = {
        target: {
          clientWidth: 800,
          clientHeight: 600
        },
        clientX: 400,
        clientY: 300
      } as any;

      act(() => {
        result.current.updateMousePosition(mockEvent);
      });

      expect(mockSetHoverPosition).toHaveBeenCalledWith(null);
    });

    test('벽 편집 모드에서 마우스 위치가 업데이트되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      const mockSnapPosition = jest.fn((pos) => pos);
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: mockSnapPosition
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const mockEvent = {
        target: {
          clientWidth: 800,
          clientHeight: 600
        },
        clientX: 400,
        clientY: 300
      } as any;

      act(() => {
        result.current.updateMousePosition(mockEvent);
      });

      expect(mockSnapPosition).toHaveBeenCalled();
      expect(mockSetHoverPosition).toHaveBeenCalled();
    });

    test('NPC 편집 모드에서 마우스 위치가 업데이트되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'npc',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: jest.fn((pos) => pos)
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const mockEvent = {
        target: {
          clientWidth: 800,
          clientHeight: 600
        },
        clientX: 400,
        clientY: 300
      } as any;

      act(() => {
        result.current.updateMousePosition(mockEvent);
      });

      expect(mockSetHoverPosition).toHaveBeenCalled();
    });
  });

  describe('지면 위치 계산', () => {
    test('레이캐스팅으로 지면 위치가 계산되어야 함', () => {
      const mockSnapPosition = jest.fn((pos) => pos);
      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn((_plane: any, target: any) => {
            if (target) {
              target.x = 10;
              target.y = 0;
              target.z = 15;
            }
            return target;
          })
        }
      };

      mockStore.mockReturnValue({
        ...mockStore(),
        snapPosition: mockSnapPosition
      });

      mockUseThree.mockReturnValue({
        camera: {},
        raycaster: mockRaycaster
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      let groundPosition: any;
      act(() => {
        groundPosition = result.current.getGroundPosition();
      });

      expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
      expect(mockRaycaster.ray.intersectPlane).toHaveBeenCalled();
      expect(mockSnapPosition).toHaveBeenCalledWith({
        x: 10,
        y: 0,
        z: 15
      });
      expect(groundPosition).toEqual({ x: 10, y: 0, z: 15 });
    });

    test('교차점이 없을 때 null이 반환되어야 함', () => {
      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn(() => null)
        }
      };

      mockUseThree.mockReturnValue({
        camera: {},
        raycaster: mockRaycaster
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      let groundPosition: any;
      act(() => {
        groundPosition = result.current.getGroundPosition();
      });

      expect(groundPosition).toBeNull();
    });
  });

  describe('벽 배치', () => {
    test('벽 편집 모드에서 벽이 올바르게 배치되어야 함', () => {
      const mockAddWall = jest.fn();
      const mockGetState = jest.fn(() => ({
        currentWallRotation: Math.PI / 2,
        checkWallPosition: jest.fn(() => false),
        checkTilePosition: jest.fn(() => false),
        currentTileMultiplier: 1
      }));

      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: mockAddWall,
        snapPosition: jest.fn((pos) => pos)
      });
      (mockStore as any).getState = mockGetState;

      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn((_plane: any, target: any) => {
            if (target) {
              target.x = 5;
              target.y = 0;
              target.z = 10;
            }
            return target;
          })
        }
      };

      mockUseThree.mockReturnValue({
        camera: {},
        raycaster: mockRaycaster
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeWall();
      });

      expect(mockAddWall).toHaveBeenCalledWith('test-wall-group', {
        id: expect.stringMatching(/^wall-\d+$/),
        position: { x: 5, y: 0, z: 10 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        wallGroupId: 'test-wall-group'
      });
    });

    test('벽 편집 모드가 아닐 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        addWall: mockAddWall
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeWall();
      });

      expect(mockAddWall).not.toHaveBeenCalled();
    });

    test('선택된 벽 그룹이 없을 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: null,
        addWall: mockAddWall
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeWall();
      });

      expect(mockAddWall).not.toHaveBeenCalled();
    });

    test('이미 벽이 있는 위치에 배치 시도 시 경고가 출력되어야 함', () => {
      const mockGetState = jest.fn(() => ({
        currentWallRotation: 0,
        checkWallPosition: jest.fn(() => true), // 충돌 발생
        checkTilePosition: jest.fn(() => false),
        currentTileMultiplier: 1
      }));

      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: jest.fn(),
        snapPosition: jest.fn((pos) => pos)
      });
      (mockStore as any).getState = mockGetState;

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeWall();
      });

      expect(console.warn).toHaveBeenCalledWith('Wall already exists at this position');
    });

    test('지면 위치를 얻을 수 없을 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn(() => null) // 교차점 없음
        }
      };

      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: mockAddWall
      });

      mockUseThree.mockReturnValue({
        camera: {},
        raycaster: mockRaycaster
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeWall();
      });

      expect(mockAddWall).not.toHaveBeenCalled();
    });
  });

  describe('타일 배치', () => {
    test('타일 편집 모드에서 타일이 올바르게 배치되어야 함', () => {
      const mockAddTile = jest.fn();
      const mockGetState = jest.fn(() => ({
        currentWallRotation: 0,
        checkWallPosition: jest.fn(() => false),
        checkTilePosition: jest.fn(() => false),
        currentTileMultiplier: 2
      }));

      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        addTile: mockAddTile,
        snapPosition: jest.fn((pos) => pos)
      });
      (mockStore as any).getState = mockGetState;

      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn((_plane: any, target: any) => {
            if (target) {
              target.x = 8;
              target.y = 0;
              target.z = 12;
            }
            return target;
          })
        }
      };

      mockUseThree.mockReturnValue({
        camera: {},
        raycaster: mockRaycaster
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeTile();
      });

      expect(mockAddTile).toHaveBeenCalledWith('test-tile-group', {
        id: expect.stringMatching(/^tile-\d+$/),
        position: { x: 8, y: 0, z: 12 },
        tileGroupId: 'test-tile-group',
        size: 2
      });
    });

    test('타일 편집 모드가 아닐 때 타일이 배치되지 않아야 함', () => {
      const mockAddTile = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        addTile: mockAddTile
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeTile();
      });

      expect(mockAddTile).not.toHaveBeenCalled();
    });

    test('선택된 타일 그룹이 없을 때 타일이 배치되지 않아야 함', () => {
      const mockAddTile = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedTileGroupId: null,
        addTile: mockAddTile
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeTile();
      });

      expect(mockAddTile).not.toHaveBeenCalled();
    });

    test('이미 타일이 있는 위치에 배치 시도 시 경고가 출력되어야 함', () => {
      const mockGetState = jest.fn(() => ({
        currentWallRotation: 0,
        checkWallPosition: jest.fn(() => false),
        checkTilePosition: jest.fn(() => true), // 충돌 발생
        currentTileMultiplier: 1
      }));

      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        addTile: jest.fn(),
        snapPosition: jest.fn((pos) => pos)
      });
      (mockStore as any).getState = mockGetState;

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.placeTile();
      });

      expect(console.warn).toHaveBeenCalledWith('Tile already exists at this position');
    });
  });

  describe('벽 클릭 처리', () => {
    test('벽 편집 모드에서 벽 클릭 시 벽이 제거되어야 함', () => {
      const mockRemoveWall = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        removeWall: mockRemoveWall
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleWallClick('wall-123');
      });

      expect(mockRemoveWall).toHaveBeenCalledWith('test-wall-group', 'wall-123');
    });

    test('벽 편집 모드가 아닐 때 벽 클릭 시 제거되지 않아야 함', () => {
      const mockRemoveWall = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedWallGroupId: 'test-wall-group',
        removeWall: mockRemoveWall
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleWallClick('wall-123');
      });

      expect(mockRemoveWall).not.toHaveBeenCalled();
    });

    test('선택된 벽 그룹이 없을 때 벽이 제거되지 않아야 함', () => {
      const mockRemoveWall = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedWallGroupId: null,
        removeWall: mockRemoveWall
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleWallClick('wall-123');
      });

      expect(mockRemoveWall).not.toHaveBeenCalled();
    });
  });

  describe('타일 클릭 처리', () => {
    test('타일 편집 모드에서 타일 클릭 시 타일이 제거되어야 함', () => {
      const mockRemoveTile = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        removeTile: mockRemoveTile
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleTileClick('tile-456');
      });

      expect(mockRemoveTile).toHaveBeenCalledWith('test-tile-group', 'tile-456');
    });

    test('타일 편집 모드가 아닐 때 타일 클릭 시 제거되지 않아야 함', () => {
      const mockRemoveTile = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall',
        selectedTileGroupId: 'test-tile-group',
        removeTile: mockRemoveTile
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleTileClick('tile-456');
      });

      expect(mockRemoveTile).not.toHaveBeenCalled();
    });

    test('선택된 타일 그룹이 없을 때 타일이 제거되지 않아야 함', () => {
      const mockRemoveTile = jest.fn();
      
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'tile',
        selectedTileGroupId: null,
        removeTile: mockRemoveTile
      });

      const { result } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.handleTileClick('tile-456');
      });

      expect(mockRemoveTile).not.toHaveBeenCalled();
    });
  });

  describe('의존성 배열 및 성능 최적화', () => {
    test('훅이 불필요하게 재생성되지 않아야 함', () => {
      const { result, rerender } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const firstRender = {
        updateMousePosition: result.current.updateMousePosition,
        placeWall: result.current.placeWall,
        placeTile: result.current.placeTile,
        handleWallClick: result.current.handleWallClick,
        handleTileClick: result.current.handleTileClick,
        getGroundPosition: result.current.getGroundPosition
      };

      // 컴포넌트 리렌더
      rerender();

      // 함수 참조가 동일해야 함 (useCallback으로 최적화됨)
      expect(result.current.updateMousePosition).toBe(firstRender.updateMousePosition);
      expect(result.current.placeWall).toBe(firstRender.placeWall);
      expect(result.current.placeTile).toBe(firstRender.placeTile);
      expect(result.current.handleWallClick).toBe(firstRender.handleWallClick);
      expect(result.current.handleTileClick).toBe(firstRender.handleTileClick);
      expect(result.current.getGroundPosition).toBe(firstRender.getGroundPosition);
    });

    test('store 상태 변경 시에만 관련 함수가 재생성되어야 함', () => {
      const { result, rerender } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const firstRender = result.current.placeWall;

      // editMode 변경
      mockStore.mockReturnValue({
        ...mockStore(),
        editMode: 'wall'
      });

      rerender();

      // 의존성이 변경되었으므로 함수가 재생성되어야 함
      expect(result.current.placeWall).not.toBe(firstRender);
    });
  });
}); 