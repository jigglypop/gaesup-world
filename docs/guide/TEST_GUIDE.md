# 테스트 가이드

이 문서는 현재 저장소의 테스트 작성과 실행 기준을 정리합니다.

## 기본 원칙

- 핵심 로직은 UI보다 먼저 단위 테스트로 고정합니다.
- 각 테스트는 독립적으로 실행될 수 있어야 합니다.
- Zustand store 테스트는 `beforeEach`에서 상태를 초기화합니다.
- React 훅/컴포넌트는 `@testing-library/react`를 사용합니다.
- 성능 회귀 위험이 있는 변경은 smoke benchmark 또는 render count 테스트를 추가합니다.

## 파일 위치

테스트 파일은 대상 코드 근처의 `__tests__` 디렉터리에 둡니다.

```txt
src/core/<domain>/
  stores/store.ts
  __tests__/store.test.ts
```

파일명은 아래 형식을 사용합니다.

- `*.test.ts`
- `*.test.tsx`

## 테스트 유형

### 순수 로직 테스트

대상:

- parser
- registry
- store reducer/action
- placement/culling/navigation 같은 계산 로직

예:

```ts
describe('questStore', () => {
  it('completes an objective', () => {
    // arrange
    // act
    // assert
  });
});
```

### 훅 테스트

React hook은 `renderHook`과 `act`를 사용합니다.

```tsx
import { act, renderHook } from '@testing-library/react';

it('updates store state', () => {
  const { result } = renderHook(() => useSomeHook());

  act(() => {
    result.current.update();
  });

  expect(result.current.value).toBeDefined();
});
```

### 컴포넌트 테스트

UI 동작이 중요한 컴포넌트만 대상으로 합니다.

```tsx
import { render, screen } from '@testing-library/react';

it('renders the label', () => {
  render(<SomeComponent label="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### 성능 회귀 테스트

예:

- selector 최적화 후 unrelated store update가 리렌더를 만들지 않는지 확인
- large visibility buffer parsing이 smoke threshold 안에 들어오는지 확인

성능 테스트는 절대적인 벤치마크보다 회귀 감지용 기준선으로 다룹니다.

## 실행 명령

전체 테스트:

```bash
npm test -- --runInBand --watchman=false
```

특정 파일:

```bash
npx jest src/core/save/__tests__/SaveSystem.test.ts --runInBand --watchman=false
```

coverage:

```bash
npm run test:coverage
```

## 타입/빌드 검증

타입 선언 빌드:

```bash
npm run build:types
```

전체 빌드:

```bash
npm run build
```

## Lint

전체 lint:

```bash
npm run lint
```

문서 기준으로는 테스트 파일 lint 정책이 별도로 조정될 수 있습니다. lint 대상에서 제외된 파일을 검사할 때는 현재 ESLint 설정을 먼저 확인합니다.

## Jest 환경

Jest 설정은 `jest.config.js`, 공통 setup은 `jest.setup.js`에 있습니다.

현재 setup에는 R3F/jsdom 테스트를 위한 browser API mock과 React act 환경 설정이 포함됩니다.

## 주의사항

- 테스트에서 실제 네트워크나 브라우저 전역 상태에 의존하지 않습니다.
- `console.warn`이 의도된 테스트는 spy로 고정하거나 명확히 주석화합니다.
- fixture가 필요하면 테스트 근처에 최소 데이터로 둡니다.
- 생성물이나 임시 파일을 루트에 만들지 않습니다.
