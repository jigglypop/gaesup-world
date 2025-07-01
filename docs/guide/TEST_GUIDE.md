# 테스트 가이드 (Testing Guide)

이 문서는 `gaesup-world` 프로젝트의 코드 품질과 안정성을 보장하기 위한 테스트 전략과 작성 가이드를 제공합니다.

---

## 1. 테스트 기본 원칙

1.  **테스트는 필수**: 새로운 기능 추가나 리팩토링 시에는 반드시 관련 테스트 코드를 작성하거나 기존 테스트를 업데이트해야 합니다.
2.  **명확하고 독립적인 테스트**: 각 `it` 또는 `test` 블록은 하나의 기능만 검증해야 하며, 다른 테스트에 영향을 주어서는 안 됩니다. `beforeEach`를 사용하여 각 테스트 전에 상태를 초기화하는 것을 권장합니다.
3.  **Core 로직 우선**: 순수 로직(1-layer)에 대한 견고한 유닛 테스트는 안정적인 시스템의 기반이 됩니다. 복잡한 UI 테스트보다 핵심 로직 테스트에 우선순위를 둡니다.

---

## 2. 테스트 유형별 전략

### 2.1. 유닛 테스트 (Unit Tests)

-   **대상**: 순수 클래스, 유틸리티 함수 등 의존성이 없거나 적은 로직 (주로 1-layer).
-   **목표**: 특정 함수나 메서드가 주어진 입력에 대해 기대하는 출력을 반환하는지 검증합니다.
-   **도구**: `jest`
-   **예시**: `AnimationEngine.ts`, `fsmCompiler.ts`

### 2.2. 훅/컴포넌트 테스트 (Hook/Component Tests)

-   **대상**: React 훅, UI 컴포넌트 등 React의 생명주기와 상태에 의존하는 코드 (주로 2, 3-layer).
-   **목표**: 컴포넌트가 올바르게 렌더링되고, 사용자의 상호작용(클릭, 입력)에 따라 상태와 UI가 예상대로 변경되는지 검증합니다.
-   **도구**: `jest`, `@testing-library/react`
-   **예시**: `useAnimationBridge.ts`, `AnimationDebugPanel.tsx`

---

## 3. 테스트 작성 가이드

### 3.1. 파일 위치 및 이름

-   테스트 파일은 테스트 대상 파일과 동일한 디렉토리 내의 `__tests__` 폴더에 위치시킵니다.
-   파일 이름은 `[대상파일].test.ts` 또는 `[대상파일].test.tsx` 형식으로 작성합니다.

```
/src/core/animation/core/
├── AnimationEngine.ts
└── __tests__/
    └── AnimationEngine.test.ts
```

### 3.2. 유닛 테스트 작성 예시 (`AnimationEngine.test.ts`)

순수 클래스를 테스트할 때는 `jest.mock`을 사용하여 외부 의존성(e.g., `three.js`)을 모방(mocking)합니다.

```typescript
import { AnimationEngine } from '../AnimationEngine';
import * as THREE from 'three';

// 1. 외부 의존성 모킹
jest.mock('three', () => { /* ... mock implementation ... */ });

describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let mockAction: THREE.AnimationAction;

  // 2. 각 테스트 전 상태 초기화
  beforeEach(() => {
    engine = new AnimationEngine();
    // ... mock 객체 설정 ...
  });

  // 3. 테스트 후 mock 정리
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 4. 명확한 테스트 케이스 작성
  it('should play an animation when playAnimation is called', () => {
    // 준비 (Arrange)
    engine.registerAction('walk', mockAction);

    // 실행 (Act)
    engine.playAnimation('walk');

    // 단언 (Assert)
    expect(engine.getCurrentAnimation()).toBe('walk');
    expect(engine.getState().isPlaying).toBe(true);
    expect(mockAction.play).toHaveBeenCalledTimes(1);
  });
});
```

### 3.3. 훅 테스트 작성 예시 (가안)

`@testing-library/react`의 `renderHook`을 사용하여 훅의 반환값과 상태 변화를 테스트합니다.

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter'; // 테스트 대상 훅

describe('useCounter', () => {
  it('should increment the counter', () => {
    // 1. 훅 렌더링
    const { result } = renderHook(() => useCounter());

    // 2. act()를 사용하여 상태 변경 함수 실행
    act(() => {
      result.current.increment();
    });

    // 3. 변경된 상태 단언
    expect(result.current.count).toBe(1);
  });
});
```

---

## 4. 테스트 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 모든 테스트를 실행할 수 있습니다.

```bash
# 테스트 코드 작성 가이드

## 1. 테스트 철학

### 1.1 기본 원칙
- 테스트는 코드의 동작을 검증하는 문서 역할을 합니다
- 모든 핵심 로직은 반드시 테스트되어야 합니다
- 테스트는 독립적이고 격리되어야 합니다
- 테스트 코드도 프로덕션 코드와 동일한 품질 기준을 적용합니다

### 1.2 테스트 우선순위
1. **Layer 1 (Core Engine)**: 100% 테스트 커버리지 목표
2. **Layer 2 (Controllers, Hooks, Stores)**: 핵심 로직 중심 테스트
3. **Layer 3 (Components)**: 중요한 인터랙션과 렌더링 테스트

## 2. 테스트 구조

### 2.1 파일 구조
```
/src/core/domain/
├── core/
│   ├── Engine.ts
│   └── __tests__/
│       └── Engine.test.ts
├── hooks/
│   ├── useFeature.ts
│   └── __tests__/
│       └── useFeature.test.ts
└── components/
    ├── Feature/
    │   ├── index.tsx
    │   └── __tests__/
    │       └── Feature.test.tsx
```

### 2.2 네이밍 규칙
- 테스트 파일: `[대상파일명].test.ts(x)`
- 테스트 스위트: `describe('[클래스/함수명]', () => {})`
- 테스트 케이스: `it('should [동작 설명]', () => {})`

## 3. 레이어별 테스트 전략

### 3.1 Layer 1 (Core Engine) 테스트
```typescript
describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let mockMixer: jest.Mocked<THREE.AnimationMixer>;

  beforeEach(() => {
    mockMixer = {
      clipAction: jest.fn(),
      update: jest.fn(),
      stopAllAction: jest.fn(),
    } as unknown as jest.Mocked<THREE.AnimationMixer>;
    
    engine = new AnimationEngine(mockMixer);
  });

  afterEach(() => {
    engine.dispose();
  });

  it('should register animation action', () => {
    const mockAction = {} as THREE.AnimationAction;
    engine.registerAction('walk', mockAction);
    
    expect(engine.getAnimationList()).toContain('walk');
  });

  it('should play animation with correct parameters', () => {
    const mockAction = {
      reset: jest.fn().mockReturnThis(),
      fadeIn: jest.fn().mockReturnThis(),
      play: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<THREE.AnimationAction>;
    
    engine.registerAction('walk', mockAction);
    engine.playAnimation('walk', { fadeInDuration: 0.5 });
    
    expect(mockAction.reset).toHaveBeenCalled();
    expect(mockAction.fadeIn).toHaveBeenCalledWith(0.5);
    expect(mockAction.play).toHaveBeenCalled();
  });
});
```

### 3.2 Layer 2 (Hooks/Stores) 테스트
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAnimationBridge } from '../useAnimationBridge';

describe('useAnimationBridge', () => {
  it('should initialize bridge on mount', () => {
    const { result } = renderHook(() => useAnimationBridge());
    
    expect(result.current.bridge).toBeDefined();
  });

  it('should execute commands correctly', () => {
    const { result } = renderHook(() => useAnimationBridge());
    
    act(() => {
      result.current.playAnimation('character', 'walk');
    });
    
    const snapshot = result.current.getSnapshot('character');
    expect(snapshot.currentAnimation).toBe('walk');
  });

  it('should clean up on unmount', () => {
    const { result, unmount } = renderHook(() => useAnimationBridge());
    const disposeSpy = jest.spyOn(result.current.bridge, 'dispose');
    
    unmount();
    
    expect(disposeSpy).toHaveBeenCalled();
  });
});
```

### 3.3 Layer 3 (Components) 테스트
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimationController } from '../AnimationController';

describe('AnimationController', () => {
  const mockOnPlay = jest.fn();
  const mockOnStop = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render animation list', () => {
    render(
      <AnimationController
        animations={['idle', 'walk', 'run']}
        currentAnimation="idle"
        onPlay={mockOnPlay}
        onStop={mockOnStop}
      />
    );
    
    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(screen.getByText('walk')).toBeInTheDocument();
    expect(screen.getByText('run')).toBeInTheDocument();
  });

  it('should call onPlay when animation is selected', () => {
    render(
      <AnimationController
        animations={['idle', 'walk']}
        currentAnimation="idle"
        onPlay={mockOnPlay}
        onStop={mockOnStop}
      />
    );
    
    fireEvent.click(screen.getByText('walk'));
    
    expect(mockOnPlay).toHaveBeenCalledWith('walk');
  });
});
```

## 4. 모킹 전략

### 4.1 Three.js 객체 모킹
```typescript
export const createMockVector3 = (x = 0, y = 0, z = 0) => ({
  x, y, z,
  set: jest.fn().mockReturnThis(),
  copy: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
  sub: jest.fn().mockReturnThis(),
  multiplyScalar: jest.fn().mockReturnThis(),
  normalize: jest.fn().mockReturnThis(),
  distanceTo: jest.fn().mockReturnValue(0),
  length: jest.fn().mockReturnValue(0),
});

export const createMockQuaternion = () => ({
  x: 0, y: 0, z: 0, w: 1,
  setFromAxisAngle: jest.fn().mockReturnThis(),
  multiply: jest.fn().mockReturnThis(),
  slerp: jest.fn().mockReturnThis(),
});
```

### 4.2 Store 모킹
```typescript
import { useGaesupStore } from '@/core/stores';

jest.mock('@/core/stores', () => ({
  useGaesupStore: jest.fn(),
}));

const mockStore = {
  mode: { type: 'normal' },
  activeState: { isActive: true },
  block: { forward: false },
  setMode: jest.fn(),
  setActiveState: jest.fn(),
};

(useGaesupStore as jest.Mock).mockReturnValue(mockStore);
```

## 5. 테스트 도구

### 5.1 기본 도구
- **Jest**: 테스트 프레임워크
- **Testing Library**: React 컴포넌트 테스트
- **jest-canvas-mock**: Canvas API 모킹

### 5.2 유용한 유틸리티
```typescript
export const waitForNextFrame = () => 
  new Promise(resolve => requestAnimationFrame(resolve));

export const createMockRaf = () => {
  let callbacks: FrameRequestCallback[] = [];
  let id = 0;
  
  return {
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return ++id;
    },
    cancelAnimationFrame: (id: number) => {
      callbacks = callbacks.filter((_, i) => i !== id - 1);
    },
    triggerNextFrame: (time = 16) => {
      const cbs = [...callbacks];
      callbacks = [];
      cbs.forEach(cb => cb(time));
    },
  };
};
```

## 6. 성능 테스트

### 6.1 메모리 누수 테스트
```typescript
describe('Memory Management', () => {
  it('should not leak memory on repeated mount/unmount', async () => {
    const initialHeap = (global as any).gc && process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 100; i++) {
      const engine = new AnimationEngine(mixer);
      engine.registerAction('test', mockAction);
      engine.playAnimation('test');
      engine.dispose();
    }
    
    if ((global as any).gc) {
      (global as any).gc();
      const finalHeap = process.memoryUsage().heapUsed;
      const heapGrowth = finalHeap - initialHeap;
      
      expect(heapGrowth).toBeLessThan(1024 * 1024); // 1MB
    }
  });
});
```

### 6.2 성능 테스트
```typescript
describe('Performance', () => {
  it('should update 1000 entities within 16ms', () => {
    const entities = Array.from({ length: 1000 }, () => 
      new Entity(mockMesh)
    );
    
    const start = performance.now();
    entities.forEach(entity => entity.update(0.016));
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(16);
  });
});
```

## 7. 테스트 실행

### 7.1 명령어
```bash
# 전체 테스트 실행
npm test

# 감시 모드
npm test -- --watch

# 커버리지 확인
npm test -- --coverage

# 특정 파일 테스트
npm test -- AnimationEngine.test.ts

# 메모리 누수 감지
npm test -- --detectLeaks
```

### 7.2 CI/CD 설정
```yaml
test:
  script:
    - npm test -- --ci --coverage --maxWorkers=2
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## 8. 테스트 작성 체크리스트

- [ ] 테스트 파일이 올바른 위치에 있는가?
- [ ] 테스트 이름이 명확하고 설명적인가?
- [ ] Setup과 Teardown이 적절히 구성되었는가?
- [ ] 모든 분기와 엣지 케이스를 테스트했는가?
- [ ] 외부 의존성이 적절히 모킹되었는가?
- [ ] 테스트가 독립적으로 실행 가능한가?
- [ ] 비동기 작업이 올바르게 처리되었는가?
- [ ] 메모리 누수 가능성을 확인했는가?

## 9. 안티패턴

### 9.1 피해야 할 패턴
```typescript
// ❌ 잘못된 예: 구현 세부사항 테스트
it('should call setState', () => {
  const setState = jest.spyOn(component, 'setState');
  component.handleClick();
  expect(setState).toHaveBeenCalled();
});

// ✅ 올바른 예: 동작 결과 테스트
it('should update display when clicked', () => {
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### 9.2 과도한 모킹 피하기
```typescript
// ❌ 잘못된 예: 모든 것을 모킹
jest.mock('../entire-module');

// ✅ 올바른 예: 필요한 부분만 모킹
jest.mock('../external-api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}));
```

## 10. 문제 해결

### 10.1 일반적인 문제
- **Canvas 관련 에러**: `jest-canvas-mock`이 setup에 포함되었는지 확인
- **메모리 누수 경고**: 모든 리소스가 테스트 후 정리되는지 확인
- **타임아웃 에러**: 비동기 작업에 적절한 대기 시간 설정

### 10.2 디버깅 팁
```typescript
// 테스트 디버깅을 위한 로깅
console.log('Current state:', result.current);

// 특정 테스트만 실행
it.only('should focus on this test', () => {});

// 특정 테스트 건너뛰기
it.skip('should skip this test', () => {});
``` 