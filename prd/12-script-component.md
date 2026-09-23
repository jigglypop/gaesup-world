# PRD-12 스크립트 컴포넌트

| 항목 | 값 |
|---|---|
| 우선순위 | P0 (Unity 격차를 가장 크게 줄이는 신규 기능) |
| 트랙 | Epoch (새 공개 계약) |
| 선행 PRD | 10 (SceneObject 단일 모델), 11 (프레임 단계) |
| 후속 PRD | 18 (Inspector 편집), 25 (빌드 시 스크립트 번들) |

## 1. 배경과 문제

- Unity 사용자는 `MonoBehaviour`를 붙여 오브젝트에 동작을 준다. gaesup-world에는 이에 해당하는 실행 모델이 없다.
- `scene-object/components.ts`에 `gaesup.script` 타입과 `ScriptComponentData { scriptId, props }`가 정의되어 있지만 실행기가 없다.
- 지금 동작을 붙이려면 React 컴포넌트를 직접 짜서 스토어와 브리지를 조합해야 한다. 에디터에서 "이 문에 열림 동작 붙이기"를 할 수 없다.
- `src/blueprints/`(노드 그래프)는 별도 실행 모델을 가진다. 스크립트와 수명주기가 통일되어 있지 않다.

## 2. 목표 / 비목표

### 목표
1. SceneObject에 붙이는 사용자 스크립트 API를 정의한다.
2. 스크립트는 프레임 단계(PRD-11)에 연결된 수명주기를 가진다.
3. 스크립트 파라미터는 스키마로 선언하고 Inspector에서 편집된다.
4. 스크립트가 엔진 기능(입력, 물리 이벤트, 오디오, 대화, 인벤토리)에 접근하는 경로는 **컨텍스트 객체**로 제한한다.
5. blueprint 그래프는 "비주얼 스크립트"로 같은 수명주기에서 실행된다.

### 비목표
- 에디터 안 코드 편집기와 런타임 컴파일. 스크립트는 사용자 앱 코드에서 등록한다.
- 샌드박스 실행(신뢰하지 않는 코드). 스크립트는 앱 코드와 같은 신뢰 수준이다.
- 핫 리로드 보장. Vite HMR 수준에서 가능한 만큼만.

## 3. 요구사항

### 기능 (FR)
| ID | 요구사항 |
|---|---|
| FR-1 | `defineScript({ id, props, create })`로 스크립트를 정의하고 `registerScript`로 등록한다. |
| FR-2 | 수명주기: `onAwake`, `onStart`, `onUpdate`, `onFixedUpdate`, `onLateUpdate`, `onEnable`, `onDisable`, `onDestroy` |
| FR-3 | 물리 이벤트: `onCollisionEnter/Exit`, `onTriggerEnter/Exit` (collider의 `trigger` 플래그와 연결) |
| FR-4 | 상호작용 이벤트: `onInteract` (`gaesup.interactable` 컴포넌트와 연결) |
| FR-5 | props 스키마: number, boolean, string, enum, vector3, color, assetRef, objectRef. 기본값과 범위 포함 |
| FR-6 | 컨텍스트 API: `ctx.object`(transform 읽기/쓰기), `ctx.find(query)`, `ctx.input`, `ctx.time`, `ctx.physics`, `ctx.audio`, `ctx.events.emit/on`, `ctx.services.get(key)` |
| FR-7 | 에디터 모드에서는 스크립트가 실행되지 않고, Play 모드에서만 실행된다. Play 종료 시 상태가 복원된다 (`editor/playMode.ts` 연결). |
| FR-8 | 등록되지 않은 `scriptId`는 오류가 아니라 경고 표시와 비활성 상태로 로드된다. |
| FR-9 | 스크립트 인스턴스 상태는 기본적으로 저장되지 않는다. `persist` 선언한 필드만 저장된다. |

### 비기능 (NFR)
| ID | 요구사항 |
|---|---|
| NFR-1 | 스크립트 1,000개가 빈 `onUpdate`를 가질 때 프레임 오버헤드 0.5ms 이하 |
| NFR-2 | `onUpdate`가 없는 스크립트는 프레임 목록에 들어가지 않는다 |
| NFR-3 | 스크립트 예외는 해당 인스턴스만 비활성화, 에디터 콘솔에 오브젝트 id와 함께 표시 |
| NFR-4 | 스크립트 런타임은 Layer 1(React 무관). React는 등록과 호스트만 담당 |

## 4. 설계

### 4.1 정의 API

```ts
export const DoorScript = defineScript({
  id: 'game.door',
  props: {
    openAngle: prop.number({ default: 90, min: 0, max: 180 }),
    speed: prop.number({ default: 2 }),
    requiresKey: prop.assetRef({ kind: 'item', optional: true }),
  },
  create: (ctx, props) => {
    let target = 0;
    return {
      onInteract: () => {
        if (props.requiresKey && !ctx.services.get('inventory').has(props.requiresKey)) return;
        target = target === 0 ? props.openAngle : 0;
      },
      onUpdate: (dt) => {
        ctx.object.rotateTowardsY(target, props.speed * dt);
      },
    };
  },
});

registerScript(DoorScript);
```

- 클래스 대신 팩토리 함수를 쓴다. 데코레이터와 `emitDecoratorMetadata` 제약을 피하고, 클로저로 상태를 둔다.
- `props` 스키마에서 TS 타입을 추론한다.

### 4.2 런타임 구조

```
src/core/scripting/                 (신규 도메인)
  core/
    registry.ts        scriptId → 정의
    ScriptRuntime.ts   SceneDocument 구독, 인스턴스 생성/파괴, 단계별 목록 유지
    context.ts         ScriptContext 구현 (서비스 조회는 plugin services 경유)
    props.ts           prop 스키마, 검증, 기본값 채우기
    types.ts
  bridge/
    ScriptBridge.ts    런타임 ↔ 에디터 (실행 상태, 오류 목록 스냅샷)
  react/
    ScriptRuntimeHost.tsx   FrameSchedulerHost에 단계별 tick 등록
  plugin.ts
```

- `ScriptRuntime`은 SceneDocument controller를 구독한다. `gaesup.script` 컴포넌트가 추가·삭제·활성 변경되면 인스턴스를 만들거나 없앤다.
- `onUpdate`가 있는 인스턴스만 `script` 단계 배열에 넣는다.
- transform 쓰기는 런타임 transform 버퍼에 반영하고, Play 모드 중에는 SceneDocument에 command로 쓰지 않는다. Play 종료 시 버퍼를 버린다. 영속 변경이 필요하면 `ctx.commit(command)`를 명시적으로 호출한다.

### 4.3 물리 이벤트 연결

- `gaesup.collider { trigger: true }`를 Rapier sensor로 만든다.
- 충돌·트리거 이벤트는 `postPhysics` 단계에서 큐를 비우며 해당 오브젝트의 스크립트에 분배한다.
- 이 연결은 PRD-14의 물리 어댑터가 제공하는 이벤트 스트림을 쓴다.

### 4.4 blueprint 통합

- blueprint 그래프 실행기를 `defineScript`로 감싼 내장 스크립트 `gaesup.blueprintGraph`로 제공한다. props로 `graphId`를 받는다.
- 기존 blueprint 서브패스의 공개 API는 유지한다.

### 4.5 에디터 연동 (PRD-18)

- Inspector는 `gaesup.script` 컴포넌트를 만나면 레지스트리에서 props 스키마를 읽어 필드 UI를 만든다.
- "Add Component" 메뉴에 등록된 스크립트 목록을 노출한다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 12-a | `scripting/core`: registry, props 스키마, 검증 | 단위 테스트 |
| 12-b | `ScriptRuntime`: SceneDocument 구독, 생성/파괴, 수명주기 순서 | 수명주기 순서 테스트, enable/disable |
| 12-c | 호스트와 프레임 단계 연결, 예외 격리 | R3F 통합 테스트, NFR-1~3 |
| 12-d | 컨텍스트 API (object, find, input, time, events, services) | API별 테스트 |
| 12-e | Play 모드 연동과 상태 복원 | 에디터 play/stop 테스트 |
| 12-f | 물리·트리거 이벤트 (PRD-14 어댑터 이후) | 트리거 존 테스트 |
| 12-g | Inspector props 편집, Add Component 메뉴 | 에디터 테스트 |
| 12-h | 예제 스크립트 5종: 문, 트리거 존, 회전체, NPC 대화 트리거, 수집 아이템 | `examples/`에서 동작 |
| 12-i | blueprint 그래프를 내장 스크립트로 실행 | 기존 blueprint 테스트 통과 |

## 6. 공개 API 영향

- 새 서브패스 `gaesup-world/scripting` 추가 여부는 열린 질문. 추가하면 6파일 동시 수정 절차(`add-subpath-export` 스킬)를 따른다.
- 추가: `defineScript`, `registerScript`, `prop`, `ScriptContext` 타입, `ScriptRuntimeHost`, `createScriptingPlugin`.

## 7. 검증과 완료 기준

- 예제 5종이 `examples/`에서 Play 모드로 동작
- 스크립트 1,000개 벤치(NFR-1)
- Play 종료 후 SceneDocument가 Play 전과 동일(깊은 비교)
- 공개 API 테스트, 타입, 변경 파일 린트

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 컨텍스트 API가 비대해짐 | 서비스는 `ctx.services.get(key)` 하나로 열고 전용 메서드는 최소화 |
| React 상태와 스크립트 상태의 이중화 | 스크립트는 스토어를 직접 import하지 않고 서비스로만 접근 |
| blueprint와 스크립트의 기능 중복 | blueprint를 스크립트 위의 실행 형태로 정의해 수명주기 하나만 유지 |

## 9. 열린 질문

1. 서브패스를 새로 만들지, `gaesup-world/runtime`에 포함할지.
2. 스크립트 상태 `persist`를 1차 범위에 넣을지.
3. 스크립트 간 참조(`objectRef`)가 삭제된 오브젝트를 가리킬 때의 정책.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 12-a | 완료 | `scripting`: `defineScript`, `registerScript`, `scriptProp`(number, boolean, string, enum, vector3, color, assetRef, objectRef), `resolveScriptProps` |
| 12-b | 완료 | `ScriptRuntime`: SceneDocument 구독, 생성·파괴, awake/enable/start/update/fixed/late/disable/destroy, 컴포넌트 활성 토글 |
| 12-c | 완료 | `useScriptRuntime`, `ScriptRuntimeHost`가 `script`, `prePhysics`, `lateUpdate` 단계에 연결. 예외는 인스턴스 단위로 격리하고 최근 100건을 기록 |
| 12-d | 완료 | 컨텍스트: object 핸들(런타임 transform 버퍼), find/findOne, emit/on, services, time, commit |
| 12-e | 부분 | 런타임 transform은 문서에 쓰지 않으므로 stop 시 버려진다. `editor/playMode.ts`와의 연결은 미착수 |
| 12-f | 부분 | `dispatchPhysicsEvent`, `dispatchInteract` API까지. Rapier 이벤트 연결은 PRD-14 이후 |
| 12-g | 부분 | Inspector에 스크립트 prop 스키마와 값을 읽기 전용으로 표시(`ScriptComponentView`). 편집과 Add Component 메뉴는 미착수 |
| 12-h | 완료 | 내장 스크립트 5종: 회전체, 문, 트리거 존, 수집 아이템, 대화 트리거(`registerBuiltinScripts`). `examples/packageSurface.ts`에서 사용 |
| 12-i | 미착수 | blueprint 그래프 통합 |

서브패스는 신설하지 않고 루트(`core/index.ts`)로 내보냈다. 일반적인 이름 충돌을 피하려고 prop 헬퍼 이름은 `scriptProp`이다.

### 3차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 12-e | 부분 | `useScriptRuntime`/`ScriptRuntimeHost`에 `playMode?: ScriptPlayModeSource`(`getState().mode`, `subscribe`) 옵션. scripting이 editor를 import하지 않도록 구조적 타입이며 `EditorPlayModeController`가 그대로 맞는다. `edit`은 인스턴스 파괴(런타임 transform 버퍼 폐기), `play`는 실행, `paused`는 인스턴스를 유지하고 프레임 등록만 해제한다. 옵션이 없으면 기존처럼 항상 실행. 남은 것: 에디터 Play 버튼(`editorSlice.playMode`)과 예제에 `ScriptRuntimeHost` 마운트 |

scripting 2 suites / 7 tests 통과.

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.

### 4차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 12-e | 완료 | `useScriptObjectTransform(runtime, objectId, ref, source)`: 런타임 transform 버퍼를 `lateUpdate` 공유 채널 하나로 Object3D에 투영하고, 핸들이 사라지면(edit 복귀) 문서 transform으로 한 번 복원한다. 예제 `/creator`는 `EditorPlayModeController`(복원은 `scene-document.replace`)를 세션에 두고 마커에 회전체 스크립트를 붙인다. Play 시 회전, Stop 시 원위치 |
| 12-g | 완료 | Inspector에서 스크립트 prop 편집(`ScriptPropField`: number, boolean, enum, color, string. 나머지 종류는 읽기 전용)과 스크립트 추가 메뉴(`ScriptPicker`, 등록된 스크립트 목록). 편집은 기존 override를 유지한 채 `props`를 교체한 컴포넌트 데이터로 `onUpdateComponent`를 호출한다. `Editor`/`EditorLayout`의 `onUpdateSceneComponent`, 에디터 커맨드 `updateComponent`(undo 가능), 예제 세션까지 연결 |

검증: editor, scene-object, scripting, examples 43 suites / 252 tests 통과. 타입체크(src, examples)와 변경 파일 린트 통과.

### 5차 (2026-09-23)

| Slice | 상태 | 내용 |
|---|---|---|
| 12-f | 완료 | `SceneObjectBody`(PRD-14 14-i)의 물리 이벤트를 `ScriptRuntime.dispatchPhysicsEvent`로 연결했다. `ScriptRuntime.on(name, listener)` 외부 구독을 공개하고, `stop()`이 외부 구독을 지우지 않게 했다(스크립트 구독은 인스턴스 파괴 시 해제). 예제 `/world`의 장면 문서에 트리거 존(레이어 `interactable`, box 트리거, `triggerZone` 스크립트)을 두고 진입·이탈 이벤트로 색을 바꾼다. 브라우저에서 캐릭터가 (1.02, 1.02)에서 진입해 노란색, (0.50, 0.50)에서 이탈해 파란색으로 돌아오는 것을 확인했다. 스크립트 이벤트 종류 타입은 `SceneObjectPhysicsEventKind` 별칭이다 |
