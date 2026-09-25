# gaesup-world PRD

작성일: 2026-09-26 · 기준: `main` 050463ca

## 1. 방향

- 지금 트랙은 소프트웨어 공학 정리다(3절). 항목 하나를 끝낼 때마다 커밋 하나와 채팅 보고 하나를 남긴다.
- 그다음은 상급 결함(4절)과 성능(5절)이다. 예제 화면에서 달라지는 것부터 한다.
- 끝난 slice는 이 문서에서 지운다. 기록은 git log(커밋 제목 끝의 ID)에 있다.

## 2. 규칙

| 규칙 | 내용 |
|---|---|
| 완료 판정 | slice마다 결정적 완료 기준(테스트, 카운터, 수용 시나리오)을 둔다. 기준이 없으면 착수하지 않는다 |
| 수용 시나리오 | 정의·예산·상태는 `test/accept/budgets.json` 하나에 둔다. 이 문서에 복제하지 않는다 |
| 확인 후 변경 | 공개 API 삭제와 peer 의존성 변경은 먼저 묻는다. 파일 삭제, 틀린 동작을 고정한 테스트의 기대값 수정, 일반 의존성 제거는 보고에 적고 진행한다 |
| 위치 표기 | 경로는 `src/core/` 기준이다. 줄 번호 대신 파일과 심볼 이름을 쓴다 |

## 3. SE 항목

위에서 아래 순서로 한다.

### SE-2 테스트 판정력

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-2a | PRD 의존 제거. `test/accept/catalog.test.ts`는 budgets.json과 구현(헤드리스 `acceptScenario` 등록, 브라우저 suite)을 대조한다. `/accept` 마일스톤 보드와 파서를 지운다 | catalog 테스트 통과, `build:demo` 통과 |
| SE-2b | 예산 범위 `{min,max}`, 비유한 측정값은 미측정으로 판정. S-H10은 정확히 1, S-H13 정지 송신에 하한 | 범위·미측정 판정 단위 테스트, S-H10·S-H13 green |
| SE-2c | 브라우저 러너: budgets.json에 있는데 페이지에 없는 시나리오와 `--only` 오타는 오류, 시나리오별 제한 시간, 레거시 WebGL program 계측, `--software`는 WebGL 설정으로 실행 | `pnpm accept` 전체 실행 판정이 직전 보고와 같음 |
| SE-2d | 공허하게 통과하는 단위 테스트 정리(빈 시드로 통과하는 ItemRegistry 테스트) | 해당 테스트 삭제 또는 실제 검증 |

### SE-3 검증 규칙 단일화

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-3a | 저장 도메인마다 검증 함수 하나. 값 변경 API와 `prepareHydrate`가 같은 함수를 쓴다(mail, relations, town, economy, farming, catalog). gameplay flag의 NaN이 serialize를 막지 않게 한다 | hydrate가 거부할 값을 변경 API도 거부하는 테스트, 저장→로드 왕복 |
| SE-3b | `SaveSystem` 로드 실패를 도메인 단위로 격리해 보고한다. 저장본에 없는 도메인은 빈 상태로 초기화한다 | 한 도메인이 깨진 슬롯에서 나머지가 로드되는 테스트, 슬롯 간 상태 섞임 재현 테스트 |
| SE-3c | 스택 용량 계산을 inventory 함수 하나로(상점·퀘스트·제작·농사의 복제 4곳 제거), `ItemRegistry.register`에서 정의 검증 | 문자열 `maxStack` 구매 재현 테스트 |
| SE-3d | 원격 모델 URL 검증 하나(URL 파서 기반 origin·path prefix). `networks/core/remoteInputLimits`와 `PlayerNetworkManager.isSafeModelUrl` 통합 | `/\evil.com`, 탭 삽입, 앞 공백 `javascript:` 거부 테스트 |
| SE-3e | `-0` 정리 함수 하나를 기즈모(`TransformGizmo`), Unity 변환, `scene-object/transforms`가 공유 | 기즈모 회전 결과가 `updateObject`를 통과하는 테스트 |
| SE-3f | 원격 transform 크기 상한과 쿼터니언 정규화, authority 명령 입력 스키마와 `commandId` 필수 | 비유한·거대 값, `commandId` 없는 명령 거부 테스트 |

### SE-4 building 형상·좌표 단일화

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-4a | 벽·블록·타일마다 footprint 함수 하나를 렌더, collider, 내비게이션, 가시성, 배치 검사가 공유한다 | "렌더 범위 = collider 범위 = 내비 막힘 셀" 불변식 테스트(벽 4방향, 블록·타일 크기 1~4) |
| SE-4b | 문·아치·난간 벽의 collider를 종류별 형상으로 | 문은 통과, 통짜 벽은 차단하는 테스트 |
| SE-4c | 짝수 크기 타일 점유, 반대 방향 벽 겹침 판정, `WallConfig.edge` 좌표계 | 재현 테스트 |
| SE-4d | `addTileGroup`·`updateTileGroup`의 지지높이 인덱스 갱신, `updateTile`·`updateWall`·`removeWall`의 인덱스 원자성 | 인덱스와 store 일관성 테스트 |

### SE-5 모드 원본 단일화

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-5a | 편집 모드 쓰기 경로 하나. 에디터 건설 패널은 이전 모드를 기억했다가 unmount 때 복원한다 | 패널을 열고 닫은 뒤 플레이어·입력 복구 테스트 |
| SE-5b | `editorSlice.playMode`, `ScriptPlayModeSource`, `buildingStore` editMode, `npcStore.editMode`, `createEditorPlayModeController`를 모드 원본 하나로. 나머지는 이 값을 읽는 adapter | 모드 원본 1, 기존 테스트 통과 |
| SE-5c | 플레이어가 없을 때 "플레이어"가 다른 엔티티로 넘어가지 않게(`MotionBridge.getPlayerEntityId` fallback 제거, 비활성 엔티티 등록 제외) | 편집 모드 중 플레이어 조회 null 테스트 |

### SE-6 중복 구현 정리

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-6a | id 생성을 `createUniqueId` 하나로(`Date.now()` 기반 약 25곳) | 문자열 id에 `Date.now()` 0 |
| SE-6b | WebGPU 판정 하나(8종), renderer 팩토리 하나(`rendering/webgpu`, `next/backend`) | 판정 함수 1 |
| SE-6c | `NetworkConfig` 기본값 하나(3벌), 효과 없는 필드 `@deprecated` | 기본값 정의 1 |
| SE-6d | pub/sub 하나(`mitt`, `InMemoryEventBus`, `ToolEventBus`) | `mitt` 의존성 0 |
| SE-6e | 패키지 엔트리 목록 하나(vite, package.json, export snapshot, S-H14) | 엔트리 목록 정의 1과 대조 테스트 |
| SE-6f | 정의 registry 6개의 등록 규칙 통일(중복 id 처리, freeze) | registry 계약 테스트 |

### SE-7 관측 가능성

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-7a | 저장·로드·autosave 오류를 `reportError`로 | production에서 저장 실패가 sink에 닿는 테스트 |
| SE-7b | `InMemoryEventBus.emit`에서 handler별 예외 격리 | 한 listener 예외가 다른 plugin setup을 깨지 않는 테스트 |
| SE-7c | `PerformanceCollector`가 WebGPU에서 draw·삼각형을 0으로 읽는 문제 | WebGPU 경로 값 검증 테스트 |

### SE-8 공개 API 계약

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-8a | `GaesupController`가 타입에 있는 prop을 모두 전달(animatorController, groundContactFilter, 충돌 콜백, name 등), `PhysicsEntity`의 `scale`·배열 rotation | prop 전달 계약 테스트 |
| SE-8b | MotionBridge 명령: `turn` 구현, `move`는 설정값 사용, `jump`는 jumpForce 사용 | 명령 계약 테스트 |
| SE-8c | `HttpAssetSource` 기본 fetcher, `useNetworkGroup`·`useNetworkMessage`·`createGroup` 동작 | 계약 테스트 |

### SE-9 거대 파일 분할

| Slice | 내용 | 완료 기준 |
|---|---|---|
| SE-9a | `building/stores/buildingStore`(1,627줄): 편집 UI 상태와 데모 데이터 분리, 기존 selector는 facade | 파일 500줄 이하, export snapshot 불변 |
| SE-9b | `npc/stores/npcStore`(1,031줄): 카탈로그·인스턴스·두뇌 side table 분리 | 파일 500줄 이하, export snapshot 불변 |
| SE-9c | NPC 두뇌 패널(2,142줄), `BuildingUI`(1,555줄) 분할 | 파일 500줄 이하 |

## 4. 상급 결함

SE 항목에 들어가지 않은 것이다. 각 결함은 재현 테스트를 먼저 두고 고친다.

| ID | 결함 | 위치 |
|---|---|---|
| D-1 | WebGPU에서 기본 물(three-stdlib `Water`)에 가까이 가면 매 프레임 TypeError | `building/components/mesh/water` |
| D-2 | 재마운트된 `PhysicsEntity`의 rigidBody ref가 null로 남아 멀티 위치 송신과 NPC 이동이 멈춤 | `motions/entities/refs/PhysicsEntity` |
| D-3 | 첫 물리 틱이 `position` prop을 무시하고 stateManager 위치 +5m로 순간이동 | `motions/hooks/usePhysicsBridge` |
| D-4 | 도구 방향·부착물이 잠긴 body 회전을 읽어 항상 +Z | `MotionBridge` snapshot, `usePlayerPosition` |
| D-5 | authority 라우터가 `verifyActor` 없이 임의 actor 명령을 실행, 검증 함수에 세션 인자가 없음 | `networks/adapter/authority` |
| D-6 | visit 채널이 발신자가 적은 hostId를 믿어 VisitLeave·VisitSnapshot 사칭 가능 | `networks/visit` |
| D-7 | 이벤트 패널 "실행"이 runtime 이벤트를 시드로 교체하고 실제 보상을 지급 | `editor/components/panels/GameplayEventPanel` |
| D-8 | NPC 자율 이동이 내비게이션 없이 직선으로 움직여 벽을 통과 | `npc/core/NPCSimulation`, `npc/stores/npcStore` |

## 5. 성능

수치는 2026-09-25 운영 빌드 실측(`pnpm accept`, WebGPU)과 코드 측정이다.

| ID | 내용 | 근거 |
|---|---|---|
| P-1 | wasm A* open set을 이진 힙으로 | 막힌 칸 클릭 245~433ms(JS 힙 28ms) |
| P-2 | `TileSystem`·`WallSystem` memo, `MaterialManager` 지연 생성, 색 선택 mesh id 재사용 | 편집·선택마다 전 그룹 재렌더와 월드 재빌드 |
| P-3 | 고정 바디를 보간 대상에서 제외 | 틱당 WASM 호출 320회(고정 50 + NPC 30) |
| P-4 | 편집 오버레이를 InstancedMesh 2개로 | 편집 모드 draw 1,857 → 3,739 |
| P-5 | `frameloop="demand"`, 보조 캔버스 demand | 5초 대기 중 render 515 |
| P-6 | minihome 루트 barrel import 제거 | 첫 로드 gz 2.1MB, 쓰지 않는 heavy 청크 5 |
| P-7 | 정적 장면 그림자 갱신 억제 | 프레임 draw 2,157(그림자 cascade 포함) |
| P-8 | 후처리 pass 컨텍스트로 사전 컴파일, 모델 로드 시 동기 컴파일 제거 | warm-up 뒤 program 38, 동기 컴파일 5프레임 |
| P-9 | 잔디 chunk 재사용, 지형 측면·모래 O(N²) 제거 | 400타일 그룹 약 70ms, 3천 타일 약 313ms |
| P-10 | 화면 밖 NPC mixer 갱신 줄이기 | 화면 밖 mixer 갱신 1,561 |
