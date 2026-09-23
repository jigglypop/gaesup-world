# PRD-16 애니메이션

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (결정 주체 변경, 새 공개 계약) |
| 선행 PRD | 11, 14 (CharacterState) |
| 관련 active plan | `epoch-8a-blender-character-parts` |

## 1. 배경과 문제

| ID | 내용 | 근거 |
|---|---|---|
| A-01 | 재생할 애니메이션을 결정하는 경로가 두 개 | `motions/controller/AnimationController.ts` (PhysicsSystem 내부), `hooks/useAnimationPlayer/index.ts` (React) |
| A-02 | 두 경로의 run 조건이 다름. 클릭 달리기(Shift+클릭)에서 AnimationController가 run, useAnimationPlayer가 walk로 덮어써 "달리기 속도로 걷기" 가능 (추정) | `AnimationController.ts:12-24` vs `useAnimationPlayer.ts:30` |
| A-03 | ride와 jump의 우선순위가 경로마다 다름 | 동일 |
| A-04 | 엔진 ID `"character"` 하드코딩 | `AnimationController.ts:27` |
| A-05 | `AnimationBridge.update` 호출처 없음. mixer는 drei `useAnimations`가 갱신 | - |
| A-06 | 상태 머신, blend, 레이어, 마스크, 애니메이션 이벤트 없음 | todolist "Animation state machine: Partial" |
| A-07 | Layer 1이 React 훅 모듈을 간접 import | `PhysicsSystem.ts:7` → `AnimationController` → `useAnimationBridge.ts` |

## 2. 목표 / 비목표

### 목표
1. 애니메이션 결정 주체를 하나로 만든다.
2. 데이터로 정의하는 Animator 상태 머신을 제공한다(Unity Animator Controller에 해당).
3. locomotion blend(속도 기반 idle-walk-run), 상체 레이어 마스크, 애니메이션 이벤트(발소리, 타격 시점)를 지원한다.
4. 스크립트(PRD-12)가 Animator 파라미터를 설정할 수 있다.

### 비목표
- IK(발 IK, 시선 IK). P3로 둔다.
- 리타기팅 도구. Blender 파트 plan(`epoch-8a`) 범위.
- 에디터 그래프 UI 1차 범위 제외. 1차는 JSON 정의 + Inspector 파라미터 미리보기.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `AnimatorController` 정의: parameters(float, bool, trigger), states(clip 또는 blend1D), transitions(조건, 지속시간, exit time) |
| FR-2 | 레이어: base + 추가 레이어, 본 마스크, 가중치, override/additive |
| FR-3 | 기본 캐릭터 컨트롤러 제공: idle, walk, run, jump, fall, land, ride. 현재 동작과 같은 전이 |
| FR-4 | `animation` 단계에서 CharacterState(PRD-14)를 읽어 파라미터(speed, grounded, verticalSpeed, riding)를 설정 |
| FR-5 | 애니메이션 이벤트: 클립의 정규화 시간에 이벤트 이름 등록, 스크립트와 오디오로 전달 |
| FR-6 | 엔진 ID 하드코딩 제거. Animator는 SceneObject 컴포넌트 `gaesup.animator`로 붙는다 |
| FR-7 | 스크립트 API `ctx.animator.setFloat/setBool/trigger` |
| NFR-1 | Animator 평가 프레임당 할당 0 |
| NFR-2 | 캐릭터 50개 Animator 평가 1ms 이하 |
| NFR-3 | `animation/core`는 React 무관 |

## 4. 설계

```
src/core/animation/
  core/
    AnimatorController.ts   정의 타입과 검증
    AnimatorRuntime.ts      상태 평가, 전이, 레이어 가중치 → three AnimationAction 가중치
    defaultCharacter.ts     기본 locomotion 컨트롤러 정의
  bridge/AnimationBridge.ts 런타임 스냅샷(현재 상태, 파라미터), command(set/trigger)
  react/AnimatorHost.tsx    GLTF 클립 바인딩, animation 단계 등록
```

- mixer 갱신도 `AnimatorRuntime`이 `animation` 단계에서 한다. drei `useAnimations`는 클립 로딩에만 쓰거나 제거한다.
- `AnimationController`와 `useAnimationPlayer`의 결정 로직은 `defaultCharacter.ts`의 전이 조건으로 옮긴 뒤 둘 다 삭제한다.
- A-02의 run 조건은 "속도 파라미터가 run 임계값 이상"으로 통일한다. 입력 종류(키보드, 클릭, 자동화)와 무관하게 실제 속도로 판단한다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 16-a | A-02 즉시 완화: 두 경로의 run 조건을 같은 함수로 통일 (Fast) | Shift+클릭 달리기 테스트 |
| 16-b | `AnimatorController` 정의와 검증 | 단위 테스트 |
| 16-c | `AnimatorRuntime` 상태·전이·blend1D | 전이 시나리오 테스트, NFR-1 |
| 16-d | 레이어와 본 마스크 | 상체 레이어 테스트 |
| 16-e | 기본 캐릭터 컨트롤러로 교체, 기존 두 경로 삭제 | 데모 캐릭터 동작 비교 |
| 16-f | 애니메이션 이벤트, 스크립트 API | 발소리 예제 |
| 16-g | `gaesup.animator` 컴포넌트와 Inspector 파라미터 표시 | 에디터 테스트 |

## 6. 공개 API 영향

- 추가: `AnimatorController` 타입, `createAnimatorController`, `defaultCharacterAnimator`, `gaesup.animator` 컴포넌트.
- deprecated → 삭제: `useAnimationPlayer`의 자동 결정 동작(수동 재생 API는 유지 여부 결정 필요).

## 7. 검증과 완료 기준

- animation, motions 테스트, memory 테스트
- 브라우저: idle → walk → run → jump → land, ride 진입·이탈 녹화 비교

## 8. 열린 질문

1. `useAnimationPlayer`를 수동 재생 API로 남길지.
2. 애니메이션 그래프 에디터 UI를 언제 만들지.

## 9. 구현 현황 (2026-09-23)

### 9.1 완료

| Slice | 결과 | 위치 |
|---|---|---|
| 16-a | 결정 주체를 하나로 통합해 해소. run은 `PhysicsSystem`이 계산한 `gameStates.isRunning`만 사용하므로 자동화 큐가 없는 클릭 달리기도 run으로 재생된다 | `motions/hooks/useCharacterAnimator.ts` |
| 16-b | `AnimatorControllerDefinition`(parameters, layers, states, transitions, events, mask, blending)과 `validateAnimatorController`, 컨트롤러 등록소 | `animation/core/animator/{types,validate,registry}.ts` |
| 16-c | `AnimatorRuntime`: clip과 blend1D 상태, any 상태 전이, 조건(float/bool/trigger), exitTime, 교차 페이드, 트리거 소모, 속도 배율, 수동 재생 오버라이드 | `animation/core/animator/AnimatorRuntime.ts` |
| 16-d | 레이어 가중치, override/additive 블렌딩, 본 마스크(하위 본 포함 옵션). three.js mixer의 정규화 누적 특성에 맞춰 override 가중치를 환산한다 | `animation/core/animator/ThreeAnimatorBinding.ts` |
| 16-e | 기본 캐릭터 컨트롤러(`gaesup.character`: locomotion blend1D idle/walk/run, jump, fall, ride)로 교체. `PhysicsSystem`의 `AnimationController` 호출 제거. `useAnimationPlayer`는 새 구동기의 호환 별칭 | `defaultCharacterAnimator.ts`, `PhysicsSystem.ts`, `hooks/useAnimationPlayer` |
| 16-f | 정규화 시간 기반 애니메이션 이벤트(반복 구간 포함), 엔진·브리지 이벤트 구독, React 훅 `useAnimatorEvent` | `AnimatorRuntime.ts`, `AnimationBridge.onAnimatorEvent`, `animation/hooks/useAnimatorEvent.ts` |
| 16-g | SceneObject 컴포넌트 `gaesup.animator`(`createAnimatorComponent`)와 Inspector 표시(컨트롤러, 파라미터 기본값·오버라이드, 레이어별 상태) | `scene-object/components.ts`, `editor/components/panels/AnimatorComponentView` |
| FR-6 | 엔티티별 컨트롤러 지정: `PhysicsEntity`의 `animatorController` prop | `motions/entities/types.ts`, `boilerplate/hooks/useEntity.ts` |
| A-07 | Layer 1(`PhysicsSystem`)이 React 훅 모듈을 간접 import하던 경로 제거. 아키텍처 경계 기준선 16 → 15 | `src/__tests__/architectureBoundaries.test.ts` |

### 9.2 동작 규칙

- 한 엔진(`character`, `vehicle`, `airplane`)에는 Animator가 하나만 붙는다. 여러 구동기가 연결을 요청하면 lease 순서로 첫 요청자가 소유하고, 소유자만 시간을 진행한다. 소유자가 해제되면 다음 lease의 컨트롤러로 재구성된다.
- Animator가 붙은 엔진에서 기존 명령은 이렇게 전달된다: `play`는 상태 이름이면 강제 전이, 클립 이름이면 다음 전이까지 유지되는 오버라이드. `stop`은 비활성화. `setWeight`는 base 레이어 가중치. `setSpeed`는 전체 속도 배율.
- 상태의 클립이 모델에 없으면 논리 상태만 바뀌고 이전 출력을 유지한다. 예전 경로에서 없는 클립 재생이 무시되던 동작과 같다.
- 우선순위는 ride > jump > fall > locomotion이다. 이전 두 경로가 서로 달랐던 순서(A-03) 중 `AnimationController` 쪽을 채택했다.
- Animator는 액션의 시간과 가중치를 직접 쓰고 액션 timeScale을 0으로 둔다. mixer 갱신은 기존처럼 drei `useAnimations`가 한다. Animator를 해제하면 액션의 timeScale과 가중치를 1로 되돌린다.

### 9.3 검증

| 항목 | 결과 |
|---|---|
| 새 테스트 | validate 7, AnimatorRuntime·기본 캐릭터 19, ThreeAnimatorBinding 7, 엔진·브리지 연동 9, useCharacterAnimator 7, useAnimatorEvent 1, Inspector 3, useEntity 1, PhysicsSystem 클릭 달리기 1, 공개 API 1 |
| 타입 | `tsc -p tsconfig.build.json` 0, `tsc --noEmit`(examples 포함) 0 |
| 린트 | 변경한 비테스트 파일 0 |
| 메모리 테스트 | 88 통과 |
| 성능 (NFR-2) | 캐릭터 50개, 본 5개, 클립 6개 기준 Animator 평가 프레임당 0.078ms, three.js mixer 적용 포함 0.35ms (jest, Node, 로컬 측정) |
| 할당 (NFR-1) | 프레임 경로는 풀과 재사용 배열만 쓴다. 이벤트 발생 시에만 이벤트 객체를 만든다. 힙 측정은 GC 개입으로 정밀 수치가 아니다 |

### 9.4 남은 것

| 항목 | 이유 |
|---|---|
| FR-7 스크립트 API `ctx.animator` | 스크립트 컴포넌트(PRD-12)가 아직 없다. 연결 지점은 `AnimationBridge.getAnimator(type)`과 `setAnimatorParameter`/`setAnimatorTrigger`다 |
| `AnimationController`(motions) 클래스 삭제 | 공개 export(`MotionAnimationController`)라서 `@deprecated` 표시만 했다. 삭제는 2.0에서 사용자 확인 후 진행한다 |
| SceneObject `gaesup.animator`의 런타임 연결 | SceneObject를 런타임 엔티티로 투영하는 경로(PRD-10, 12)가 아직 없어 Inspector 표시까지만 했다 |
| 프레임 단계 통합 | 3차에서 완료. `useCharacterAnimator`가 `animation` 단계(우선순위 -1 호스트 틱, mixer 갱신 전)로 이동. `CHARACTER_ANIMATOR_FRAME_PRIORITY`는 공개 상수라 `FRAME_SCHEDULER_PRIORITY`와 같은 값으로 유지 |
| 브라우저 시각 검증 | 요청에 따라 데모를 띄우지 않았다. idle → walk → run → jump → land, ride 진입·이탈 녹화 비교가 남았다 |
