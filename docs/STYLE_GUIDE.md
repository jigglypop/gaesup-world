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
-   여러 컴포넌트에 걸쳐 공유되거나, 에디터의 전역적인 상태(예: 현재 선택된 객체, 패널 레이아웃 설정)는 반드시 `Zustand` 스토어 (`editorSlice.ts`, `performanceSlice.ts` 등)를 통해 관리합니다.
-   UI 컴포넌트는 데이터를 직접 소유하는 대신 스토어에서 데이터를 구독하고, 액션을 통해 상태 변경을 요청해야 합니다. 