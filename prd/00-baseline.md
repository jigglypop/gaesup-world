# PRD-00 현황 진단과 기준선

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Fast |
| 선행 PRD | 없음 |
| 관련 active plan | 전체 9개 (정리 대상) |

## 1. 배경

2026-09-23에 코드 전체를 5개 영역(커널, 캐릭터·물리, 월드·에디터, 게임플레이·네트워크, 품질)으로 나눠 분석했다. 이 문서는 그 결과를 기록하고, 이후 모든 PRD가 비교 기준으로 삼을 **실측 기준선**을 정의한다.

## 2. 규모

| 항목 | 값 |
|---|---|
| `src/core` 도메인 수 | 52 |
| src ts/tsx 파일 | 1,153 |
| `src/core` 코드 | 약 17만 줄 |
| 큰 도메인 | building 2.4만, editor 1.5만, networks 1.4만, boilerplate 1만, motions 9.2천 |
| 테스트 파일 | 290 (src 276, examples 14) |
| 서브패스 export | 15 + style.css |
| active epoch plan | 9 |

## 3. 확인된 버그 (코드로 직접 검증)

| ID | 버그 | 근거 | 영향 | 처리 PRD |
|---|---|---|---|---|
| B-01 | 카메라 충돌 메시 캐시 분기가 죽어 있음 (정정 2026-09-23: 버그가 아니라 성능 비용) | `src/core/camera/utils/camera.ts:45-48`이 `scene._frameId`를 키로 쓰지만 설정하는 코드가 없음. 단 `CameraControllers.test.ts`가 "같은 scene에 나중에 추가된 장애물을 즉시 감지"를 계약으로 요구하므로 매 호출 순회는 의도된 정확성 동작이다. 시간 기반 캐시로 바꾸면 이 테스트가 실패함을 확인했다 | 충돌 기본 활성 시 매 프레임 `scene.traverse`, 배열 할당, 전체 메시 레이캐스트 | 15 |
| B-02 | MotionSystem이 생성만 되고 갱신되지 않음 | `src/core/motions/bridge/MotionBridge.ts:49`에서 생성, `update`/`setGrounded` 호출처 없음 | `jump` 명령 무동작, 잔디 밟힘 효과 고정, `usePlayerPosition`의 `isMoving`/`isGrounded` 항상 false | 14 |
| B-03 | `useManagedEntity`/`ManagedEntity`가 동작 불가 | `ManagedEntity.ts:10-30`의 `@Autowired`가 `design:type`에 의존, `emitDecoratorMetadata: false` | 문서상 표준 경로가 실제로는 throw. 사용처 0곳 | 13 |
| B-04 | `server-contracts` 엔트리가 React UI를 끌어옴 | `src/server-contracts.ts` → `core/gameplay` → `gameplay/events/registry.ts:7-11`이 dialog/ui 배럴과 스토어 import | 서버 번들에 React, R3F, 클라이언트 스토어 싱글턴 포함 | 22, 24 |
| B-05 | 계층 경계 린트가 존재하지 않음 | `eslint.config.js`와 lock 파일에 `eslint-plugin-boundaries` 없음 | Layer 1 → React 간접 import(`PhysicsSystem.ts:7` 경유)를 잡지 못함 | 26 |

## 4. 보고된 위험 (코드 근거 있음, 런타임 미검증)

| ID | 위험 | 근거 | 처리 PRD |
|---|---|---|---|
| R-01 | 플레이어를 `getActiveEntities()[0]`으로 추론 | `usePlayerPosition.ts:57-60`, `grass/manager.ts:217` | 14 |
| R-02 | `useTeleport`가 activeState의 Euler 객체를 호출자 객체로 교체 | `useTeleport/index.ts:86-89` | 14 |
| R-03 | 애니메이션 결정 경로 두 개의 run 조건 불일치 | `AnimationController.ts:12-24` vs `useAnimationPlayer/index.ts:30` | 16 |
| R-04 | visit 스냅샷이 로컬 월드를 덮어쓰고 오토세이브가 영구 저장 | `visit/useVisitRoom.ts:91`, `visit/serializer.ts:98-103` | 21 |
| R-05 | 원격 `modelUrl`을 그대로 `useGLTF`로 로드 | `RemotePlayer.tsx:113,487` | 22 |
| R-06 | 권한 라우터가 actorId, commandId, revision을 검증하지 않음 | `networks/adapter/authority.ts:135-152` | 22 |
| R-07 | `subscribeDefaultAutomation` 리스너가 스토어 재생성마다 누적 | `interactions/stores/slices.ts:153` | 14 |
| R-08 | 이펙트 메시가 인스턴스마다 `useFrame` 등록 | billboard, fire, flag, sakura, water | 11 |
| R-09 | `WorldBridge.createSnapshot`이 호출마다 배열과 클로저 할당 | `WorldBridge.ts:103-121` | 13 |
| R-10 | 상점 재고 생성 경로 없음 (`rollDailyStock` 호출처 없음) | `economy/stores/shopStore.ts` | 23 |

## 5. 구조적 중복

| 영역 | 중복 내용 | 처리 PRD |
|---|---|---|
| 월드 원본 | `buildingStore`, `SceneDocument`, `WorldSystem`, 레거시 `worldStates` 슬라이스 | 10 |
| 저장 | `SaveSystem` vs `SaveLoadManager`/`persistenceSlice` | 10, 21 |
| 공간 인덱스 | `buildingStore.tileIndex/wallIndex`, `PlacementEngine`, `world/core/SpatialGrid` | 10 |
| 건설 UI | `building/components/BuildingUI` vs `editor/.../BuildingPanel` | 18 |
| 브리지 등록 | `DomainBridge` 2개 정의 + `RegisterBridge` | 13 |
| world 슬라이스 | `worldStates/slice.ts` vs `world/stores/slices.ts` | 10 |
| 애니메이션 결정 | `AnimationController` vs `useAnimationPlayer` | 16 |
| 네트워크 프로토콜 | snake_case WebSocket, `NetworkMessageEnvelope`, visit wire | 22 |
| 플러그인 | time/weather/audio `plugin.ts` 복제 | 23 |

## 6. 규칙 준수 지표 (정적 측정, 2026-09-23)

| 지표 | 값 | 목표 (2.0) |
|---|---|---|
| `interface` 선언 | 494건 / 166 파일 | 신규 코드 0, 기존은 만지는 파일부터 감소 |
| 크기 상한 초과 파일 | 58 (tsx 45, ts 13) | 30 이하 |
| `any` (blueprints, 테스트 제외) | 0 | 0 유지 |
| `console.*` (logger 제외) | 약 10 | 0 |
| 테스트 없는 도메인 | effects, error, input, items, ops, tools, types, wasm | 0 |
| raw `useFrame` | 약 20곳 이상 | 0 (PRD-11 완료 후) |

크기 초과 상위: `editor/.../BuildingPanel/brain/index.tsx` 2142, `building/stores/buildingStore.ts` 1686, `building/components/BuildingUI/index.tsx` 1554, `building/components/TileSystem/index.tsx` 1047, `npc/stores/npcStore.ts` 973.

## 7. 실측 기준선 (미측정, 이 PRD의 작업 대상)

2026-09-23 분석 시점에 `node_modules`가 없어 tsc, jest, eslint가 실행되지 않았다. 다음을 측정해 이 문서 8절에 기록한다.

| 지표 | 명령 | 기록 항목 |
|---|---|---|
| 타입 (src) | `pnpm exec tsc -p tsconfig.build.json --noEmit` | 에러 수 |
| 타입 (examples 포함) | `pnpm exec tsc --noEmit` | 에러 수 |
| 전체 테스트 | `pnpm test -- --runInBand` | suites, tests, 실패 목록, 소요 시간 |
| 메모리 테스트 | `pnpm test:memory` | 통과 수 |
| 린트 분포 | `pnpm exec eslint src --format json` | 규칙별 상위 15개 건수 |
| 패키지 소비 | `pnpm test:package` | 통과 여부 |
| 데모 빌드 | `pnpm test:demo` | 초기 청크 수, JS 바이트 |
| 브라우저 | `pnpm test:browser` | 통과 여부 |
| 프레임 | 데모 World 60초 주행 | 평균 FPS, 프레임당 GC, draw call (측정 방법은 PRD-26) |

## 8. 기준선 기록

| 지표 | 값 | 측정일 | 기준 |
|---|---|---|---|
| 타입 (src) | 에러 0 | 2026-09-23 | 348f9b35 |
| 타입 (examples 포함) | 에러 0 | 2026-09-23 | 348f9b35 |
| 린트 (`eslint src examples`) | 에러 0, 경고 0. `CLAUDE.md`의 "약 3,457건 실패" 서술은 현재 사실이 아니다 | 2026-09-23 | 348f9b35 |
| 전체 테스트 | 297 suites 통과, 1 skipped / 2,693 tests 통과, 1 skipped, 약 97초 | 2026-09-23 | 348f9b35 + PRD-16 구현 |
| 메모리 테스트 | 5 suites / 88 tests 통과 | 2026-09-23 | 348f9b35 + PRD-16 구현 |
| 패키지 소비, 데모 빌드, 브라우저 | 미측정 | - | - |

참고: 작업 전 원본 커밋 상태의 전체 테스트는 실행이 중간에 멈춰 수치를 얻지 못했다. 위 전체 테스트 수치는 PRD-16 구현이 들어간 작업 트리 기준이다.

## 9. 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 00-a | `pnpm install --frozen-lockfile` 후 7절 전체 측정 | 8절 표 채움 |
| 00-b | active plan 9개 분류: 완료(close), 보류(archive), 유지 | active 3개 이하 |
| 00-c | `CLAUDE.md` 사실 오류 교정: boundaries 린트 서술, `useManagedEntity` 표준 경로 서술, 린트 실패 건수 | 사용자 확인 후 반영 |
| 00-d | `todolist.md`의 Unity Gap Checklist를 이 PRD 세트로 연결 | 체크리스트 각 항목에 PRD 번호 표기 |

## 10. 열린 질문

1. active plan 9개 중 계속 진행할 것은 무엇인가. 특히 `SPATIAL_RUNTIME_FOUNDATIONS`, `epoch-6a-scene-document-canonical-command-path`는 PRD-10과 범위가 겹친다.
2. `CLAUDE.md` 교정은 이 PRD 작업으로 진행해도 되는가.
