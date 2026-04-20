import React from 'react';
import { renderHook, act } from '@testing-library/react';
import * as THREE from 'three';
import { useBuildingEditor } from '../useBuildingEditor';
import { useBuildingStore } from '../../stores/buildingStore';

// THREE.js 모킹: 훅이 모듈 로드 시 즉시 Vector2/Vector3/Plane 인스턴스를 만든다.
// 따라서 .set 등 호출되는 메서드를 갖춘 stub 을 반환해야 한다.
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');

  const makeVec2 = (x = 0, y = 0) => {
    const v = { x, y, set(nx: number, ny: number) { v.x = nx; v.y = ny; return v; } };
    return v;
  };
  const makeVec3 = (x = 0, y = 0, z = 0) => {
    const v = { x, y, z, set(nx: number, ny: number, nz: number) { v.x = nx; v.y = ny; v.z = nz; return v; } };
    return v;
  };

  return {
    ...originalThree,
    Vector2: jest.fn((x?: number, y?: number) => makeVec2(x, y)),
    Vector3: jest.fn((x?: number, y?: number, z?: number) => makeVec3(x, y, z)),
    Plane: jest.fn((normal?: unknown, constant = 0) => ({
      normal: normal ?? makeVec3(0, 1, 0),
      constant,
    })),
    Raycaster: jest.fn(() => ({
      setFromCamera: jest.fn(),
      ray: { intersectPlane: jest.fn() },
    })),
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

// 훅이 selector 패턴(useBuildingStore(s => s.x))과 getState 호출을 모두 사용하므로
// mock도 두 경로를 동일한 state로 일관성 있게 제공해야 한다.
type EditorMockState = Record<string, unknown>;

const buildDefaultState = (): EditorMockState => ({
  // selector로 읽히는 항목
  editMode: 'none',
  selectedWallGroupId: 'test-wall-group',
  selectedTileGroupId: 'test-tile-group',
  snapPosition: jest.fn((pos: unknown) => pos),
  addWall: jest.fn(),
  addTile: jest.fn(),
  addObject: jest.fn(),
  removeWall: jest.fn(),
  removeTile: jest.fn(),
  setHoverPosition: jest.fn(),
  // getState로 읽히는 항목
  currentWallRotation: 0,
  currentTileMultiplier: 1,
  currentTileHeight: 0,
  currentTileShape: 'box',
  currentTileRotation: 0,
  hoverPosition: { x: 0, y: 0, z: 0 },
  checkWallPosition: jest.fn(() => false),
  checkTilePosition: jest.fn(() => false),
  getSupportHeightAt: jest.fn(() => 0),
  selectedPlacedObjectType: 'none',
  tileGroups: new Map(),
  currentObjectRotation: 0,
  currentObjectPrimaryColor: '#ffffff',
  currentObjectSecondaryColor: '#000000',
  currentFlagWidth: 1,
  currentFlagHeight: 1,
  currentFlagStyle: 'flag',
  currentFlagImageUrl: '',
  currentFireIntensity: 1.5,
  currentFireWidth: 1,
  currentFireHeight: 1.5,
  currentFireColor: '#ff6622',
  currentBillboardText: '',
  currentBillboardColor: '#ffffff',
  currentBillboardImageUrl: '',
});

describe('useBuildingEditor 훅 테스트', () => {
  let mockStore: jest.Mock & { getState: jest.Mock };
  let mockUseThree: jest.Mock;
  let currentState: EditorMockState;

  const setStoreState = (overrides: EditorMockState = {}) => {
    currentState = { ...currentState, ...overrides };
    mockStore.mockImplementation((selector?: (s: unknown) => unknown) =>
      typeof selector === 'function' ? selector(currentState) : currentState
    );
    mockStore.getState.mockImplementation(() => currentState);
  };

  beforeEach(() => {
    mockStore = useBuildingStore as unknown as jest.Mock & { getState: jest.Mock };
    mockUseThree = require('@react-three/fiber').useThree;

    currentState = buildDefaultState();
    setStoreState();

    mockUseThree.mockReturnValue({
      camera: {
        position: { x: 0, y: 10, z: 10 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      raycaster: {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn((_plane: unknown, target: { x: number; y: number; z: number }) => {
            if (target) {
              target.x = 5;
              target.y = 0;
              target.z = 5;
            }
            return target;
          })
        }
      }
    });

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
    const mouseEvent = {
      target: { clientWidth: 800, clientHeight: 600 },
      clientX: 400,
      clientY: 300,
    } as unknown as MouseEvent;

    test('마우스 이벤트가 올바르게 처리되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      setStoreState({
        editMode: 'tile',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: jest.fn((pos: { x: number; y: number; z: number }) => ({
          x: Math.round(pos.x), y: pos.y, z: Math.round(pos.z),
        })),
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.updateMousePosition(mouseEvent); });

      expect(mockSetHoverPosition).toHaveBeenCalled();
    });

    test('편집 모드가 아닐 때 호버 위치가 null로 설정되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      setStoreState({ editMode: 'none', setHoverPosition: mockSetHoverPosition });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.updateMousePosition(mouseEvent); });

      expect(mockSetHoverPosition).toHaveBeenCalledWith(null);
    });

    test('벽 편집 모드에서 마우스 위치가 업데이트되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      const mockSnapPosition = jest.fn((pos: unknown) => pos);
      setStoreState({
        editMode: 'wall',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: mockSnapPosition,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.updateMousePosition(mouseEvent); });

      expect(mockSnapPosition).toHaveBeenCalled();
      expect(mockSetHoverPosition).toHaveBeenCalled();
    });

    test('NPC 편집 모드에서 마우스 위치가 업데이트되어야 함', () => {
      const mockSetHoverPosition = jest.fn();
      setStoreState({
        editMode: 'npc',
        setHoverPosition: mockSetHoverPosition,
        snapPosition: jest.fn((pos: unknown) => pos),
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.updateMousePosition(mouseEvent); });

      expect(mockSetHoverPosition).toHaveBeenCalled();
    });
  });

  describe('지면 위치 계산', () => {
    test('레이캐스팅으로 지면 위치가 계산되어야 함', () => {
      const mockSnapPosition = jest.fn((pos: unknown) => pos);
      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: {
          intersectPlane: jest.fn((_plane: unknown, target: { x: number; y: number; z: number }) => {
            if (target) {
              target.x = 10;
              target.y = 0;
              target.z = 15;
            }
            return target;
          })
        }
      };

      setStoreState({ snapPosition: mockSnapPosition });
      mockUseThree.mockReturnValue({ camera: {}, raycaster: mockRaycaster });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });

      let groundPosition: unknown;
      act(() => { groundPosition = result.current.getGroundPosition(); });

      expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
      expect(mockRaycaster.ray.intersectPlane).toHaveBeenCalled();
      expect(mockSnapPosition).toHaveBeenCalledWith({ x: 10, y: 0, z: 15 });
      expect(groundPosition).toEqual({ x: 10, y: 0, z: 15 });
    });

    test('교차점이 없을 때 null이 반환되어야 함', () => {
      const mockRaycaster = {
        setFromCamera: jest.fn(),
        ray: { intersectPlane: jest.fn(() => null) }
      };

      mockUseThree.mockReturnValue({ camera: {}, raycaster: mockRaycaster });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });

      let groundPosition: unknown;
      act(() => { groundPosition = result.current.getGroundPosition(); });

      expect(groundPosition).toBeNull();
    });
  });

  describe('벽 배치', () => {
    test('벽 편집 모드에서 벽이 올바르게 배치되어야 함', () => {
      const mockAddWall = jest.fn();
      const hoverPosition = { x: 5, y: 0, z: 10 };
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: mockAddWall,
        snapPosition: jest.fn((pos: unknown) => pos),
        currentWallRotation: Math.PI / 2,
        checkWallPosition: jest.fn(() => false),
        hoverPosition,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeWall(); });

      expect(mockAddWall).toHaveBeenCalledWith('test-wall-group', expect.objectContaining({
        id: expect.stringMatching(/^wall-\d+-\d+$/),
        position: hoverPosition,
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        wallGroupId: 'test-wall-group',
      }));
    });

    test('벽 편집 모드가 아닐 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      setStoreState({ editMode: 'tile', addWall: mockAddWall });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeWall(); });

      expect(mockAddWall).not.toHaveBeenCalled();
    });

    test('선택된 벽 그룹이 없을 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: null,
        addWall: mockAddWall,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeWall(); });

      expect(mockAddWall).not.toHaveBeenCalled();
    });

    test('이미 벽이 있는 위치에 배치 시도 시 새 벽이 추가되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: mockAddWall,
        snapPosition: jest.fn((pos: unknown) => pos),
        checkWallPosition: jest.fn(() => true),
        hoverPosition: { x: 0, y: 0, z: 0 },
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeWall(); });

      expect(mockAddWall).not.toHaveBeenCalled();
    });

    test('호버 위치가 없을 때 벽이 배치되지 않아야 함', () => {
      const mockAddWall = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        addWall: mockAddWall,
        hoverPosition: null,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeWall(); });

      expect(mockAddWall).not.toHaveBeenCalled();
    });
  });

  describe('타일 배치', () => {
    test('타일 편집 모드에서 타일이 올바르게 배치되어야 함', () => {
      const mockAddTile = jest.fn();
      const hoverPosition = { x: 8, y: 0, z: 12 };
      setStoreState({
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        addTile: mockAddTile,
        snapPosition: jest.fn((pos: unknown) => pos),
        currentTileMultiplier: 2,
        currentTileHeight: 0,
        currentTileShape: 'box',
        currentTileRotation: 0,
        checkTilePosition: jest.fn(() => false),
        hoverPosition,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeTile(); });

      expect(mockAddTile).toHaveBeenCalledWith('test-tile-group', expect.objectContaining({
        id: expect.stringMatching(/^tile-\d+-\d+$/),
        position: expect.objectContaining({ x: 8, z: 12 }),
        tileGroupId: 'test-tile-group',
        size: 2,
        shape: 'box',
        rotation: 0,
      }));
    });

    test('타일 편집 모드가 아닐 때 타일이 배치되지 않아야 함', () => {
      const mockAddTile = jest.fn();
      setStoreState({ editMode: 'wall', addTile: mockAddTile });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeTile(); });

      expect(mockAddTile).not.toHaveBeenCalled();
    });

    test('선택된 타일 그룹이 없을 때 타일이 배치되지 않아야 함', () => {
      const mockAddTile = jest.fn();
      setStoreState({
        editMode: 'tile',
        selectedTileGroupId: null,
        addTile: mockAddTile,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeTile(); });

      expect(mockAddTile).not.toHaveBeenCalled();
    });

    test('이미 타일이 있는 위치에 배치 시도 시 새 타일이 추가되지 않아야 함', () => {
      const mockAddTile = jest.fn();
      setStoreState({
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        addTile: mockAddTile,
        snapPosition: jest.fn((pos: unknown) => pos),
        checkTilePosition: jest.fn(() => true),
        hoverPosition: { x: 0, y: 0, z: 0 },
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.placeTile(); });

      expect(mockAddTile).not.toHaveBeenCalled();
    });
  });

  describe('벽 클릭 처리', () => {
    test('벽 편집 모드에서 벽 클릭 시 벽이 제거되어야 함', () => {
      const mockRemoveWall = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: 'test-wall-group',
        removeWall: mockRemoveWall,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleWallClick('wall-123'); });

      expect(mockRemoveWall).toHaveBeenCalledWith('test-wall-group', 'wall-123');
    });

    test('벽 편집 모드가 아닐 때 벽 클릭 시 제거되지 않아야 함', () => {
      const mockRemoveWall = jest.fn();
      setStoreState({
        editMode: 'tile',
        selectedWallGroupId: 'test-wall-group',
        removeWall: mockRemoveWall,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleWallClick('wall-123'); });

      expect(mockRemoveWall).not.toHaveBeenCalled();
    });

    test('선택된 벽 그룹이 없을 때 벽이 제거되지 않아야 함', () => {
      const mockRemoveWall = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedWallGroupId: null,
        removeWall: mockRemoveWall,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleWallClick('wall-123'); });

      expect(mockRemoveWall).not.toHaveBeenCalled();
    });
  });

  describe('타일 클릭 처리', () => {
    test('타일 편집 모드에서 타일 클릭 시 타일이 제거되어야 함', () => {
      const mockRemoveTile = jest.fn();
      setStoreState({
        editMode: 'tile',
        selectedTileGroupId: 'test-tile-group',
        removeTile: mockRemoveTile,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleTileClick('tile-456'); });

      expect(mockRemoveTile).toHaveBeenCalledWith('test-tile-group', 'tile-456');
    });

    test('타일 편집 모드가 아닐 때 타일 클릭 시 제거되지 않아야 함', () => {
      const mockRemoveTile = jest.fn();
      setStoreState({
        editMode: 'wall',
        selectedTileGroupId: 'test-tile-group',
        removeTile: mockRemoveTile,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleTileClick('tile-456'); });

      expect(mockRemoveTile).not.toHaveBeenCalled();
    });

    test('선택된 타일 그룹이 없을 때 타일이 제거되지 않아야 함', () => {
      const mockRemoveTile = jest.fn();
      setStoreState({
        editMode: 'tile',
        selectedTileGroupId: null,
        removeTile: mockRemoveTile,
      });

      const { result } = renderHook(() => useBuildingEditor(), { wrapper: TestWrapper });
      act(() => { result.current.handleTileClick('tile-456'); });

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

    test('의존성으로 사용된 store 함수가 변경되면 콜백도 재생성되어야 함', () => {
      const { result, rerender } = renderHook(() => useBuildingEditor(), {
        wrapper: TestWrapper
      });

      const firstPlaceWall = result.current.placeWall;
      // placeWall 의 의존성은 addWall — 이 함수 참조가 바뀌면 재생성되어야 한다.
      setStoreState({ addWall: jest.fn() });
      rerender();

      expect(result.current.placeWall).not.toBe(firstPlaceWall);
    });
  });
}); 