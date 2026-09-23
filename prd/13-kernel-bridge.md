# PRD-13 커널과 브리지

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (커널 계약 변경) |
| 선행 PRD | 00 |
| 후속 PRD | 11 |
| 감사 | `layer-auditor`, `frame-perf-auditor` |

## 1. 배경과 문제

| 문제 | 근거 |
|---|---|
| 문서상 표준 경로 `useManagedEntity`가 동작 불가 | `ManagedEntity.ts:10-30`의 `@Autowired`가 `design:type`에 의존, `tsconfig.json:63` `emitDecoratorMetadata: false`. 사용처 0. 테스트는 DI와 ManagedEntity를 mock(`useManagedEntity.test.ts:24-47`) |
| register/unregister 중복 호출 | `useManagedEntity.ts:167-168, 294-299`, `useBaseLifecycle.ts:185`, `ManagedEntity.ts:31,68` |
| 브리지 등록 메커니즘 3개 | `decorators/index.ts:7-13`(DI 포함), `decorators/blueprint/BridgeDecorators.ts:5-10`(DI 없음, 같은 이름), `decorators/bridge.ts`의 `RegisterBridge` |
| 잘못된 등록 | `WarriorEntity.ts:7`이 브리지가 아닌 클래스에 `@DomainBridge('motion')`. import되면 MotionBridge를 덮어씀. 덮어쓰기는 경고만(`BridgeRegistry.ts:8`) |
| 부수효과 의존 등록 | `initializeBridges.ts`가 6개 중 4개만 import. Network, UI는 배럴 부수효과 의존. `package.json sideEffects`에 브리지 경로 없음 |
| 스냅샷 경로 할당 | `AbstractBridge.snapshot()`이 핸들러 없어도 이벤트 객체 2개와 `next` 클로저, `Date.now()` 생성(`AbstractBridge.ts:24-37, 92-99`). `PhysicsBridge.createSnapshot` spread 2회와 `@LogSnapshot` 문자열 생성(`PhysicsBridge.ts:46-53`). `WorldBridge.createSnapshot` 배열·클로저 할당(`WorldBridge.ts:103-121`) |
| 커널의 도메인 역의존 | `boilerplate/hooks/useEntity.ts`가 motions, animation을 import |
| 로깅 규칙 위반 | `BridgeRegistry.ts:8`, `entity/SystemRegistry.ts:22`의 `console.warn` |

## 2. 목표 / 비목표

### 목표
1. 브리지를 만들고 쓰는 방법을 하나로 정한다.
2. 등록은 명시적이고 결정적이다. 번들러 tree-shaking에 영향을 받지 않는다.
3. 스냅샷 경로는 핸들러가 없을 때 할당 0이다.
4. 커널(boilerplate)은 도메인을 import하지 않는다.

### 비목표
- DI 컨테이너 전체 재작성. 속성 주입(`@Autowired`)을 없애는 데까지만 한다.
- 도메인 브리지의 명령 체계 변경.

## 3. 결정 사항

### 3.1 ManagedEntity: 삭제

- 선택지 A(수정: 생성자 주입)와 B(삭제)를 비교했다. 사용처가 0이고, 실제 소비 경로는 도메인 훅 + `BridgeFactory.getOrCreate`로 정착해 있다. PRD-11의 `useEngineFrame`이 프레임 구독 역할을 대신한다.
- **B를 권장한다.** `ManagedEntity`, `useManagedEntity`, `useBatchManagedEntities`를 삭제하고, 대신 얇은 `useBridgeEntity(bridge, id, engineFactory)` 하나를 둔다. 이 훅은 register/unregister를 **한 곳에서만** 수행한다.
- `@Autowired` 속성 주입은 `design:type` 없이 동작할 수 없으므로 토큰 명시형 `@Autowired(TOKEN)`만 허용하거나 제거한다.

### 3.2 등록: 명시적 목록

```ts
// src/core/initializeBridges.ts
export const CORE_BRIDGES = [MotionBridge, PhysicsBridge, WorldBridge, AnimationBridge, NetworkBridge, UIBridge] as const;
export function initializeBridges(registry = BridgeRegistry): void { ... }
```

- 데코레이터는 메타데이터(도메인 이름)만 붙이고 등록은 `initializeBridges`가 한다.
- 같은 도메인 이름을 두 번 등록하면 throw한다.
- `DomainBridge`는 하나만 남기고 `blueprint/BridgeDecorators.ts`의 동명 정의와 `RegisterBridge`를 삭제한다.
- `WarriorEntity.ts`의 잘못된 데코레이터를 제거한다(또는 파일 삭제, 사용처 0).

### 3.3 스냅샷 fast path

- `AbstractBridge.snapshot()`: 미들웨어와 이벤트 핸들러가 없으면 `createSnapshot`만 호출한다.
- 이벤트 객체가 필요할 때도 인스턴스 필드 하나를 재사용한다.
- `Date.now()` 대신 프레임 시간(스케줄러 제공)을 쓴다.
- `@LogSnapshot`, `@Profile`은 개발 모드 플래그가 켜진 경우에만 래핑한다(데코레이터 적용 시점에 분기, 호출 시점 분기 아님).
- `PhysicsBridge`, `WorldBridge` 스냅샷을 in-place 갱신으로 바꾼다. 기준은 `MotionBridge.ts:93-118`.

### 3.4 커널 역의존 제거

- `useEntity.ts`를 `motions/hooks/`로 이동한다. boilerplate에는 도메인 무관 부분만 남긴다.

## 4. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 13-a | `console.warn` → logger, `WarriorEntity` 데코레이터 제거, 중복 등록 throw | 커널 테스트 |
| 13-b | 스냅샷 fast path와 이벤트 객체 재사용 | 할당 테스트: 핸들러 없음 → 0 |
| 13-c | `PhysicsBridge`, `WorldBridge` in-place 스냅샷, `@LogSnapshot`/`@Profile` 개발 모드 한정 | 스냅샷 identity 테스트 |
| 13-d | `initializeBridges` 명시 목록, 데코레이터 등록 부수효과 제거, `DomainBridge` 단일화 | `test:package`에서 소비자 번들이 6개 브리지를 등록 |
| 13-e | `useBridgeEntity` 도입, `ManagedEntity` 계열 삭제 (사용자 확인) | 공개 API 테스트 갱신 |
| 13-f | `useEntity` 이동 | boilerplate에서 도메인 import 0 |
| 13-g | `CLAUDE.md`의 "표준 경로" 서술 교정 | 사용자 확인 후 반영 |

## 5. 공개 API 영향

- 삭제: `ManagedEntity`, `useManagedEntity`, `useBatchManagedEntities`, `RegisterBridge`, blueprint `DomainBridge` 중복 export.
- 추가: `useBridgeEntity`, `initializeBridges`(이미 있다면 시그니처 변경), `CORE_BRIDGES`.
- `useEntity`의 import 경로 변경(루트 export는 유지).

## 6. 검증과 완료 기준

- boilerplate 테스트, memory 테스트, `test:package`
- 스냅샷 경로 할당: 정지 상태에서 브리지당 프레임 할당 0 (테스트로 검증)
- `layer-auditor`: boilerplate → 도메인 import 0

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 외부 사용자가 `useManagedEntity`를 사용 중 | 1.x에서 deprecated + 경고, 2.0에서 삭제 |
| 등록 순서 변경으로 초기화 타이밍 변화 | `initializeBridges`를 루트 엔트리에서 한 번 호출, 멱등 |

## 8. 열린 질문

1. `ManagedEntity` 삭제(권장)와 수정 중 선택.
2. `@Autowired` 속성 주입 자체를 없앨지, 토큰 명시형으로 남길지.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 13-a | 완료 | `BridgeRegistry`, `SystemRegistry`의 `console.warn`을 logger로. `WarriorEntity`의 잘못된 `@DomainBridge('motion')` 제거. 중복 등록 throw는 HMR 재평가를 깨뜨릴 수 있어 경고 유지 |
| 13-b | 완료 | `AbstractBridge`가 핸들러와 미들웨어가 없으면 execute/snapshot 이벤트 객체를 만들지 않는다 |
| 13-c | 부분 | `PhysicsBridge` 스냅샷을 제자리 갱신으로 바꾸고 `@LogSnapshot`/`@CacheSnapshot` 제거. `WorldBridge`는 배열 참조 변경에 의존하는 구독자가 있어 보류 |
| 추가 | 완료 | React 훅을 제외한 `@core/boilerplate/engine` 배럴. Layer 1 motions 파일의 값 import를 이쪽으로 옮김 |
| 13-d ~ 13-g | 미착수 | 공개 API 삭제가 포함되어 사용자 확인 필요 |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
