# Performance API

이 문서는 현재 공개 API 기준의 성능 관련 기능을 정리합니다.

## 공개 export

루트 엔트리 `gaesup-world`에서 직접 사용할 수 있는 성능 API는 `src/core/perf` 배럴 기준입니다.

```ts
import {
  autoDetectProfile,
  classifyTier,
  detectCapabilities,
  profileForTier,
  usePerfStore,
} from 'gaesup-world';
```

## 성능 티어 감지

### detectCapabilities

현재 브라우저와 장치의 렌더링 capability를 감지합니다.

```ts
import { detectCapabilities } from 'gaesup-world';

const capabilities = await detectCapabilities();
```

### classifyTier

감지된 capability를 성능 tier로 분류합니다.

```ts
import { classifyTier, detectCapabilities } from 'gaesup-world';

const tier = classifyTier(await detectCapabilities());
```

### profileForTier / autoDetectProfile

tier에 맞는 성능 profile을 가져옵니다.

```ts
import { autoDetectProfile, profileForTier } from 'gaesup-world';

const profile = await autoDetectProfile();
const lowProfile = profileForTier('low');
```

## usePerfStore

성능 profile과 관련 상태를 관리하는 Zustand store입니다. React 컴포넌트에서는 필요한 값만 selector로 구독합니다.

```tsx
import { usePerfStore } from 'gaesup-world';

function PerfTierLabel() {
  const tier = usePerfStore((state) => state.tier);
  return <span>{tier}</span>;
}
```

## Renderer Stats

`PerformanceCollector`는 현재 `GaesupWorldContent` 내부에서 자동으로 사용되는 내부 컴포넌트입니다. 루트 엔트리에서 공개 import하는 API로 문서화하지 않습니다.

수집 데이터는 `useGaesupStore((state) => state.performance)`에서 읽을 수 있습니다.

```tsx
import { useGaesupStore } from 'gaesup-world';

function DrawCallCounter() {
  const calls = useGaesupStore((state) => state.performance.render.calls);
  return <span>{calls}</span>;
}
```

## 내부 SFE 유틸

`weightFromDistance`, `multiSigma`, `RenderBudget`은 `src/core/utils/sfe.ts`에 구현되어 있지만 현재 배포 package export에서 루트 공개 API로 보장하지 않습니다.

문서나 예제에서 공개 API처럼 아래 import를 사용하지 않습니다.

```ts
// 현재 공개 API로 보장하지 않음
import { weightFromDistance } from 'gaesup-world';
```

외부 사용자에게 공개하려면 먼저 `src/core/utils/index.ts`, `src/core/index.ts`, `src/index.ts`, `package.json` exports 정책을 함께 정리해야 합니다.

## Camera Collision Cache

`invalidateCollisionCache`는 `src/core/camera/utils/camera.ts`에 구현된 내부 유틸입니다. 현재 루트 공개 API가 아니므로 외부 사용 예시에 넣지 않습니다.

## 성능 회귀 테스트

현재 성능 관련 테스트는 다음 성격으로 유지됩니다.

- selector subscription 회귀 테스트: 불필요한 Zustand 리렌더 방지
- building GPU visibility parser smoke benchmark: 대량 visibility flag parsing 기준선 확인
- perf detect 테스트: capability/profile 분류 확인

성능 수치 문서는 실제 측정 환경과 명령을 함께 기록한 경우에만 갱신합니다.
