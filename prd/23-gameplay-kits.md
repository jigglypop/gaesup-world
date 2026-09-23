# PRD-23 게임플레이 킷

| 항목 | 값 |
|---|---|
| 우선순위 | P2 (23-a는 P1: PRD-22 서버 격리의 전제) |
| 트랙 | Epoch |
| 선행 PRD | 12 (스크립트에서 킷 서비스 사용) |
| 관련 도메인 | npc, quests, inventory, items, economy, farming, crafting, dialog, time, weather, town, mail, relations, events, gameplay, catalog, content, audio |

## 1. 배경과 문제

- 게임플레이 도메인은 전부 "Zustand 스토어 + plugin.ts" 형태다. 브리지가 없고, Layer 1 `core/`가 있는 도메인은 npc, quests, dialog, time, audio뿐이다.
- 스토어 간 `getState()` 직접 호출이 30여 파일에 있다. 예: `quests/stores/questStore.ts`(8회: inventory, wallet, friendship, time), `gameplay/events/registry.ts`(9회), `economy/stores/shopStore.ts`(6회).
- 좋은 선례: `dialog/stores/runtimeAdapter.ts`가 다른 도메인 접근을 `DialogRuntimeAdapter` 포트로 모았다.
- Layer 1 위반: `npc/core/blueprint.ts:1-2,160-163`이 `useQuestStore`/`useFriendshipStore`를 import해 `getState()` 호출.
- "하루 = 1440분" 계산이 여러 곳에 흩어져 있다: `quests/stores/questStore.ts:83`, `catalog/hooks/useCatalogTracker.ts:12`, `weather/hooks/useWeatherTicker.ts:11,19-20`, `dialog/stores/runtimeAdapter.ts:10`. 상수는 `time/core/Clock.ts:8`에 있다.
- time, weather, audio `plugin.ts`(각 59줄)가 이름만 다른 복제. `createStoreDomainPlugin`은 20개 중 12개만 사용.
- `createEconomyPlugin`은 공개되어 있지만 `examples/`에서 사용처 0 (examples 도달 계약 위반).
- 환불 시 회계 왜곡: `shopStore.ts:94-97`, spend 후 인벤토리 추가 실패 시 `wallet.add(price)` → lifetimeSpent와 lifetimeEarned 모두 증가.
- 상점 재고 생성 경로 없음 (추정): `rollDailyStock` 호출처 0, 기본 `dailyStock: []`.
- `npc/stores/npcStore.ts` 973줄.

## 2. 목표 / 비목표

### 목표
1. 도메인 간 접근은 포트(서비스 인터페이스)로만 한다. 스토어는 자기 도메인만 안다.
2. 게임 규칙(구매, 퀘스트 완료 보상, 제작)은 순수 명령 핸들러로 만들어 클라이언트와 서버에서 같이 쓴다.
3. 생활형 기능을 **cozy kit**으로 묶어 코어와 분리한다.
4. 스크립트(PRD-12)가 킷 서비스를 `ctx.services`로 쓴다.

### 비목표
- 게임 디자인 변경(밸런스, 보상 수치). 테스트 기대 수치 변경은 사용자 확인.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | 서비스 포트 정의: `InventoryService`, `WalletService`, `QuestService`, `FriendshipService`, `ClockService`, `NotifyService`, `DialogService` |
| FR-2 | 각 플러그인이 자기 서비스를 `ctx.services`에 등록. 다른 도메인은 서비스 키로 조회 |
| FR-3 | `gameplay/events/registry.ts`의 기본 핸들러가 서비스만 사용 (dialog/ui 배럴 import 제거) |
| FR-4 | 명령 핸들러 순수화: `buy(state, cmd) → { state, events }` 형태로 economy, inventory, quests 보상 |
| FR-5 | 시간 계산 헬퍼 `clock.minutesPerDay`, `clock.dayOf(minutes)`로 통일 |
| FR-6 | 반복 플러그인을 `createStoreDomainPlugin`으로 통일 |
| FR-7 | 환불은 `wallet.refund(amount)`로 lifetime 통계 보정 |
| FR-8 | 상점 재고: 날짜 변경 이벤트에서 `rollDailyStock` 호출 (의도 확인 후) |
| FR-9 | cozy kit 서브패스(`gaesup-world/kits/cozy` 또는 기존 `./gameplay` 확장)와 `createCozyKit()` 번들 플러그인 |
| FR-10 | 공개 플러그인은 모두 examples에서 사용 |
| NFR-1 | 킷 도메인 스토어 파일에서 다른 도메인 스토어 import 0 (린트) |
| NFR-2 | 순수 명령 핸들러는 React, zustand, three 무관 (Node에서 실행) |

## 4. 설계

```
src/core/<domain>/
  core/commands.ts    순수 핸들러 (서버·클라이언트 공용)
  services.ts         서비스 포트 구현 (스토어 감쌈)
  stores/             자기 도메인 상태만
  plugin.ts           서비스 등록, save 바인딩, runtime: 'both'
src/kits/cozy/index.ts  createCozyKit(): inventory, economy, quests, farming, crafting, town, mail, catalog, relations
```

- 서비스 포트 타입은 `plugins/types.ts`의 확장 맵에 선언 병합으로 추가한다(이 파일에서 `interface`가 필요한 이유).
- dialog `runtimeAdapter`를 서비스 포트 방식의 기준으로 삼는다.

## 5. 단계별 작업

| Slice | 트랙 | 내용 | 완료 기준 |
|---|---|---|---|
| 23-a | Epoch | `gameplay/events/registry` 서비스화 (PRD-22 22-b) | server-contracts 가드 테스트 |
| 23-b | Fast | 시간 헬퍼 통일, 환불 보정, 상점 재고 확인 | 도메인 테스트 |
| 23-c | Fast | time/weather/audio 플러그인 통합 | 플러그인 테스트 |
| 23-d | Epoch | 서비스 포트 7종과 등록 | 서비스 테스트 |
| 23-e | Epoch | quests, shop, mail, crafting의 스토어 간 호출을 서비스로 교체 | NFR-1 린트 |
| 23-f | Epoch | `npc/core/blueprint.ts` Layer 1 위반 해소, `npcStore` 분할 | layer-auditor |
| 23-g | Epoch | economy/inventory 순수 명령 핸들러 (PRD-22 22-g와 공유) | Node 테스트 |
| 23-h | Epoch | cozy kit 번들과 서브패스, economy 예제 연결 | examples 도달 |

## 6. 공개 API 영향

- 추가: 서비스 포트 타입, `createCozyKit`, 순수 명령 핸들러.
- 서브패스 추가 시 6파일 동시 수정 절차.

## 7. 검증과 완료 기준

- 게임플레이 도메인 전체 테스트, publicApi, packageExports
- examples에서 cozy kit 한 번에 등록해 상점·퀘스트·농사 흐름 동작

## 8. 열린 질문

1. cozy kit을 별도 서브패스로 둘지, `./gameplay`에 합칠지.
2. 상점 재고가 비어 있는 것이 의도인가.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 23-a | 완료 | `GameplayEventServices` 포트. 기본 레지스트리는 서비스가 있을 때만 스토어 의존 핸들러를 등록. 클라이언트 진입점의 `GameplayEventEngine`, `getGameplayEventRegistry`가 스토어 서비스를 설치(모듈 부수효과에 의존하지 않음) |
| 23-b | 부분 | `dayOfTotalMinutes`, `TIME_CONSTANTS`로 하루 계산 통일(4곳). `walletStore.refund`로 환불 회계 보정. 상점 재고 자동 생성은 `ShopUI` 테스트 계약과 충돌해 의도 확인 필요 |
| 23-c | 완료 | time, weather, audio 플러그인을 `createStoreDomainPlugin`으로 통일 |
| 23-f | 미착수 | `npc/core/blueprint.ts`의 스토어 결합은 기존 테스트 준비 코드 변경이 필요해 보류 |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
