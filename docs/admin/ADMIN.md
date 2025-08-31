# Admin 모듈 가이드

## 1. 개요

`admin` 모듈은 `gaesup-world`를 사용하는 애플리케이션에 관리자 기능을 제공하도록 설계된 React 컴포넌트 라이브러리입니다. 호스트 애플리케이션에 통합되어 인증, 사용자 관리, 콘텐츠 편집 등의 기능을 수행합니다.

## 2. 아키텍처

`admin` 모듈은 호스트 애플리케이션의 비즈니스 로직과 분리된 상태를 유지하도록 설계되었습니다.

-   **독립적인 컴포넌트**: 관리자 기능을 캡슐화한 `GaesupAdmin` 컴포넌트를 내보냅니다.
-   **상태 관리**: `zustand`를 사용하여 인증(`authStore`), UI 상태(`toastStore`) 등 내부 상태를 독립적으로 관리합니다.
-   **의존성 역전**: `admin` 모듈은 호스트 애플리케이션의 의존성이 되며, 반대로 `admin`이 호스트 애플리케이션에 의존하지 않습니다. 이를 통해 순환 참조를 방지하고 모듈의 재사용성을 높입니다.

## 3. 주요 컴포넌트

### `GaesupAdmin`

-   **경로**: `src/admin/components/GaesupAdmin/index.tsx`
-   **역할**: 관리자 페이지의 진입점 역할을 하는 래퍼(Wrapper) 컴포넌트입니다. 내부적으로 `react-router-dom`을 사용하여 인증 상태에 따라 `LoginPage` 또는 실제 관리자 페이지로 라우팅합니다.

## 4. 라우팅 및 인증 흐름

`GaesupAdmin` 컴포넌트는 자체적으로 라우팅 로직을 내장하고 있습니다.

```mermaid
graph TD
    A[사용자 접속: /admin] --> B{isLoggedIn?};
    B -- Yes --> C[관리자 페이지 렌더링<br/>(Admin Dashboard)];
    B -- No --> D[로그인 페이지<br/>(LoginPage)];
    D -- 로그인 성공 --> C;
    C -- 로그아웃 --> D;
```

-   사용자가 `/admin` 경로에 접근하면 `GaesupAdmin`이 렌더링됩니다.
-   `authStore`의 `isLoggedIn` 상태를 확인하여 인증 여부를 판단합니다.
-   인증되지 않은 사용자는 `LoginPage`로 리디렉션됩니다.
-   로그인에 성공하면 `authStore`의 상태가 변경되고, 실제 관리자 페이지(자식 컴포넌트)가 렌더링됩니다.

## 5. 사용법

`admin` 모듈은 호스트 애플리케이션의 라우터 내에서 사용되어야 합니다.

### 예제 통합 (`examples/App.tsx`)

```tsx
import { GaesupAdmin } from 'gaesup-world/admin';
import { WorldPage } from './pages/WorldPage';
import { BlueprintEditorPage } from './pages/BlueprintEditorPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 일반 사용자용 월드 페이지 */}
        <Route path="/" element={<WorldPage />} />

        {/* 관리자 페이지: /admin 경로에 GaesupAdmin 렌더링 */}
        <Route path="/admin/*" element={<GaesupAdmin />} />

        {/* Blueprint 에디터 등 다른 페이지들 */}
        <Route path="/blueprint-editor" element={<BlueprintEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

이 예제에서:
1.  `react-router-dom`의 `BrowserRouter`가 최상위를 감쌉니다.
2.  `/admin/*` 경로에 대한 모든 요청을 `GaesupAdmin` 컴포넌트가 처리하도록 위임합니다.
3.  `GaesupAdmin`은 내부 라우팅을 통해 로그인 페이지 또는 실제 대시보드를 표시합니다.
4.  이 구조는 호스트 애플리케이션의 라우팅과 관리자 모듈의 라우팅을 분리하여 유지보수성을 높입니다. 