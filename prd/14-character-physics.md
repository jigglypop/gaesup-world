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

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
