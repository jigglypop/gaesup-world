# PRD-90 로드맵

작성일: 2026-09-24
개정: 2026-09-24 2차(작업 순서 점검, 30~32 PRD 반영, M0 진행 상태 기록)

## 1. 단계

| 단계 | 이름 | 목표 | 종료 조건 |
|---|---|---|---|
| 0 | 선행 정리 | 작업 트리 커밋 분리, 결정 게이트 확정 | 커밋 분리 완료, 5절 게이트 확정(2026-09-24 완료) |
| M0 | 정확성·검증 복구 | 결함 수정, verify 녹색, 기준선 측정 | D-01~D-23 재현 테스트 존재, 치명 결함 수정, `pnpm verify` 통과, 00 문서 3.2절 기록 |
| M1 | 측정 게이트와 저비용 개선 | 회귀 게이트 가동, 삭제로 표면 축소, 구조 변경 없이 얻는 성능 | `perf:check` CI 가동, 10 PRD 예산 중 CI 판정 항목의 절반 이상 충족, knip baseline 감소 |
| M2 | 구조 전환(Epoch) | kernel·kit 분리, 인덱스·컬링·입력·저장, 엔진 모델(30~32) | 10 PRD 예산 전체 충족, NFR-20·21·22·30·31 충족 |
| M3 | 2.0 major | deprecated 제거, CJS 제거, 패키지 경계 확정 | export snapshot 갱신, 마이그레이션 가이드, peer 매트릭스 통과 |

## 2. 0단계 선행 정리

| 항목 | 내용 | 이유 |
|---|---|---|
| 0-a | 작업 트리 171파일을 커밋 4개로 나눈다: ① docs·`.codex` 삭제와 참조 정리(D-19) ② D-xx 수정과 테스트 ③ minihome farm 예제·자산 ④ PRD. 사용자 확인 후 진행 | 이후 slice PR의 diff 기준선이 된다. 섞여 있으면 회귀 원인을 추적할 수 없다 |
| 0-b | 5절 결정 게이트 확정(완료) | M0 잔여 항목이 이 결정에 막혀 있었다 |

## 3. slice 배치

### M0 정확성·검증 복구

| Slice | 내용 | PRD | 상태(2026-09-24 2차) |
|---|---|---|---|
| 25-a | harness·docs 참조 정리(D-19) | 25 | 작업 트리에서 해소, 0-a 커밋 대기 |
| 25-b, 10-b | 벽시계 테스트 교체(D-20), 느린 테스트 Program 재사용 | 25, 10 | 부분. 벽시계 패턴 9곳 잔여 |
| 11-a | automation 재귀(D-01), 이월 상한(D-10) | 11 | D-01 완료. D-10 부분(설정 주입은 11-f) |
| 12-a | collider 가시성 분리(D-03), bounding sphere(D-15) | 12 | 완료 |
| 12-p | NPC toon 재질 누수(D-23) | 12 | 신규 |
| 32-a | 자동 ID UUID화(D-22) | 32 | 신규 |
| 23-a, 23-b, 23-c | ratchet 카운터, 미사용 decorator·ManagedEntity 삭제(D-02), `reportError` | 23 | D-12, D-16 완료. D-02는 G3, D-04는 G2 대기 |
| 14-a, 14-b, 14-c | 원격 아바타 격리(D-05), authority·visit(D-06, D-07), 슬롯·wasm·로더(D-08, D-13, D-14) | 14 | D-05, D-13 완료. D-06, D-14 부분. D-07은 G4, D-08은 G5 대기 |
| 21-a | canonical ADR, D-09, D-18 | 21 | D-09 완료. D-18은 G6 대기 |
| 22-b | 전역 접지 상태(D-17), autoSaveSuspension 인스턴스화 | 22 | 구조 작업(M2 초반) |
| 10-a | 기준 장면과 기준선 측정 | 10 | 미착수 |

### M1 측정 게이트와 저비용 개선

위에서 아래 순서로 진행한다. 같은 묶음 안은 병렬로 진행할 수 있다.

| 묶음 | Slice | 내용 | PRD |
|---|---|---|---|
| 1. 삭제로 표면 축소 | 24-a → 24-e, 23-b | knip baseline, 미사용 28파일·코드 삭제, 미사용 decorator 삭제 | 24, 23 |
| 2. 결정적 카운터로 검증하는 성능(10-a와 병행) | 12-q, 13-k, 11-j, 11-h, 11-l, 12-r, 12-s, 13-c | WebGPU 섀도 순회 제거, 성능 수집기 조건부, 카메라 narrow phase, 물리 중복 읽기, setter·색·스캔, NPC LOD, TSL time, devtools·usePlayerPosition | 11, 12, 13 |
| 3. 측정이 필요한 성능(10-a 이후) | 11-b, 11-c, 11-d, 11-e, 11-k, 12-b, 12-c, 13-a, 13-b, 14-d | 카메라 캐시, 저빈도 publish, 건물 collider, memo, 품질 프로파일, hover·NPC, 네트워크 identity | 11, 12, 13, 14 |
| 4. 구조 준비(작고 독립) | 20-a, 20-b, 20-h, 22-a | lint patterns, npc/core port, 입력 타입 이동, typed 서비스 키 | 20, 22 |
| 5. 게이트 | 10-c, 10-d, 10-e, 25-c, 25-d, 15-a, 15-b | 비교 스크립트, CI 게이트, check 연결, 엔트리 폐포 ratchet | 10, 25, 15 |

### M2 구조 전환

| 흐름 | slice 순서 | 순서 근거 |
|---|---|---|
| kernel·kit | 20-h → 20-f(kernel) → 22-g → 20-i(port: 날씨 → 지면) → 22-h(kit 자체 등록) → 20-j | port와 서비스 키를 kernel에 두어야 도메인이 kernel만 보고 의존을 끊을 수 있다. kit 등록(22-h)은 `runtime.get`(22-g)이 전제다 |
| boilerplate | 20-f(`frameTime` 이동) → 23-c → 23-d → 23-e → 23-f → 23-g → 23-h → 15-g | `runtime/frame`이 `boilerplate/hooks/frameTime`을 import하므로 먼저 kernel로 옮긴다 |
| building 데이터 | 13-d → 30-a → 13-e → 12-e → 12-f → 13-j | 13-e의 delta는 30-a objectId delta와 같은 형식으로 만든다. 12-f batch는 공용으로 만들어 30-d가 재사용한다 |
| 프레임·시스템 | 11-f → 31-a → 11-g → 31-f(13-e 이후) | `defineSystem` fixed lane은 통합된 물리 시계 위에 올린다. Driver는 delta를 소비하므로 13-e 이후 시스템으로 옮긴다 |
| 엔티티 | G1 → 14-h → 30-b → 30-c(31-a, 22-g 이후) → 30-d(12-f 이후) → 30-e → 30-f(21-g, 13-j 이후) → 30-g | `EntityWorld`는 문서 증분 검증, 시스템 등록, 서비스 등록 위에 올린다 |
| 모드·스크립트 | 22-b → 31-c(11-f 이후) → 31-d → 31-b(30-a 이후) → 31-e(13-j 이후) → 31-g | play 중 autosave 중단은 SaveSystem 인스턴스 상태(22-b)가 필요하다. `isInEditMode` 교체는 buildingEditorStore 분리(13-j) 후 |
| world model | 14-h → 21-f → 21-g | 기존 |
| 에셋·프리팹 | 14-c → 14-i → 32-b → 32-c → 32-d → 32-e → 32-f → 32-g(30-c 이후) | `resolve`는 통합 GLTF 캐시(14-i) 위에 둔다 |
| 입력 | 20-h → 13-h → 11-d 후속 정리 | 입력 소유 도메인을 먼저 정하고 store 밖 경로를 만든다 |
| 에디터·NPC UI | 13-f → 13-g → 24-c | 기존 |
| GPU 경로 | 12-h → 12-i → 12-j → 12-g → 12-k → 12-l → 12-m → 12-o | 기존 |
| 네트워크 | 14-e → 14-f → 14-j → 21-h | 기존 |
| 저장 | 14-g → 21-c | 기존 |
| 번들 | 15-c → 15-d → 15-e → 15-f | 기존 |
| 툴링 | 25-e → 25-f → 25-g → 25-h → 25-i | 기존 |
| 모듈 | 24-b → 24-d → 24-g | 24-g는 kernel(20-f) 이후 |
| 단일화 | 21-b → 21-d → 21-e → 21-i → 21-j → 21-k | 기존 |

### M3 2.0 major

| Slice | 내용 | PRD |
|---|---|---|
| 15-h | CJS 제거 | 15 |
| 15-d 후속 | 루트 editor re-export 제거 | 15 |
| 15-i, 15-j | `three-stdlib` 제거, peer 정리, 샘플 GLB 분리 | 15 |
| 21 후속 | `SaveLoadManager`, `createPersistenceSlice`, `BuildingUI`, world slice 제거, 중복 이름 정리 | 21 |
| 22-f | legacy store와 정적 `getState` 제거, `GaesupRuntime` store 필드 제거 | 22 |
| 24-h | 공개 중복 이름·명칭 정리 | 24 |
| 30-g 후속 | `src/blueprints` 제거 | 30 |
| 31 후속 | buildingStore 편집 모드 API 제거 | 31 |
| 32 후속 | `ContentBundle` 제거 | 32 |
| 12-n | TSL 수렴, GLSL compat 경계 | 12 |
| 14-k | binary codec | 14 |
| 11-i | 카메라 충돌 Rapier shape cast | 11 |
| 25-j | 컴파일러 단일화 | 25 |

## 4. 의존 관계

```
0-a ─► M0 전체
00 ─► 10 ─┬─► 11 ─► 11-f ─┬─► 31-a ─► 30-c
          │               └─► 31-c ─► 31-d
          ├─► 12 ─► 12-f ─► 30-d
          ├─► 13 ─► 13-d ─► 13-e ─► 31-f
          │          30-a ─┘   13-j ─► 31-e, 30-f
          ├─► 14 ─► 14-h ─► 30-c, 21-g ─► 30-f
          │         14-i ─► 32-b
          └─► 15 ◄── 20, 23
20-h ─► 20-f(kernel) ─┬─► 22-g ─► 22-h, 30-c
                      ├─► 20-i
                      └─► 23-c..h ─► 15-g
22-b ─► 31-c
G1(SceneDocument canonical) ─► 30-c, 21-g
25-a ─► 20-b, 23-a (verify가 녹색이어야 ratchet이 의미 있음)
```

## 5. 결정 게이트

2026-09-24 확정. 사용자가 합리적인 방식으로 확정하도록 위임했다. 기준은 셋이다. 기존 소비자 동작을 minor에서 깨지 않는다. 보안 기본값은 안전한 쪽으로 두되 파괴적 변경은 major에서 한다. 엔진 동작은 유니티를 따른다.

| 게이트 | 결정 | 막는 slice | 근거 문서 |
|---|---|---|---|
| G1 | world model canonical은 `SceneDocument`다. `EntityWorld`는 projection이다 | 21-g, 30-c 이후 전부 | 21 Q1, 30 Q1 |
| G2 | `@HandleError`는 제거한다. 오류는 phase·명령 경계에서 잡고, 유니티처럼 해당 콜백은 다음 프레임에도 계속 실행한다. 보고는 항목별 첫 오류와 이후 1초당 최대 1회 `reportError`로 한다. production 기본 sink는 `console.error`이고 runtime `onError`로 바꿀 수 있다. minor 릴리스 노트에 명시한다 | 23-c, 23-d, 23-e, 23-f | 23 Q1, Q2 |
| G3 | `ManagedEntity`/`useManagedEntity`를 삭제한다(D-02, 공개 API 아님) | 23-b | 00 4.1 |
| G4 | 1.x에서는 `verifyActor`가 없으면 처음 한 번 경고하고, 2.0에서는 기본 거부로 바꾼다(`trustActors: true`로 해제). visit channel에는 transport가 채우는 `senderId`를 추가하고, `VisitLeave`는 `senderId === hostId`일 때만 받는다. `senderId`가 없는 legacy transport는 기존 동작에 경고를 붙인다 | 14-b | 00 4.1 |
| G5 | 자동 저장 슬롯은 월드당 최신 10개만 남긴다(옵션 `maxSlotsPerWorld`) | 14-c | 00 4.1 |
| G6 | `WorldSystem`의 identity 계약(입력 객체를 그대로 보관)을 유지하고 JSDoc에 "위치 변경은 `updateObject` 경유"를 명시한다. `WorldSystem`은 30 PRD `EntityWorld`로 대체될 예정이다 | 21-a | 00 4.1 |
| G7 | `usePlayerPosition` `reactive` 기본값 `true`를 유지하고, 위치가 바뀐 경우에만 재렌더한다 | 13-c | 13 Q1 |
| G8 | `persistPlayChanges` 기본값은 에디터 false, 런타임 true | 31-d | 31 Q1 |
| G9 | `createGaesupRuntime()` 기본값은 모든 kit preset으로 유지한다. engine만 만들려면 `kits: []`를 넘긴다 | 22-h | 22 Q3 |
| G10 | CJS는 2.0에서 제거한다(D-21) | 15-h | 15 |
| G11 | 자동 ID는 UUIDv4(`crypto.randomUUID`)로 한다 | 32-a | 32 Q1 |

### 5.1 기타 열린 질문 결정

| 질문 | 결정 |
|---|---|
| 11 Q1 카메라 충돌 기본값 | 11-b 측정 전까지 `true` 유지 |
| 11 Q2 SkinnedMesh 카메라 충돌 | 제외하지 않고 world bounding sphere로 근사 |
| 12 Q1 기본 water·glass | 시각 결과가 바뀌므로 기본값은 유지하고 옵션만 추가 |
| 12 Q2 readback culling 경로 | 제거하고 CPU 가시성으로 fallback |
| 13 Q2 selector 없는 공개 hook | dev 경고 후 2.0 제거 |
| 21 Q2 `BuildingUI` | editor 섹션을 조합하는 wrapper로 줄이고 `@deprecated` |
| 22 Q1 정적 `getState/setState` | `@deprecated` 후 2.0 제거 |
| 22 Q2 한 페이지 여러 world | 공식 지원 |
| 30 Q2 저장하지 않는 엔티티 | `transient` 플래그로 허용 |
| 30 Q3, 32 Q3 `src/blueprints`, `ContentBundle` | `@deprecated` 후 2.0 제거 |
| 31 Q2 pause 중 네트워크 | 원격 플레이어 보간은 계속 |
| 31 Q3 edit 모드 물리 미리보기 | 옵션, 기본 off |
| 32 Q2 AssetDB 기본 레코드 | 샘플 에셋 패키지의 매니페스트에 둔다 |

## 6. 먼저 할 10개

| 순위 | slice | 이유 |
|---|---|---|
| 1 | 0-a | 섞인 작업 트리에서는 이후 PR의 회귀를 추적할 수 없다 |
| 2 | 32-a | 저장된 씬에 객체를 추가하지 못하는 결함. 수정이 작다 |
| 3 | 12-p | NPC 재질 누수. 수정이 작다 |
| 4 | 12-q, 13-k | production에서 효과 없이 도는 작업 제거. 각 수십 줄 |
| 5 | 11-j, 11-h | 카메라·물리 핫패스의 중복 계산 제거. 작다 |
| 6 | 10-a | 이후 성능 판정의 기준 |
| 7 | 24-a, 24-e, 23-b | 삭제로 이후 구조 작업의 범위를 줄인다 |
| 8 | 20-h, 22-a | kernel과 서비스 키의 준비 단계. 작고 독립적이다 |
| 9 | 11-b, 13-a, 13-b | 기본 활성 기능의 씬 크기 비례 비용, hover·NPC 재렌더 |
| 10 | G1 → 30-a | 엔진 모델의 첫 계약. 13-e보다 먼저 있어야 한다 |

## 7. 2차 점검에서 바뀐 순서

| 변경 | 이유 |
|---|---|
| 13-e를 30-a 뒤로 | building delta와 문서 delta를 한 형식으로 만든다. 먼저 하면 building 전용 delta를 만든 뒤 다시 바꿔야 한다 |
| 12-f batch를 공용으로 | 30-d `meshRenderer`가 같은 batch를 쓴다 |
| 11-f를 31-a, 31-c 앞으로 | fixed lane과 pause gating의 전제 |
| 20-h를 13-h 앞으로 | 입력 경로를 다시 쓰기 전에 소유 도메인을 정한다 |
| 24-e, 23-b를 M1 첫 묶음으로 | 삭제할 코드를 옮기거나 리팩터링하지 않는다 |
| 14-i를 저장 흐름에서 에셋 흐름으로 | AssetDB `resolve`(32-b)의 전제 |
| 20-f를 boilerplate 삭제 앞으로 | `frameTime`이 `runtime/frame`의 의존이라 먼저 kernel로 옮겨야 한다 |

## 8. 운영 규칙

- 한 slice는 한 PR이다. PR 설명에 PRD 번호, slice, 실행한 검증, 10 PRD 지표 변화를 적는다.
- Epoch 트랙 slice는 설계 메모를 해당 PRD 설계 절에 먼저 추가한다.
- 테스트 기대 수치 변경, 공개 API 삭제, peer 변경, 파일 삭제는 사용자 확인 후 진행한다.
- 각 단계 종료 시 00 문서의 기준선 표에 측정일과 커밋을 추가한다.
