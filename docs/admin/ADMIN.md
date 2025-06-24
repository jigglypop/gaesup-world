# Admin 모듈 가이드

## 1. 개요

`admin` 모듈은 `gaesup-world` 라이브러리를 사용하는 애플리케이션에 관리자 기능을 제공하도록 설계된 React 컴포넌트 라이브러리입니다. 독립 실행형 애플리케이션이 아니라 호스트 애플리케이션에 통합될 수 있는 컴포넌트 모음입니다.

## 2. 아키텍처

`admin` 모듈은 엄격한 관심사 분리를 따르므로 호스트 애플리케이션의 비즈니스 로직과 분리된 상태를 유지합니다.

-   **컴포넌트 라이브러리:** 관리자 기능을 캡슐화하는 React 컴포넌트를 내보냅니다. 주요 컴포넌트는 `GaesupAdmin`입니다.
-   **상태 관리:** `zustand`를 사용하여 주로 인증(`authStore`)을 위해 내부 상태를 관리합니다.
-   **의존성 역전:** 모듈은 애플리케이션의 의존성이 되도록 설계되었으며 그 반대가 아닙니다. 호스트 애플리케이션(예: `examples`)에서 **절대** 가져오면 안 됩니다.

## 3. 주요 컴포넌트

### `GaesupAdmin`

-   **경로:** `src/admin/components/GaesupAdmin/index.tsx`
-   **목적:** 인증 로직을 처리하는 래퍼 컴포넌트입니다. 자식 컴포넌트를 보호하며, 사용자가 인증된 경우에만 렌더링합니다. 그렇지 않으면 로그인 페이지를 표시합니다.

## 4. 사용법

`admin` 모듈은 호스트 애플리케이션에서 사용하기 위한 것입니다. 호스트 애플리케이션은 라우팅 및 관리자 컴포넌트 렌더링을 담당합니다.

### 예제 통합 (`examples/App.tsx`)

```tsx
import { GaesupAdmin } from '@core/admin';
import { WorldPage } from './pages/WorldPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorldPage />} />
        <Route
          path="/admin"
          element={
            <GaesupAdmin>
              <WorldPage showEditor={true} />
            </GaesupAdmin>
          }
        />
      </Routes>
    </Router>
  );
}
```

이 예제에서:
1.  `GaesupAdmin` 컴포넌트는 `/admin` 라우트에서 사용됩니다.
2.  사용자가 인증되면 자식 컴포넌트(`<WorldPage showEditor={true} />`)를 렌더링합니다.
3.  그렇지 않으면 `LoginPage`를 렌더링하여 자격 증명을 요청합니다.
4.  이 설정은 `admin` 모듈의 컴포넌트가 순환 종속성을 생성하지 않고 애플리케이션의 흐름에 통합되도록 보장합니다. 