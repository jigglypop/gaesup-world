# PRD-31 시스템·편집/플레이 모드·스크립팅

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch |
| 선행 PRD | 11-f(물리 시계 통합), 22-b(SaveSystem 인스턴스 상태), 30-a(delta 계약), 13-j(buildingEditorStore 분리) |
| 담당 agent | runtime, architect |

## 1. 배경과 문제

유니티형 엔진은 시스템 순서가 코드로 정해지고, 편집 모드와 플레이 모드가 엔진 기능이며, 스크립트가 고정 틱에서 돈다. 현재는 다음과 같다.

1. 스케줄러가 4종이고, 시스템 상당수가 렌더 출력 없는 React 컴포넌트다. 실행 순서가 mount 순서에 달려 있고 캔버스 없이 돌릴 수 없다.
2. 편집/플레이 모드의 출처가 4곳이고, 실제로는 `buildingStore`의 편집 모드가 그 역할을 한다.
3. 스크립트가 플레이 중 바꾼 값이 저작 문서에 기록되고 자동 저장된다.
4. `onFixedUpdate`가 가변 주기로 돈다.

## 2. 목표 / 비목표

**목표**
- 시스템 등록을 `defineSystem` 하나로 만들고, fixed lane과 presentation lane 두 개로 순서를 정한다.
- `runtime.mode`(edit/play/paused)를 엔진 상태 머신 하나로 만든다.
- play 중 변경이 저작 문서를 오염시키지 않게 한다.
- 스크립트 수명 주기를 고정 틱, objectId 이벤트, typed 접근으로 정리한다.

**비목표**
- `FrameScheduler`, `FixedStepClock` 교체. 보존 자산이며 등록 API만 추가한다.
- 비주얼 스크립팅 도입.

## 3. 현재 상태

**31-F01 스케줄러 4종** [확인]
- `FRAME_PHASES` 9개(`runtime/frame/types.ts:1-11`), `SIMULATION_PHASES` 5개(`simulation/FixedStepClock.ts:1`), `TASK_PHASE_ORDER` 4개(`src/next/core/TaskGraph.ts:3`), `BaseSystem`/`@ManageRuntime`(23 PRD).

**31-F02 시스템이 React 컴포넌트로 구현됨** [확인]
- building `*Driver` 8개(`GpuCulling`, `GpuMirror`, `GpuUpload`, `IndirectArgsUpload`, `IndirectDraw`, `NavigationObstacle`, `RenderState`, `Visibility`)는 렌더 출력 없이 `useEffect`/`useEngineFrame`으로 동작한다. 예: `BuildingNavigationObstacleDriver/index.tsx:28-56`은 store identity가 바뀔 때마다 `useEffect`에서 내비게이션을 재구축한다.
- `useEngineFrame` 호출 45곳(00 PRD 5절). 순서가 mount 순서에 좌우되고 headless 실행이 불가능하다.

**31-F03 모드 출처 4곳** [확인]
- `createEditorPlayModeController`(`editor/playMode.ts:37`): 호출처 0. snapshot 생성·복원 콜백을 호출자에게 요구한다.
- `editorSlice.playMode`(`editor/stores/editorSlice.ts:19,43,48`): 별도 상태.
- `ScriptPlayModeSource`(`scripting/react/types.ts:7`): 스크립트 전용 입력.
- `buildingStore.isInEditMode()`(`building/stores/buildingStore.ts:1366`): 실제 모드 역할. 소비 모듈 5곳(`camera/hooks/useCamera.ts:43`, `motions/controller/EntityController.tsx:20`, `hooks/useKeyboard/index.ts:40`, `runtime/createGaesupRuntime.ts:115` 게임패드, `BuildingUI`).

**31-F04 play 중 변경이 저작 문서로 들어감** [확인]
- `ScriptRuntime`의 `commit`이 저작 controller에 바로 dispatch한다(`scripting/ScriptRuntime.ts:408`). 그 문서는 `saveBinding`으로 자동 저장된다(`scene-object/saveBinding.ts:36`).
- 편집기에서 플레이를 시험하면 결과가 저장본에 남는다. pause가 `FixedStepClock`과 물리를 멈추지 않는다.

**31-F05 스크립트 수명 주기** [확인]
- `onFixedUpdate`가 가변 주기 `prePhysics` phase에서 돈다(`scripting/react/useScriptRuntime.ts:40`). 144Hz에서 60Hz보다 2.4배 호출되고 결과가 비결정적이다.
- `sync()`가 dispatch마다 문서 전체를 순회한다(`ScriptRuntime.ts:234-257`). `find()`는 선형 탐색이다.
- hook 호출마다 클로저를 만든다(`ScriptRuntime.ts:123,133,143`).
- 스크립트는 `getComponentData`로 JSON만, 서비스는 문자열 키(`ctx.services.get('inventory')`)로만 접근한다.
- 재등록해도 살아 있는 인스턴스를 다시 만들지 않는다(hot reload 없음). runtime과 editor 어디도 `ScriptRuntime`을 소유하지 않는다.

## 4. 요구사항

**FR**
- FR-31-01: `defineSystem({ id, lane: 'fixed' | 'presentation', phase, after?, before?, update, onStart?, onStop? })`. fixed lane은 `FixedStepClock`(`SIMULATION_PHASES`), presentation lane은 `FrameScheduler`(`FRAME_PHASES`) 위에서 돈다. `TaskGraph`의 의존 정렬은 `after`/`before`로 흡수한다.
- FR-31-02: runtime이 시스템 목록을 소유하고 캔버스 없이 tick할 수 있다(서버, 테스트). React는 view mount만 맡는다.
- FR-31-03: 렌더 출력이 없는 building Driver를 시스템으로 옮긴다.
- FR-31-04: `runtime.mode`(`'edit' | 'play' | 'paused'`) 상태 머신 하나를 둔다. `editorSlice.playMode`, `ScriptPlayModeSource`, `isInEditMode()`는 이 값을 읽는 adapter가 된다.
- FR-31-05: play 진입 시 저작 `SceneDocument`를 복제한 play controller를 만들고 저작 문서를 읽기 전용으로 둔다. SaveSystem 자동 저장은 중단한다. 종료 시 play copy를 버린다. 영속 월드 게임은 옵션 `persistPlayChanges: true`로 기존 동작을 유지한다.
- FR-31-06: pause는 fixed lane(물리 포함)과 script phase를 멈추고 presentation lane(카메라, UI)은 유지한다.
- FR-31-07: 스크립트 규칙
  - `fixedUpdate`는 fixed lane에서 고정 dt로 돈다.
  - `sync`는 30-a objectId delta로 처리한다.
  - hook 호출 클로저를 없앤다.
  - `ctx.getComponent<T>(type)`, `ctx.physics`를 제공하고, 서비스는 typed key(22 FR-22-10)로 접근한다.
  - 같은 scriptId를 재등록하면 인스턴스를 다시 만든다.
  - `ScriptRuntime`은 runtime 서비스가 소유한다.

**NFR**
- NFR-31-01: 시스템 실행 순서는 mount 순서와 무관하다(테스트로 고정).
- NFR-31-02: 60Hz와 144Hz에서 `fixedUpdate` 호출 수가 같다.
- NFR-31-03: `persistPlayChanges: false`에서 play 종료 후 저작 문서가 동일하고 play 중 저장 호출이 0이다.
- NFR-31-04: pause 중 physics step 0.

## 5. 설계

```
runtime
 ├─ mode: edit ──enter──► play ◄──resume/pause──► paused
 │           ◄──exit (play copy 폐기, autosave 재개)──
 ├─ fixed lane (FixedStepClock)      commands → simulation → physics → postSimulation → publish
 │     └─ script.fixedUpdate, physics, transform ↔ Rapier (30 PRD 5.2)
 └─ presentation lane (FrameScheduler)  input → script → prePhysics → postPhysics → animation
                                          → lateUpdate → camera → effects → snapshot
```

| mode | fixed lane | script | presentation | 문서 | autosave |
|---|---|---|---|---|---|
| edit | 정지(편집 미리보기 옵션) | edit 콜백만 | 동작 | 저작 문서 | 동작 |
| play | 동작 | 동작 | 동작 | play copy | 중단 |
| paused | 정지 | 정지 | 동작 | play copy | 중단 |

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 31-a | `defineSystem`, lane, `TaskGraph` 흡수(11-f 이후) | 순서 테스트, 캔버스 없는 tick 테스트 |
| 31-b | 스크립트 fixed lane 이전, hook 클로저 제거, delta 기반 sync(30-a 이후) | 60/144Hz 호출 수 동일, dispatch당 전체 순회 0 |
| 31-c | `runtime.mode` 상태 머신, pause gating | pause 중 physics step 0 |
| 31-d | play copy, autosave 중단, `ScriptRuntime` runtime 소유 | play 후 문서 동일, play 중 save 0 |
| 31-e | `isInEditMode` 소비 5곳을 `runtime.mode`로(13-j 이후) | buildingStore mode 참조 0 |
| 31-f | building Driver → 시스템(13-e 이후) | 렌더 출력 없는 Driver 컴포넌트 0 |
| 31-g | 스크립트 typed component·physics 접근, 재등록 시 인스턴스 재생성 | 재등록 테스트 |

## 7. 공개 API 영향

- `createEditorPlayModeController`, `editorSlice.playMode`, `ScriptPlayModeSource`는 유지하되 `runtime.mode` adapter로 바꾼다.
- `defineSystem`, `runtime.mode`, `persistPlayChanges` 옵션은 추가만.
- `onFixedUpdate` 호출 빈도가 바뀐다(동작 변경, 릴리스 노트 명시).

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/runtime src/core/simulation src/core/scripting src/core/editor --runInBand
node scripts/frame-harness.cjs --route=/world
node scripts/probe-editor-return.cjs
```

완료 기준: NFR-31-01~04 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| mount 순서에 기대던 코드가 순서 고정 후 깨짐 | 31-a에서 현재 순서를 테스트로 먼저 기록하고 같은 순서로 등록 |
| play copy 복제 비용 | `SceneDocument`는 불변 구조라 참조 복제로 시작하고, 쓰기 시 command로만 갈라짐 |
| 영속 월드 게임이 play 변경을 잃음 | `persistPlayChanges` 기본값을 에디터와 런타임에서 다르게 둠(열린 질문 1) |

## 10. 열린 질문

1. `persistPlayChanges` 기본값을 에디터 false, 런타임 true로 둘 것인가.
2. pause 중 네트워크 동기화(원격 플레이어 보간)는 계속할 것인가.
3. edit 모드에서 물리 미리보기(fixed lane 동작)를 옵션으로 제공할 것인가.
