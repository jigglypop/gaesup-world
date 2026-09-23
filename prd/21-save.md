# PRD-21 저장

| 항목 | 값 |
|---|---|
| 우선순위 | P1 (21-a는 P0: 데이터 손실 위험) |
| 트랙 | Fast |
| 선행 PRD | 없음 (21-c는 10) |
| 관련 active plan | `save-hydration-preparation` |

## 1. 배경과 문제

### 1.1 잘 되어 있는 것
`save/core/SaveSystem.ts`: 중복 키 거부, prepareHydrate → apply 2단계, 마이그레이션 버전 단조 검증, `restoreGeneration`으로 중단된 load 폐기, 슬롯별 쓰기 직렬화, 진단 리스너. 도메인별 prepareHydrate 검증(`walletStore`, `shopStore`).

### 1.2 문제
| ID | 내용 | 근거 |
|---|---|---|
| S-01 | visit 스냅샷이 로컬 월드 바인딩에 바로 hydrate. 방문 전 백업 없음, 방문 중 오토세이브 차단 없음 → 남의 월드가 `main` 슬롯에 저장될 수 있음 | `visit/useVisitRoom.ts:91`, `visit/serializer.ts:99`, `save/hooks/useAutoSave.ts` |
| S-02 | visit 적용이 원자적이지 않음 (prepareHydrate 미사용, 도메인별 try/catch 부분 적용) | `visit/serializer.ts:98-103` |
| S-03 | 레거시 저장 경로 `SaveLoadManager`(localStorage, gzip), `persistenceSlice`가 SaveSystem 우회 | `world/persistence/SaveLoadManager.ts`, `world/stores/persistenceSlice.ts:67-105` |
| S-04 | 스냅샷 도메인 목록 하드코딩. 플러그인이 `saveExtensionId`를 바꾸면 스냅샷과 visit에서 조용히 빠짐 | `platform/snapshot.ts:3-30`, `economy/plugin.ts:38-39` |
| S-05 | plugin이 없는 도메인(dialog)은 저장 대상 아님 | - |
| S-06 | 런타임은 setup 이후 추가된 플러그인의 save 바인딩을 연결하지 않음 | `runtime/createGaesupRuntime.ts:146` |

## 2. 목표 / 비목표

### 목표
1. 저장 경로를 `SaveSystem` 하나로 만든다.
2. 외부 데이터(visit, 네트워크 스냅샷, 파일 가져오기)를 적용할 때 로컬 저장본을 보호한다.
3. 모든 적용은 2단계 트랜잭션이다.
4. 저장 대상 도메인 목록은 플러그인 메타데이터에서 파생된다.

### 비목표
- 클라우드 저장 백엔드 구현. 어댑터 인터페이스만 둔다.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `SaveSystem.withIsolatedSession(fn)`: 진입 시 현재 바인딩 상태 메모리 백업, 오토세이브 중단, 종료 시 복원 |
| FR-2 | visit 적용은 `SaveSystem.applyExternal(snapshot, { domains, isolated: true })`로만. 내부에서 prepareHydrate 전체 → apply 전체 |
| FR-3 | 스냅샷 도메인 분류(WORLD/PLAYER)를 플러그인 선언(`save: { key, scope: 'world' | 'player' }`)에서 파생 |
| FR-4 | 런타임 `plugins.use()` 이후에도 새 바인딩이 SaveSystem에 연결되거나, 명시적으로 거부되고 진단 이벤트가 발생 |
| FR-5 | 저장 백엔드 어댑터: localStorage(기본), IndexedDB, 사용자 정의(원격) |
| FR-6 | 저장본 내보내기·가져오기(파일). 가져오기도 FR-2 경로 |
| FR-7 | dialog 진행 상태 저장 여부 결정 후 필요 시 바인딩 추가 |
| NFR-1 | 저장본 로드 실패 시 현재 상태 불변 (테스트) |
| NFR-2 | 격리 세션 종료 후 상태가 진입 전과 깊은 비교로 동일 |

## 4. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 21-a | S-01, S-02: 격리 세션과 `applyExternal`, visit 전환 | 방문 → 오토세이브 트리거 → 이탈 → main 슬롯이 방문 전과 동일 |
| 21-b | S-04: 플러그인 선언 기반 스냅샷 도메인 | `saveExtensionId` 변경 테스트 |
| 21-c | S-03: 레거시 경로 삭제 (PRD-10 10-i와 같이) | 공개 API 테스트 |
| 21-d | S-06: 늦은 플러그인 바인딩 처리 | 런타임 테스트 |
| 21-e | 저장 백엔드 어댑터와 IndexedDB | 대용량 저장본 테스트 |
| 21-f | 내보내기·가져오기 | 에디터 UI |

## 5. 공개 API 영향

- 추가: `withIsolatedSession`, `applyExternal`, 저장 백엔드 어댑터 타입, 플러그인 `save.scope`.
- 삭제: `SaveLoadManager` 계열(2.0).

## 6. 검증과 완료 기준

- save, runtime, networks(visit), plugins 테스트
- memory 테스트

## 7. 열린 질문

1. 기본 저장소를 localStorage에서 IndexedDB로 바꿀 것인가. 월드 문서가 커지면 localStorage 한도(약 5MB)에 걸린다.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 21-a | 완료 | `useVisitRoom`이 첫 적용 전에 로컬 도메인 복원 지점을 만들고 오토세이브를 중단. `leaveVisit`, 방문 호스트의 leave, 세션 변경·언마운트에서 복원. 적용은 prepareHydrate 기반 원자 모드. `suspendAutoSave`/`isAutoSaveSuspended`, `captureVisitRestorePoint` 추가 |
| 나머지 | 미착수 | |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
