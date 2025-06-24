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
npm test
``` 