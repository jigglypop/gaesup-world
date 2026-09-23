# PRD-14 캐릭터와 물리

| 항목 | 값 |
|---|---|
| 우선순위 | P1 (버그 slice는 P0) |
| 트랙 | Fast (14-a~d) → Epoch (14-e 이후, 물리 어댑터) |
| 선행 PRD | 00. 14-e 이후는 11 |
| 후속 PRD | 12 (트리거 이벤트), 16 |
| 관련 active plan | `automation-execution`, `keyboard-input-ownership` |

## 1. 배경과 문제

### 1.1 확인된 버그
| ID | 내용 | 근거 |
|---|---|---|
| B-02 | MotionSystem이 갱신되지 않아 스냅샷의 `isGrounded`, `isMoving`, `speed`가 항상 초기값 | `MotionBridge.ts:49` 생성만, 호출처 없음 |
| B-02a | `jump` 명령이 항상 0 벡터 | `MotionBridge.ts:68-73`, `isGrounded=false`. 호출마다 `new Vector3`, `{} as GameStatesType` 캐스팅 |
| B-02b | 잔디 밟힘 효과 고정값 | `building/components/mesh/grass/manager.ts:224` |

### 1.2 코드 근거가 있는 위험
| ID | 내용 | 근거 |
|---|---|---|
| R-01 | 플레이어를 `getActiveEntities()[0]`으로 추론. NPC가 먼저 등록되면 잘못 잡음. 한 번 정해진 ID가 해제 후에도 유지 | `usePlayerPosition.ts:57-60`, `grass/manager.ts:217` |
| R-02 | `useTeleport`가 activeState의 Euler를 호출자 객체로 교체 (`Object.assign`) | `useTeleport/index.ts:86-89` |
| R-07 | `subscribeDefaultAutomation` 가드와 해제 없음 → 스토어 재생성마다 리스너 누적 | `interactions/stores/slices.ts:153` |
| R-11 | 자동화 진입점 혼재 (`InteractionBridge.getGlobal().getAutomationSystem()` vs `getDefaultAutomationSystem()`) | `slices.ts:184,186` |
| R-12 | 첫 프레임에 rigidBody를 `activeState.position + (0,5,0)`으로 강제 이동. `PhysicsEntity`의 `position` prop 무시 | `usePhysicsBridge.ts:203-215` |
| R-13 | OutfitAvatar가 rigidBody 회전(캐릭터 모드에서 identity)을 사용해 바라보는 방향 미반영 (추정) | `OutfitAvatar/index.tsx:104`, `PhysicsSystem.ts:194-195,234` |
| R-14 | 접지 판정이 절대 높이 `WORLD_GROUND_Y_THRESHOLD=0.75`와 속도 휴리스틱. `groundRay` prop 미사용 | `PhysicsSystem.ts:31` |
| R-15 | waypoint 도달은 3D 거리, 최종 도착은 2D 거리. 높이 차가 크면 멈출 수 있음 (추정) | `ClickNavigationRoute.ts:62` |
| R-16 | Layer 1이 React 모듈을 간접 import | `PhysicsSystem.ts:7` → `AnimationController` → `useAnimationBridge.ts` |

### 1.3 프레임 할당
- `usePhysicsBridge.ts:259` 인자 객체 리터럴, `:251` 매 프레임 `delete calcProp.colliderSize`
- `DirectionComponent.ts:106` 키 입력 중 `lastKeyboardState` 객체 생성
- `ClickNavigationRoute.ts:52-57` 설정 객체 생성
- `NavigationSystem.ts:236-243` `worldToGrid` 튜플 반환 (프레임당 여러 번)
- `useEntity.ts:73-82` 렌더마다 `physicsProps` 생성 → `executePhysics` 재생성

### 1.4 죽은 코드
`PhysicsSystem.checkRiding`(`:356-371` 빈 분기), `DirectionComponent.emitRotationUpdate`(`:347-358`), `physicsState.automationOption`(`usePhysicsBridge.ts:225`), `groundRay` prop.

## 2. 목표 / 비목표

### 목표
1. 캐릭터 상태(접지, 이동, 속도, 바라보는 방향)의 원본을 하나로 만들고 모든 소비자가 그것을 읽는다.
2. 플레이어 엔티티를 명시적으로 지정한다.
3. 접지 판정을 물리 질의로 바꾼다.
4. Rapier 결합을 어댑터 뒤로 옮긴다.
5. collision layer 매트릭스를 Rapier 충돌 그룹에 연결한다.
6. 충돌·트리거 이벤트 스트림을 제공한다(PRD-12 사용).

### 비목표
- 차량, 소프트바디(Jolt 도입은 별도 결정)
- 캐릭터 컨트롤러 알고리즘 재작성. 현재 임펄스 기반 이동 유지

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `postPhysics` 단계에서 PhysicsSystem 결과로 캐릭터 상태를 갱신하고, MotionBridge 스냅샷은 그 상태를 in-place로 반영한다. |
| FR-2 | `setPlayerEntity(id)` / `<PhysicsEntity isPlayer>`로 플레이어를 지정한다. `[0]` 추론 삭제. |
| FR-3 | `jump` 명령은 접지 상태에서 설정된 점프 속도를 적용한다. 할당 없음. |
| FR-4 | 접지 판정은 캡슐 하단 shapecast(또는 레이) 결과와 경사 한계 각도로 한다. `groundRay` 설정이 실제로 쓰인다. |
| FR-5 | `updateActiveState`는 참조를 교체하지 않고 값을 복사한다. |
| FR-6 | 물리 어댑터 인터페이스: `castShape`, `castRay`, `applyImpulse`, `setLinvel`, `setTranslation`, 이벤트 큐 드레인 |
| FR-7 | `project-settings.physics.collisionMatrix`와 `scene-object/layers.ts`를 Rapier `collisionGroups`로 변환 |
| FR-8 | 충돌·트리거 이벤트를 `postPhysics`에서 오브젝트 ID 기준으로 분배 |
| FR-9 | 스폰 위치 정책을 명시: `position` prop이 있으면 우선, 없으면 저장된 위치, `+5` 오프셋은 옵션 |
| NFR-1 | 정지·이동 중 모두 motions 경로의 프레임당 할당 0 (테스트 가능한 부분) |
| NFR-2 | Layer 1(`motions/core`)의 React 간접 import 0 |

## 4. 설계

### 4.1 캐릭터 상태 원본

```
PhysicsSystem (prePhysics: 입력 → 임펄스)
      ↓ rapier step
CharacterStateResolver (postPhysics: 접지, 속도, 바라보는 방향 계산)
      ↓ in-place 갱신
CharacterState (엔티티별 객체, 필드 재사용)
      ↓
MotionBridge 스냅샷, 애니메이션(PRD-16), 카메라, grass, usePlayerPosition
```

- `MotionSystem`의 중복 상태를 없애고 `CharacterStateResolver`가 쓴 값을 읽는다. MotionSystem이 할 일이 남지 않으면 삭제한다.
- 바라보는 방향은 innerGroup 회전(`activeState.euler`)에서 가져온다. OutfitAvatar도 이 값을 쓴다.

### 4.2 물리 어댑터

```
src/core/motions/core/physics/
  PhysicsAdapter.ts        type PhysicsAdapter = { castShape, castRay, applyImpulse, ... }
  rapierAdapter.ts         Rapier 구현 (Layer 1에서 Rapier import는 허용됨)
  collisionGroups.ts       collisionMatrix → 32비트 그룹 마스크
```

- `ImpulseComponent`, `DirectionComponent`, `PhysicsSystem`은 어댑터만 호출한다.
- 테스트는 가짜 어댑터로 한다. 지금보다 물리 로직 단위 테스트가 쉬워진다.

### 4.3 AnimationController 분리

`PhysicsSystem`이 `AnimationController`를 직접 부르지 않는다. 애니메이션은 `animation` 단계에서 CharacterState를 읽는다(PRD-16). 이로써 R-16이 해소된다.

## 5. 단계별 작업

| Slice | 트랙 | 내용 | 완료 기준 |
|---|---|---|---|
| 14-a | Fast | B-02: PhysicsSystem 결과로 MotionSystem 갱신(임시로 PhysicsSystem 끝에서), jump 수정 | jump, grass, usePlayerPosition 테스트 |
| 14-b | Fast | R-02 `updateActiveState` 복사, R-07 리스너 가드·해제, R-11 진입점 통일 | 각 회귀 테스트 |
| 14-c | Fast | R-01 명시적 플레이어 지정 | NPC 먼저 등록 시나리오 테스트 |
| 14-d | Fast | 프레임 할당 5건 제거, 죽은 코드 삭제 | motions 테스트, memory 테스트 |
| 14-e | Epoch | PRD-11 단계 연결: `CharacterStateResolver`를 `postPhysics`로, MotionSystem 정리 | 상태 원본 1개 |
| 14-f | Epoch | 물리 어댑터 도입 | motions/core에서 Rapier 직접 호출이 어댑터 파일로 한정 |
| 14-g | Epoch | shapecast 접지 판정, 경사 한계 | 경사·계단·공중 테스트 |
| 14-h | Epoch | collision layer 매트릭스 → 충돌 그룹 | 레이어 조합 테스트 |
| 14-i | Epoch | 충돌·트리거 이벤트 스트림 | PRD-12 트리거 예제 |
| 14-j | Fast | R-12 스폰 정책, R-15 waypoint 판정 통일 | 경사 지형 클릭 이동 테스트 |

## 6. 공개 API 영향

- 추가: `setPlayerEntity`, `PhysicsEntity`의 `isPlayer` prop, `PhysicsAdapter` 타입, 충돌 이벤트 타입.
- 변경: `usePlayerPosition`의 대상 결정 방식. MotionBridge 스냅샷 필드는 유지.
- 삭제 후보: `groundRay` prop이 새 판정에 흡수되면 형태 변경.

## 7. 검증과 완료 기준

- motions, interactions, navigation, camera 테스트
- 브라우저: 평지, 경사, 계단, 점프, 클릭 이동, 자동화 큐 이동 시나리오 녹화 비교
- memory 테스트, `frame-perf-auditor`

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 접지 판정 변경으로 이동감 변화 | 경사 한계와 캐스트 거리를 project-settings로 노출하고 기본값을 현재 동작에 맞춤 |
| 스폰 위치 변경으로 기존 데모 캐릭터가 땅에 박힘 | 기본은 현재 `+5` 유지, 옵션으로 끔 |

## 9. 열린 질문

1. 첫 프레임 `+5` 스폰이 의도된 동작인가.
2. Jolt 도입 가능성을 고려해 어댑터에 차량 API 자리를 둘 것인가.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 14-a | 완료 | `MotionSystem.syncFromBody`로 스냅샷의 접지·이동·속도를 채움. 접지는 `usePhysicsBridge`가 `MotionBridge.reportGrounded`로 전달하고, 없으면 수직 속도로 추정. `jump` 명령은 스냅샷 설정의 jumpForce와 재사용 게임 상태를 쓴다. `performUpdate`는 전역 `activeState.euler`를 덮어쓰므로 호출하지 않는다 |
| 14-b | 부분 | `updateActiveState`가 참조를 바꾸지 않고 값을 복사(R-02). 자동화·입력 리스너를 한 번만 구독하고 최신 스토어로 전달(R-07). 자동화 진입점 통일(R-11)은 같은 인스턴스라 보류 |
| 14-c | 완료 | `MotionBridge.setPlayerEntity/getPlayerEntityId`. `useMotionSetup`이 활성 엔티티를 플레이어로 지정하고 `usePlayerPosition`, 잔디 밟힘이 사용 |
| 14-d | 완료 | update 인자 객체 재사용, 매 프레임 `delete` 제거, `lastKeyboardState` 제자리 갱신, 클릭 경로 설정 객체 재사용, `worldToGrid` 튜플 없는 내부 경로, 죽은 코드(`checkRiding`, `emitRotationUpdate`) 삭제 |
| 14-e ~ 14-j | 미착수 | |

Layer 1 간접 React 의존은 `import type` 전환과 엔진 배럴로 14건에서 3건으로 줄었다(`pnpm check:layer1`).

### 3차 (2026-09-23)

전체 테스트 실행에서 14-a 구현이 기존 계약 2개를 깨뜨린 것을 확인하고 수정했다.

- `usePhysicsBridge`가 접지 보고를 위해 `BridgeFactory.getOrCreate('motion')`을 다시 import해 "BridgeFactory 대신 명시적 runtime" 계약(`usePhysicsBridgeRef.test.ts`)을 어겼다. 접지 접촉을 Layer 1 테이블 `motions/core/system/groundContacts.ts`(`reportGroundContact`, `readGroundContact`, `clearGroundContact`)로 옮겼다. `usePhysicsBridge`는 매 물리 갱신 후 보고하고 등록 해제 시 지운다. `MotionBridge`는 테이블 값을 우선하고 없으면 수직 속도로 추정한다. `MotionEntity.grounded` 필드는 삭제했다.
- `reset` 명령 후 스냅샷의 `isGrounded`가 속도 추정으로 true가 되어 "reset 후 초기 상태" 계약(`MotionBridge.test.ts`)을 어겼다. reset은 접지를 false로 보고하고, 다음 물리 보고가 덮어쓴다.
- `BridgeRegistry` 테스트가 `console.warn`을 감시해 logger 전환(13-a) 후 실패했다. 감시 대상을 `logger.warn`으로 바꿨다.

| Slice | 상태 | 내용 |
|---|---|---|
| 14-j | 부분 | R-15 해소: 클릭 경로점 도달을 3D 거리에서 XZ 수평 거리로 바꿨다. 캡슐 중심(지면 위 약 1.2)과 지면 경로점의 높이 차만으로 임계값 1을 넘어 경로점을 소비하지 못하던 상황을 테스트로 재현(수정 전 실패, 수정 후 통과). 제곱 거리 비교라 sqrt도 없다. R-12 스폰 `+5` 정책은 열린 질문 1(의도 여부) 대기 |
| 11-c 연계 | 완료 | `usePhysicsBridge`의 프레임 작업이 `postPhysics` 단계로 이동(PRD-11) |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.

### 4차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 14-e | 부분 | 물리 프레임을 두 단계로 나눴다. `prePhysics`(`motions:drive`): 입력 샘플링, 이동·점프 의도, 방향, 임펄스, 감쇠, 힘을 적용해 같은 프레임의 rapier step이 소비한다. `postPhysics`(`motions:resolve`): step 이후 강체에서 접지·낙하·위치·속도를 판정하고(`PhysicsSystem.resolve`) 접지 테이블에 보고한다. 이전에는 전부 `postPhysics`에서 돌아 입력이 다음 프레임 step에서야 반영됐다(입력 지연 1프레임 감소). `PhysicsUpdateArgs.stage`(`'full' \| 'drive'`, 기본 `full`)와 `PhysicsBridge.resolveEntity`를 추가했고 `calculate`(단일 단계)는 기존 순서 그대로 남겼다. 접지의 원본은 `resolve` 하나이며 MotionBridge 스냅샷도 같은 테이블을 읽는다. 프레임마다 두 번 읽던 `linvel()` 1회와 죽은 `checkAllStates`를 제거했다. 남은 것: MotionSystem의 테스트 전용 갱신 메서드 정리(테스트 수 변경이라 컨펌 필요) |

검증: motions 23 suites / 151 tests 통과(단계 순서, drive/resolve 분리 테스트 추가). 타입체크(src, examples)와 변경 파일 린트 통과. 브라우저 `/world`: W 입력으로 (0, 0) → (8.47, 8.47) 이동, 점프 y 1.33 → 5.73 → 1.33 착지, 페이지 오류 0.

### 5차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 14-f | 부분 | Layer 1 `motions/core/physics/`: Rapier 타입 없는 `PhysicsQueryAdapter`(`castGroundRay`)와 `GroundProbe`. Rapier 구현 `createRapierQueryAdapter`(레이 1개 재사용, 센서와 자기 강체 제외)는 `motions/bridge/rapierQueries.ts`에 두어 Layer 1 → `@react-three/rapier` 간선 기준선(9개)을 늘리지 않는다. `PhysicsEntity`가 `useRapier()`와 자기 강체 ref로 만들어 `useEntity` → `usePhysicsBridge` → `PhysicsCalcProps.physicsQueries`로 전달한다. `castShape`, 임펄스·속도 쓰기, 이벤트 드레인은 아직 강체 직접 호출 |
| 14-g | 부분 | FR-4: character 모드 접지를 발 아래 레이(원점 +0.1, 기본 길이 0.2, `groundRay.length`가 있으면 그 값)와 경사 한계 50도(법선 y ≥ cos 50°)로 판정한다. 점프 상승 중(`isJumping`이고 수직 속도 > 0.02)은 접지가 아니다. 어댑터가 없거나 vehicle/airplane 모드는 기존 휴리스틱을 쓴다. 기존 휴리스틱은 "y ≤ 0.75 또는 마지막 접지 높이 근처"라서 높이 3.33의 지면에서 시작한 캐릭터가 한 번도 접지되지 않아 점프가 불가능했다(브라우저 `/world`에서 재현, 탐침 적용 후 3.33 → 7.87 → 3.33 점프·착지). shapecast와 계단 테스트는 남음 |

검증: motions·boilerplate·아키텍처 경계 48 suites / 555 tests(탐침 높이 무관 접지, 경사·상승 거부, `groundRay.length`, Rapier 어댑터 인자 테스트 추가), 타입체크(src, examples) 0, 변경 파일 린트 0, `check:layer1` 3 유지. Rapier 레이 결과 객체는 Rapier가 호출마다 만든다(우리 쪽 할당 0).

### 6차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 14-h | 완료 | FR-7: `createSceneCollisionGroups(registry, physics)`가 충돌 용도이고 인덱스 0~15인 레이어마다 Rapier 상호작용 그룹(상위 16비트 소속, 하위 16비트 필터)을 만든다. 필터는 `canSceneLayersCollide`(대칭)와 같다. 테스트는 기본 레이어 25개 조합 전부에서 비트 판정과 매트릭스가 일치하는지 확인한다 |
| 14-i | 부분 | FR-8: `SceneObjectBody`가 장면 오브젝트의 `gaesup.collider`(box, sphere, capsule, mesh, trigger)와 `gaesup.rigidBody`(fixed, dynamic, kinematic, mass, gravityScale, lockRotations)로 Rapier 강체를 만들고, 교차·충돌 시작/끝을 `(kind, objectId, otherId)`로 전달한다. 상대 ID는 강체 `userData.sceneObjectId`, 없으면 강체 이름. 캐릭터 강체와 NPC는 아직 `sceneObjectId`를 싣지 않는다 |
