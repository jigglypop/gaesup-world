# 🎨 Gaesup 코딩 스타일 가이드

## 📁 **폴더 구조 규칙**

### 1. 폴더 로직 분리

```
src/core/[folder]/
├── index.tsx    # 메인 폴더 로직 (컴포넌트인 경우)
├── index.ts     # 메인 폴더 로직 (유틸/훅인 경우)
├── types.ts     # 타입 정의만
├── styles.css   # 스타일링만
└── ...          # 기타 파일들
```

### 2. 관심사 분리 원칙

- **각 폴더는 목적에 맞는 로직만 포함**
- **타입과 스타일은 별도 파일로 분리**
- **index 파일에만 핵심 로직 위치**

## 🗂️ **폴더별 역할 정의**

### `/atoms` - 상태 관리

- Jotai atom 정의
- 전역 상태 관리

### `/hooks` - 외부 사용자용 훅

- 라이브러리 사용자가 직접 사용할 훅만
- 완전한 API 제공 (옵션, 에러 처리, 반환값)

### `/utils` - 순수 헬퍼 함수

- **재사용성 높은 순수 함수만**
- 비즈니스 로직 포함 금지
- 수학, 변환, 유틸리티 함수

### `/component` - UI 컴포넌트

- React 컴포넌트 정의
- 시각적 요소 담당

### `/[feature]` - 기능별 폴더

- `physics/`, `gltf/`, `frame/` 등
- 해당 기능의 모든 로직 포함
- 내부 훅들도 여기에 위치

## 🎯 **API 설계 원칙**

### 1. 외부 vs 내부 구분

```typescript
// ✅ 외부용 - hooks/
export function useClicker(): ClickerResult {
  return {
    canClick: boolean,
    click: (options?) => boolean,
    error: string | null,
  };
}

// ✅ 내부용 - feature/hooks.ts
function usePhysics(): PhysicsResult {
  // 복잡한 내부 로직...
}
```

### 2. 에러 처리

```typescript
// ✅ 에러를 반환값에 포함
return {
  data,
  error: error?.message || null,
  isReady: !error && !!data,
};

// ❌ throw하지 않음
throw new Error('Something went wrong');
```

### 3. 옵션 및 설정

```typescript
// ✅ 옵션 객체로 확장성 제공
function useFeature(options: FeatureOptions = {}) {
  const { enabled = true, timeout = 5000 } = options;
}
```

## 🧩 **컴포넌트 구조**

### 1. Props 타입 정의

```typescript
// types.ts
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  onReady?: () => void;
}
```

### 2. 컴포넌트 구현

```tsx
// index.tsx
import { ComponentProps } from './types';
import './styles.css';

export function Component({ children, className, onReady }: ComponentProps) {
  // 로직...
  return <div className={className}>{children}</div>;
}
```

## ⚡ **성능 최적화**

### 1. 메모이제이션

```typescript
// useCallback, useMemo 적극 활용
const handleClick = useCallback(() => {
  // 로직
}, [dependency]);

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 2. React Three Fiber 통합

```typescript
// ✅ R3F의 useFrame 활용
import { useFrame } from '@react-three/fiber';

// ❌ 직접 requestAnimationFrame 사용 금지
requestAnimationFrame(callback); // 피하기
```

## 📦 **Export 구조**

### 1. Main index.ts 분류

```typescript
// src/index.ts
// === ATOMS ===
export * from './gaesup/atoms';

// === HOOKS (외부 사용자용) ===
export { useClicker, useTeleport } from './gaesup/hooks';

// === UTILS ===
export { V3, Qt } from './gaesup/utils';

// === COMPONENTS ===
export { GaesupComponent } from './gaesup/component';
```

### 2. 카테고리별 정리

- **ATOMS**: 상태 관리
- **HOOKS**: 외부 사용자용 훅
- **UTILS**: 순수 헬퍼
- **COMPONENTS**: UI 컴포넌트
- **TYPES**: 타입 정의

## 🚫 **금지사항**

### 1. 폴더 오용

```typescript
// ❌ utils에 비즈니스 로직
function useComplexPhysicsSystem() { ... } // utils 금지

// ✅ 해당 기능 폴더로
function useComplexPhysicsSystem() { ... } // physics/hooks.ts
```

### 2. 타입 혼재

```typescript
// ❌ 컴포넌트 파일에 타입 정의
export interface Props { ... }
export function Component() { ... }

// ✅ 별도 타입 파일
// types.ts: export interface Props { ... }
// index.tsx: import { Props } from './types'
```

### 3. 스타일 혼재

```typescript
// ❌ 컴포넌트에 인라인 스타일
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ CSS 파일 활용
// styles.css: .component { color: red; font-size: 16px; }
<div className="component">
```

## ✅ **체크리스트**

### 새 기능 추가 시

- [ ] 적절한 폴더에 위치했는가?
- [ ] types.ts 파일로 타입을 분리했는가?
- [ ] 필요시 styles.css 파일을 생성했는가?
- [ ] 외부 API인 경우 에러 처리를 포함했는가?
- [ ] 메인 index.ts에 적절히 export했는가?

### 코드 리뷰 시

- [ ] 관심사가 적절히 분리되었는가?
- [ ] utils에 비즈니스 로직이 없는가?
- [ ] 성능 최적화가 적용되었는가?
- [ ] 타입 안정성이 확보되었는가?

---

_이 가이드를 따라 일관성 있고 유지보수 가능한 코드를 작성하세요!_
