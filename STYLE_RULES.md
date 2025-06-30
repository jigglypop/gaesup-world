코딩 컨벤션의 일관성 문제를 분석하고 가이드를 제공하겠습니다.
Ran tool
Ran tool
Ran tool
Ran tool

Ran tool
Ran tool
Ran tool
Read file: src/admin/components/Toast/index.tsx

Read file: src/admin/components/GaesupAdmin/index.tsx
Ran tool
Ran tool
Read file: .cursorrules

# 코딩 컨벤션 통일 가이드

## 현재 상황 분석

프로젝트 전반에 걸쳐 코딩 컨벤션이 일관되지 않은 상태입니다. 특히 다음과 같은 문제들이 발견됩니다:

### 1. Export 패턴 불일치
- 대부분 `export default function`을 사용하지만 일부는 `export const` 사용
- 같은 파일에서 여러 export가 섞여있는 경우도 존재

### 2. 폴더/파일 구조 불일치
- `styles.css` vs `style.css` (s 유무)
- `styles.css.ts` (vanilla-extract) vs 일반 CSS
- 타입 정의 위치가 제각각 (inline, 같은 파일, 별도 파일)

### 3. CSS Import 방식 불일치
- `import * as S from "./styles.css"`
- `import './styles.css'`
- inline styles 사용

## 통일된 코딩 컨벤션

### 1. 컴포넌트 폴더 구조

```
ComponentName/
├── index.tsx      # 메인 컴포넌트 로직
├── types.ts       # TypeScript 타입 정의
└── styles.css     # 스타일 (항상 styles로 통일)
```

### 2. Export 규칙

#### 컴포넌트 (index.tsx가 하나인 경우)
```typescript
// index.tsx
export default function ComponentName() {
  return <div className="component-name">...</div>;
}
```

#### Hook
```typescript
// useHookName.ts
export function useHookName() {
  // hook logic
}
```

#### 유틸리티/상수
```typescript
// utils.ts or constants.ts
export const CONSTANT_NAME = 'value';
export function utilityFunction() {}
```

### 3. 타입 정의 규칙

#### types.ts 파일 구조
```typescript
// types.ts
export interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

export interface ComponentNameState {
  state1: boolean;
  state2: string[];
}

export type ComponentNameVariant = 'primary' | 'secondary';
```

### 4. CSS 규칙

#### styles.css 파일
```css
/* styles.css */
.component-name {
  /* root class */
}

.component-name__header {
  /* BEM 스타일 권장 */
}

.component-name--active {
  /* modifier */
}
```

#### CSS Import 방식
```typescript
// index.tsx
import './styles.css';

export default function ComponentName() {
  return <div className="component-name">...</div>;
}
```

### 5. 파일 네이밍 규칙

- **컴포넌트 폴더**: PascalCase (예: `GaesupAdmin/`)
- **파일명**: 
  - 컴포넌트: `index.tsx`
  - 타입: `types.ts`
  - 스타일: `styles.css` (항상 복수형)
  - Hook: `useHookName.ts`
  - 유틸리티: `utils.ts`
  - 상수: `constants.ts`

### 6. Import 순서

```typescript
// 1. React/외부 라이브러리
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

// 2. 내부 모듈 (절대 경로)
import { useGaesupStore } from '@/core/stores';

// 3. 상대 경로 import
import { ComponentNameProps } from './types';
import './styles.css';
```

## 마이그레이션 예시

### Before
```typescript
// SomeComponent/index.tsx
import * as S from "./style.css";  // style(s 없음)
import { SomeType } from "../types"; // 타입이 다른 곳에

const SomeComponent = () => {  // arrow function
  return <div className={S.container}>...</div>;
};

export default SomeComponent;
```

### After
```typescript
// SomeComponent/index.tsx
import './styles.css';  // styles(s 있음)
import { SomeComponentProps } from './types';  // 같은 폴더

export default function SomeComponent({ prop1, prop2 }: SomeComponentProps) {
  return <div className="some-component">...</div>;
}
```

```typescript
// SomeComponent/types.ts
export interface SomeComponentProps {
  prop1: string;
  prop2?: number;
}
```

```css
/* SomeComponent/styles.css */
.some-component {
  /* styles */
}
```

## 점진적 마이그레이션 전략

### Phase 1: 새로운 컴포넌트
- 모든 새로운 컴포넌트는 위 규칙을 따름
- PR 리뷰에서 컨벤션 체크

### Phase 2: Core 모듈 정리
- `src/core` 내의 컴포넌트들을 우선 정리
- 특히 export 패턴과 폴더 구조 통일

### Phase 3: Admin 모듈 정리  
- `src/admin` 컴포넌트 정리
- Toast, Modal 등 공통 컴포넌트 우선

### Phase 4: Legacy 마이그레이션
- Legacy에서 옮겨오는 컴포넌트는 반드시 새 컨벤션 적용

## ESLint/Prettier 설정 추가 제안

```json
// .eslintrc.json
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }],
    "react/function-component-definition": ["error", {
      "namedComponents": "function-declaration"
    }]
  }
}
```

## 체크리스트

새 컴포넌트 생성 시:
- [ ] 폴더명은 PascalCase인가?
- [ ] `index.tsx`, `types.ts`, `styles.css` 파일이 있는가?
- [ ] `export default function`을 사용하는가?
- [ ] 타입은 `types.ts`에 정의되어 있는가?
- [ ] CSS 클래스명은 kebab-case인가?
- [ ] Import 순서가 올바른가?

이 가이드를 따르면 프로젝트 전체의 일관성이 크게 향상될 것입니다.