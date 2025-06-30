# Gaesup World - Editor UI 스타일 가이드

이 문서는 `gaesup-world` 에디터 UI의 일관된 디자인과 개발 표준을 정의합니다. 모든 에디터 관련 UI 컴포넌트는 이 가이드를 따라야 합니다.

## 1. 기본 원칙

1.  **관심사의 분리 (Separation of Concerns)**: 컴포넌트의 로직(`index.tsx`), 스타일(`styles.css`), 타입(`types.ts`)은 반드시 별도의 파일로 분리합니다.
2.  **CSS 변수 사용**: 모든 색상, 폰트 크기, 간격 등은 `src/core/editor/styles/theme.css`에 정의된 CSS 변수를 사용해야 합니다. 절대 특정 패널이나 컴포넌트에 하드코딩된 값을 사용하지 마십시오.
3.  **독립적인 패널**: 각 패널 컴포넌트(`*Panel.tsx`)는 자체적인 `isOpen` 상태나 토글 버튼을 가져서는 안 됩니다. 패널의 노출 여부는 상위 `EditorLayout`이 제어합니다.
4.  **일관된 스타일링**: 모든 UI 요소는 `theme.css`에 정의된 전역 스타일(스크롤바, 버튼, 탭 등)을 따르며, 통일된 "Glassmorphism" 배경 효과를 유지해야 합니다.

---

## 2. CSS 스타일링

### 2.1. 클래스 네이밍

컴포넌트 기반의 명확한 네이밍 컨벤션을 사용합니다. 하이픈(`-`)으로 단어를 연결합니다.

-   **형식**: `[컴포넌트]-[엘리먼트]--[상태]`
-   **예시**:
    -   `.perf-panel` (최상위 컨테이너)
    -   `.perf-header` (패널 내 헤더 섹션)
    -   `.perf-details-grid` (패널 내 특정 그리드 레이아웃)
    -   `.tab-button--active` (활성화된 상태의 탭 버튼)

### 2.2. CSS 변수 (`theme.css`)

주요 변수와 용도는 다음과 같습니다.

| 변수명                      | 설명                                         |
| --------------------------- | -------------------------------------------- |
| `--editor-bg-1`             | 패널의 기본 배경 (Glassmorphism)             |
| `--editor-surface-1`        | 버튼, 입력 필드 등 상호작용 요소의 기본 배경 |
| `--editor-surface-hover`    | 상호작용 요소에 마우스를 올렸을 때의 배경    |
| `--editor-surface-active`   | 상호작용 요소를 클릭하거나 활성화했을 때의 배경 |
| `--editor-border-color`     | 패널과 요소의 테두리 색상                    |
| `--editor-text-main`        | 기본 텍스트 색상                             |
| `--editor-text-muted`       | 보조적인 정보, 비활성 텍스트 색상            |
| `--editor-text-faint`       | 레이블 등 가장 흐린 텍스트 색상              |
| `--editor-accent-color`     | 주요 액센트 색상 (사용 시 주의)              |
| `--editor-panel-padding`    | 패널 내부의 기본 패딩 값                     |

### 2.2.1. 패널 색상 사용 규칙

UI의 통일성을 위해 패널의 각 부분은 다음 규칙에 따라 CSS 변수를 사용해야 합니다.

-   **패널 배경**: 모든 패널의 최상위 컨테이너 배경은 반드시 `var(--editor-bg-1)`을 사용합니다. 이는 Glassmorphism 효과를 포함한 기본 배경입니다.
    ```css
    .my-panel {
      background: var(--editor-bg-1);
    }
    ```

-   **상호작용 요소 (버튼, 입력 필드, 탭)**:
    -   **기본 상태**: `var(--editor-surface-1)`
    -   **마우스 오버**: `var(--editor-surface-hover)`
    -   **활성/클릭 상태**: `var(--editor-surface-active)`
    ```css
    .button {
      background-color: var(--editor-surface-1);
    }
    .button:hover {
      background-color: var(--editor-surface-hover);
    }
    .button:active, .button.active {
      background-color: var(--editor-surface-active);
    }
    ```

-   **텍스트**:
    -   **헤더/제목**: `var(--editor-text-main)`
    -   **본문/주요 정보**: `var(--editor-text-main)`
    -   **보조 설명/비활성 텍스트**: `var(--editor-text-muted)`
    -   **레이블/가장 흐린 텍스트**: `var(--editor-text-faint)`

-   **테두리**: 모든 패널과 주요 구분선은 `var(--editor-border-color)`를 사용합니다.

### 2.3. 레이아웃

-   **Flexbox**와 **Grid**를 적극적으로 사용하여 유연하고 반응적인 레이아웃을 구성합니다.
-   `position: absolute`의 사용은 반드시 필요한 경우로 최소화하고, 부모 요소에 `position: relative`를 명시해야 합니다.
-   간격(Spacing)은 `gap`, `padding`, `margin`을 사용하되, 가급적 `theme.css`에 정의된 변수를 활용합니다.

---

## 3. 컴포넌트 구조

모든 UI 컴포넌트는 다음의 디렉토리 구조를 따릅니다.

```
/src/core/editor/components/MyComponent/
├── index.tsx     # React 컴포넌트 로직
├── styles.css    # CSS 스타일
└── types.ts      # TypeScript 타입 정의 (필요시)
```

**`index.tsx` 예시:**

```tsx
import React from 'react';
import './styles.css';

export function MyComponent() {
  return (
    <div className="my-component-panel">
      <h3 className="my-component-header">My Component</h3>
      {/* ... */}
    </div>
  );
}
```

**`styles.css` 예시:**

```css
.my-component-panel {
  padding: var(--editor-panel-padding);
  background: var(--editor-bg-1);
  border: 1px solid var(--editor-border-color);
  /* ... */
}

.my-component-header {
  color: var(--editor-text-main);
  /* ... */
}
```

---

## 4. 타이포그래피 및 아이콘

-   **폰트**: 시스템 기본 UI 폰트를 사용합니다.
-   **크기**: `rem` 단위를 기본으로 사용하며, `theme.css`에 정의된 변수를 따릅니다.
-   **아이콘**: 아이콘은 SVG 컴포넌트로 관리하며, `fill`이나 `stroke` 속성에 `currentColor`를 사용하여 CSS의 `color` 속성으로 색상을 제어할 수 있도록 제작합니다.

---

## 5. 상태 관리

-   컴포넌트 내부에서만 사용되는 단순 상태(예: 입력 필드 값)는 `useState`를 사용합니다.
-   여러 컴포넌트에 걸쳐 공유되거나, 에디터의 전역적인 상태(예: 현재 선택된 객체, 패널 레이아웃 설정)는 반드시 `
-   

추가로 정할 코딩 컨벤션들을 제안하겠습니다.
Read file: docs/guide/LAYER_GUIDE.md
Ran tool
Ran tool
Ran tool

Ran tool
Ran tool
Ran tool

Read file: src/core/stores/gaesupStore.ts
Ran tool

# 추가 코딩 컨벤션 규칙

## 1. 레이어 아키텍처 규칙

### 1.1 Import 규칙
```typescript
// ✅ 올바른 import 방향
// Layer 3 → Layer 2
import { useCamera } from '@/core/camera/hooks';

// Layer 2 → Layer 1
import { CameraEngine } from '../core/CameraEngine';

// ❌ 잘못된 import 방향
// Layer 1 → Layer 2
import { useGaesupStore } from '@/core/stores'; // 금지!
```

### 1.2 폴더별 역할 정의
```
도메인/
├── core/           # Layer 1: 순수 로직, THREE.js, 물리 엔진
├── bridge/         # Layer 1.5: 레거시 연결 브릿지
├── controllers/    # Layer 2: 상태 관리 로직
├── hooks/          # Layer 2: React Hooks
├── stores/         # Layer 2: Zustand slices
├── components/     # Layer 3: React 컴포넌트
└── types.ts        # 공통 타입 정의
```

## 2. Store/State 관리 규칙

### 2.1 Slice 생성 패턴
```typescript
// stores/slices/domainSlice.ts
import { StateCreator } from 'zustand';

export interface DomainSlice {
  // State
  value: number;
  items: Item[];
  
  // Actions
  setValue: (value: number) => void;
  addItem: (item: Item) => void;
  reset: () => void;
}

export const createDomainSlice: StateCreator<DomainSlice> = (set, get) => ({
  // Initial state
  value: 0,
  items: [],
  
  // Actions
  setValue: (value) => set({ value }),
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  reset: () => set({ value: 0, items: [] })
});
```

### 2.2 Store 사용 규칙
```typescript
// ✅ 필요한 것만 구독
const value = useGaesupStore((state) => state.value);

// ❌ 전체 store 구독 (리렌더링 과다)
const store = useGaesupStore();
```

## 3. Bridge 패턴 규칙

### 3.1 Bridge 클래스 구조
```typescript
// bridge/DomainBridge.ts
export class DomainBridge {
  // Legacy → Modern 변환
  static convertLegacyData(legacyData: any): ModernData {
    return {
      id: legacyData.id || generateId(),
      name: legacyData.title || 'Untitled',
      // ...mapping
    };
  }
  
  // Modern → Legacy 변환
  static convertToLegacyData(modernData: ModernData): any {
    return {
      id: modernData.id,
      title: modernData.name,
      // ...mapping
    };
  }
}
```

## 4. 이벤트 핸들링 규칙

### 4.1 이벤트 핸들러 네이밍
```typescript
// Props에서의 이벤트 핸들러: on으로 시작
interface ComponentProps {
  onClick?: (event: MouseEvent) => void;
  onSelect?: (id: string) => void;
  onUpdate?: (data: UpdateData) => void;
}

// 내부 핸들러: handle로 시작
function Component({ onClick }: ComponentProps) {
  const handleInternalClick = (e: MouseEvent) => {
    // 내부 로직
    onClick?.(e);
  };
}
```

### 4.2 이벤트 타입 정의
```typescript
// types.ts
export interface DomainEvent {
  type: 'click' | 'hover' | 'select';
  target: string;
  data?: unknown;
  timestamp: number;
}
```

## 5. 에러 처리 규칙

### 5.1 에러 처리 패턴
```typescript
// Layer 1: 에러 throw
class Engine {
  calculate(value: number): number {
    if (value < 0) {
      throw new Error('Value must be positive');
    }
    return value * 2;
  }
}

// Layer 2: 에러 catch 및 상태 관리
function useEngine() {
  const [error, setError] = useState<string | null>(null);
  
  const calculate = useCallback((value: number) => {
    try {
      setError(null);
      return engine.calculate(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[Engine Error]:', message);
    }
  }, []);
}
```

### 5.2 에러 메시지 포맷
```typescript
// 에러 메시지는 [모듈명 Error]: 설명 형식
console.error('[Camera Error]: Failed to initialize camera');
console.warn('[Physics Warning]: Collision detection disabled');
```

## 6. 테스트 규칙

### 6.1 테스트 파일 위치
```
ComponentName/
├── index.tsx
├── types.ts
├── styles.css
└── __tests__/
    └── ComponentName.test.tsx
```

### 6.2 테스트 네이밍
```typescript
describe('ComponentName', () => {
  it('should render without crash', () => {});
  it('should handle click event', () => {});
  it('should update state when prop changes', () => {});
});
```

## 7. 타입 정의 규칙

### 7.1 타입 위치
- **컴포넌트 타입**: `ComponentName/types.ts`
- **도메인 공통 타입**: `domain/types.ts`
- **전역 타입**: `src/types/global.ts`

### 7.2 타입 네이밍
```typescript
// Props: ComponentNameProps
export interface GaesupAdminProps {}

// State: ComponentNameState
export interface CameraState {}

// Config: DomainConfig
export interface PhysicsConfig {}

// Event: DomainEvent
export interface InteractionEvent {}
```

## 8. 상수 정의 규칙

### 8.1 상수 네이밍
```typescript
// constants.ts
export const MAX_VELOCITY = 10;
export const DEFAULT_GRAVITY = -9.81;

export const ANIMATION_TYPES = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
} as const;
```

### 8.2 Magic Number 금지
```typescript
// ❌ Bad
if (velocity > 10) {}

// ✅ Good  
const MAX_VELOCITY = 10;
if (velocity > MAX_VELOCITY) {}
```

## 9. 파일 크기 제한

- **컴포넌트 파일**: 최대 200줄
- **엔진/코어 파일**: 최대 500줄
- **유틸리티 파일**: 최대 150줄

큰 파일은 기능별로 분리:
```
camera/
├── core/
│   ├── CameraEngine.ts
│   ├── CameraCalculator.ts
│   └── CameraValidator.ts
```

## 10. Re-export 패턴

### 10.1 Index 파일 구조
```typescript
// domain/index.ts
// 공개 API만 export
export { DomainComponent } from './components/DomainComponent';
export { useDomain } from './hooks/useDomain';
export type { DomainProps, DomainConfig } from './types';

// 내부 구현은 export하지 않음
// ❌ export * from './core/Engine';
```

## 11. 비동기 처리 규칙

### 11.1 비동기 함수 네이밍
```typescript
// fetch/load/save 등 명확한 동사 사용
async function fetchUserData(): Promise<User> {}
async function loadModel(url: string): Promise<Model> {}
async function saveConfiguration(config: Config): Promise<void> {}
```

### 11.2 Loading State 관리
```typescript
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

## 12. 성능 최적화 규칙

### 12.1 Memoization
```typescript
// 복잡한 계산은 useMemo 사용
const expensiveValue = useMemo(() => {
  return calculateExpensive(input);
}, [input]);

// 콜백은 useCallback 사용
const handleClick = useCallback((id: string) => {
  // handle
}, [dependency]);
```

### 12.2 Ref 사용
```typescript
// Layer 1 객체는 항상 ref로 관리
const engineRef = useRef<Engine>();

// DOM 접근도 ref 사용
const canvasRef = useRef<HTMLCanvasElement>(null);
```

이러한 추가 규칙들을 따르면 프로젝트의 일관성과 유지보수성이 크게 향상될 것입니다. 특히 레이어 간 의존성 규칙과 Store 패턴을 엄격히 지키는 것이 중요합니다.