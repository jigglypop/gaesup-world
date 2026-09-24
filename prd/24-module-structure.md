# PRD-24 모듈 구조와 죽은 코드

| 항목 | 값 |
|---|---|
| 우선순위 | P2 |
| 트랙 | Fast |
| 선행 PRD | 13(store 분할), 21(canonical 결정), 23(boilerplate 삭제) |
| 담당 agent | architect, reviewer |

## 1. 배경과 문제

타입 안전성 지표는 좋다(`any` 0, `@ts-ignore`/`@ts-expect-error` 0, eslint-disable 0, TODO 1). 유지보수 비용을 키우는 것은 **파일 크기**, **복제**, **쓰이지 않는 코드**다. 800줄을 넘는 파일이 9개이고, 가장 큰 파일은 2,142줄짜리 단일 컴포넌트다. 거의 같은 `plugin.ts`가 13개 도메인에 복제되어 있고, 참조 0인 모듈이 여럿이다.

## 2. 목표 / 비목표

**목표**
- 800줄 초과 파일 0, 500줄 초과 모듈 10개 이하, 200줄 초과 컴포넌트 30개 이하.
- 복제된 plugin 정의를 테이블 기반 하나로 만든다.
- 미사용 export를 CI에서 검출한다.

**비목표**
- 기능 변경. 분할은 동작 보존 리팩터링이다.
- 기존 `interface`의 기계적 `type` 변환(AGENTS.md: 직접 다루는 파일만).

## 3. 현재 상태

### 3.1 대형 파일 [실측]

| 파일 | 줄 | 분리 방향 | 처리 |
|---|---|---|---|
| `editor/components/panels/BuildingPanel/brain/index.tsx` | 2,142 | 단일 컴포넌트 약 2,074줄 → graph editor, node inspector, condition/action editor, preview-state hook, validation util | 24-c |
| `building/stores/buildingStore.ts` | 1,664 | 13 PRD FR-13-12 | 13-j |
| `building/components/BuildingUI/index.tsx` | 1,555 | 21 PRD FR-21-07(wrapper화) | 21-j |
| `building/components/TileSystem/index.tsx` | 907(D-03 수정으로 1,048에서 감소, 2026-09-24 2차) | shape별 mesh 파일, material hook(12 PRD 배치 통합과 함께) | 12-f |
| `npc/stores/npcStore.ts` | 1,010 | 13 PRD FR-13-13 | 13-j |
| `editor/.../BuildingPanel/index.tsx` | 957 | handler·derived를 hook으로, 섹션 컴포넌트 분리(13-f와 함께) | 13-f |
| `networks/core/PlayerNetworkManager.ts` | 879 | transport / codec / session / reconnect(21-h, 14-d와 함께) | 21-h |
| `src/index.ts` | 815 | 도메인별 export 모듈로 분리(15 PRD) | 15-d |
| `building/components/mesh/sakura.tsx` | 811 | batch builder / material / falling particles | 12-j |
| `building/components/mesh/fire/index.tsx` | 767 | GLSL을 compat 경계로(12-n) | 12-n |
| `navigation/NavigationSystem.ts` | 744 | grid build / A* / 경로 후처리 | 24-d |
| `building/types/index.ts` | 739 | 영속 데이터 타입 / 편집 UI 타입 | 13-j |
| `networks/core/NPCNetworkManager.ts` | 679 | PlayerNetworkManager와 공통 transport 추출 | 24-d |

2차 재측정 [실측]: 800줄 초과 9개, 500줄 초과 29개(목표 10). 위 표에 없는 500줄 초과 파일은 `AnimatorRuntime` 610, `AutomationSystem` 604, `InteractionBridge` 599, `scene-object/commands.ts` 590, `building/model/placement.ts` 584, `GameplayEventPanel` 577(useState 9개, 컴포넌트 9개), `EditorLayout` 572, `Grass` 562, `createGaesupRuntime` 528, `SaveLoadManager` 519, `RemotePlayer` 518, `BlueprintPanel` 511이다.

### 3.2 복제 [확인]

- `audio/time/weather/catalog/crafting/events/i18n/inventory/mail/quests/relations/scene/town`의 `plugin.ts`가 38~40줄로 거의 같다(약 550줄). 서비스 ID 문자열도 파일마다 중복(22 PRD FR-22-01). 2차 재측정: `plugins/storeDomainPlugin.ts`가 생겨 14개 도메인이 쓰지만, 38~40줄 wrapper 13개(약 510줄)가 literal 서비스 ID와 함께 남아 있다.
- 2차 분석 추가(2026-09-24):

| 복제 | 위치 |
|---|---|
| 정의 registry 싱글턴 6개(약 240줄, 전역) | crafting `RecipeRegistry`, dialog `DialogRegistry`, events `EventRegistry`, farming `CropRegistry`, items `ItemRegistry`, quests `QuestRegistry` |
| pub/sub 3종 이상 | mitt(`camera/bridge/BaseCameraSystem`만), `plugins/EventBus`, `tools/core/ToolEvents`, 직접 만든 listener Set 약 20곳(AbstractBridge, ScriptRuntime, scene-object manager, AutomationSystem, visit channel, WorldInputBackend, AnimatorRuntime 등) |
| bridge 방식 | `CoreBridge` 상속 6개, 일반 클래스(BuildingBridge, InteractionBridge), camera는 mitt + `useCameraBridge`. `AbstractSystem`은 6개만 사용하고 NavigationSystem, AudioEngine, NPCScheduler, SaveSystem, ScriptRuntime, AnimatorRuntime은 사용하지 않음 |
| 이동·물리 컴포넌트 2벌 | `blueprints/core/components/{GravityForce,CharacterMovement}Component` vs `motions/core/forces/GravityComponent`, `movement/{Direction,Impulse}Component` |
| 휴머노이드 rig 계약 2벌 | `src/avatar`(rig.json, `HUMANOID_BONES`, `BODY_REGIONS`, `manifest.ts:47` `'gaesup-humanoid-v1'` 하드코딩) vs `core/character/skeleton.ts`(`GAESUP_SKELETON_ID`, `BODY_REGIONS`) |
| 수학 헬퍼 | `utils/math.ts` `MathUtils`(`THREE.MathUtils`와 같은 이름·기능), `clamp`가 `utils/sfe.ts`와 `cameraUtils.clampValue`에 또 있음, 인라인 `Math.max(…Math.min(…))` 80곳 |
| UI 헬퍼 | `cx` 7곳, `mergeLabels`/`mergeStyle`/`defaultClassFor` 5곳(`camera/components/*/helpers.ts`, `character/components/*/helpers.ts`, `editor/panels/{CameraSettingsTab,ProjectAssetsPanel}/helpers.ts`) |
| 같은 이름 다른 코드 | 2개 이상 파일에서 선언된 export 값 이름 53개. 예: `CAMERA_CONSTANTS`(`camera/core/constants.ts`, `constants/index.ts` 두 벌 정의), `createWorldSlice` 2, `useNetworkStats` 2(`hooks/`, `networkStateStore.ts:172`), `GameplayEventEngine`·`createDefaultGameplayEventRegistry`·`getGameplayEventRegistry`(`gameplay/events/clientServices.ts`가 `engine.ts`/`registry.ts`를 가림), `DebugLog`·`PerformanceLog`·`EnableEventLog` 각 2 |
| 명칭 충돌 | "Blueprint" 5가지(`src/blueprints`, `npc/core/blueprint.ts` NPC brain, `GameplayEventBlueprint`, `BlueprintManifest`, `boilerplate/decorators/blueprint`). "events" 3가지(`core/events` 달력, `core/gameplay/events` 트리거, `plugins/EventBus`). `catalog`는 에셋 카탈로그가 아니라 아이템 수집 기능 |
- 에디터 패널 필드 목록과 id → group 역인덱스가 `BuildingPanel`과 `BuildingUI`에 중복(13 PRD).
- vite react-swc 설정 두 분기(`vite.config.ts:159-172`, `229-242`), 별칭 4곳(25 PRD).

### 3.3 쓰이지 않는 코드 [확인]

| 대상 | 참조 |
|---|---|
| `utils/result.ts`(65줄), `utils/conditions.ts`(41줄) | 0 |
| `stores/domain/{camera,physics,ui,gameplay}Store.ts` | 테스트만 |
| `networkStateStore`, `networkConfigStore` | 공개 export만, 내부 0 |
| `editor/hooks/useEditor.ts:8-36` | 0 |
| `economy/stores/shopStore.ts:61` `rollDailyStock` | 호출 0 |
| `threeObjectPool` | 정의만 |
| `WorldSystem.update` | 본문 비어 있음 |
| `BuildingBridge` | export만, 내부 0 |
| `NodeTreeParticles.tsx` | 테스트만(12-F11) |
| `render/upload.ts`의 meta/indirect args buffer | 테스트 외 바인딩 0(12-F07) |
| boilerplate decorator 14종, `SystemRegistry`, `ManagedEntity` | 23 PRD |
| `blueprints`의 `no-explicit-any: off`(`eslint.config.js:190`) | 대상 코드에 any 0, 죽은 설정 |
| 2차 분석: 파일 전체가 미사용인 28파일(1,394줄) | 예: `interactions/components/Clicker/WaveEffect.tsx` 146, `building/components/mesh/grass/grassWasm.ts` 117, `CharacterMenu/examples.tsx` 94, `rendering/tsl/water.ts` 71, `BuildingPanel/presets.tsx` 62, `camera/factories/CameraControllerFactory.ts` 53, `BillboardRenderer` 51, `interactions/bridge/{CommandProcessor,EventManager}.ts` 47·45, `PreviewBillboard` 39, `rendering/canvas.ts` 24, `BlueprintList`, `CategoryTabs`, admin `NameTag`·`Loading` |
| 2차 분석: 미사용 export | src·examples·테스트 어디서도 import하지 않고 엔트리에서도 도달하지 않는 export 270개(값 122, 타입 148). 테스트에서만 쓰는 export 60개(`constants/index.ts` 전체, `CameraCollisionIndex`, `sweepSphereTriangle`, `BloomRenderer`, `FlagMesh` 등) |
| 2차 분석: 미사용 devDependency | `react-use-refs`(jest transform 패턴에만 등장), `@types/stats.js`, `@types/identity-obj-proxy`, `@typescript/native` |
| 2차 분석: `immer` 사용처 | building store와 `npc/stores/npcStore.ts`(15-F04 정정) |

### 3.4 코드 냄새 [실측]

| 지표 | 값 | 비고 |
|---|---|---|
| `as unknown as` | 33(테스트 163) | |
| non-null `!` | 258 | AnimatorRuntime 19, WeatherEffect 17 |
| `console.*` | 27(logger 제외) | `no-console` 규칙 없음. `PlayerNetworkManager.ts:148-163` 등 |
| `interface` | 494 | 신규 금지, 수정 파일부터 전환 |
| 인코딩 깨진 주석 | 3파일 12줄 | 23 PRD FR-23-11 |
| 루트 추적 파일 | `info.tsx`(32KB), `todolist.md`, `index.ts` | 목적 확인 필요 |

## 4. 요구사항

**FR**
- FR-24-01: `defineStoreDomainPlugin({ name, serviceKey, createStore, serialize?, hydrate? })` 테이블 기반 정의로 13개 `plugin.ts`를 대체한다. 공개 팩토리 이름은 wrapper로 유지한다.
- FR-24-02: 3.1절 파일을 표의 처리 slice에서 분할한다. 다른 PRD에 속하지 않는 `brain/index.tsx`, `NavigationSystem.ts`, `NPCNetworkManager.ts`는 이 PRD에서 처리한다.
- FR-24-03: knip(또는 ts-prune)을 devDependency로 추가하고 미사용 export 보고서를 CI에 올린다. 초기에는 baseline ratchet으로 운영한다.
- FR-24-04: 3.3절 미사용 코드를 삭제한다. 공개 export는 `@deprecated` 후 major 제거.
- FR-24-05: `no-console`(logger 파일 제외) 규칙을 켜고 27건을 logger로 바꾼다.
- FR-24-06: quality ratchet에 `asUnknownAs`, `nonNullAssertions`, `filesOver800` 카운터를 추가한다.
- FR-24-07: 정의 registry 6개를 kernel의 `createDefinitionRegistry<T>()` 하나로 바꾸고 runtime 스코프로 옮긴다(22 FR-22-11).
- FR-24-08: pub/sub을 kernel emitter 하나로 통일한다. `mitt` 의존성을 제거한다. 직접 만든 listener Set은 새로 만들지 않고, 수정하는 파일부터 emitter로 바꾼다.
- FR-24-09: 수학 헬퍼는 `THREE.MathUtils`와 kernel `math` 하나로, UI 헬퍼(`cx`, `mergeLabels` 등)는 공용 모듈 하나로 합친다.
- FR-24-10: 같은 이름 export 53개를 정리한다. 내부 심볼은 즉시, 공개 심볼은 `@deprecated` 후 major에서 한다.
- FR-24-11: 명칭을 정리한다. NPC brain blueprint → behavior graph, `catalog` → collection, 달력 `events` → calendar. 공개 이름 변경은 major에서 한다.
- FR-24-12: 휴머노이드 rig 계약과 이동·물리 컴포넌트를 각각 하나로 합친다(`src/avatar` rig를 canonical, blueprints 컴포넌트는 30-g에서 제거).

**NFR**
- NFR-24-01: 분할은 동작을 바꾸지 않는다. 각 slice 전후 해당 도메인 테스트와 export snapshot이 동일하다.
- NFR-24-02: ratchet 지표는 단조 감소한다.

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 24-a | ratchet 카운터 추가, `no-console`, knip baseline | CI에서 증가 시 실패 |
| 24-b | `defineStoreDomainPlugin`, 13개 plugin 이전 | plugin 관련 줄 수 약 550 → 150 이하, 공개 팩토리 불변 |
| 24-c | `BuildingPanel/brain` 분할 | 파일 500줄 이하, 에디터 브라우저 probe 통과 |
| 24-d | `NavigationSystem`, `NPCNetworkManager` 분할과 공통 transport | 도메인 테스트 통과 |
| 24-e | 3.3절 미사용 코드 삭제(비공개 먼저, 공개는 deprecate) | knip 보고 감소 |
| 24-f | 루트 추적 파일 정리(`info.tsx`, `todolist.md`, `index.ts`) | 사용자 확인 후 |
| 24-g | 정의 registry, emitter, 수학·UI 헬퍼 통합(FR-24-07~09) | registry 싱글턴 0, `mitt` 제거, `cx` 정의 1 |
| 24-h | 같은 이름 export 정리와 명칭 정리(FR-24-10, 11). 공개 이름은 major | 중복 이름 export 수 감소 기록 |

24-a(knip baseline)와 24-e(미사용 28파일 삭제)는 구조 변경보다 먼저 한다. 삭제된 코드는 이후 slice에서 옮길 필요가 없다.

24-e 1차 완료(2026-09-24): 참조 0 파일 28개와 운영 참조 없는 `BloomRenderer`, `constants/index.ts`, `RiderRef`, `stores/domain/*`를 테스트와 함께 삭제했다. `utils/result.ts`(FR-21-05 기반), `CascadedSun`(진행 중 기능), `NodeTreeParticles`(12-n), `src/next` 코어(30 PRD 기반)는 유지한다. 품질 지표: interface 493→486, console 27→26, 초과 컴포넌트 47→46.

## 6. 공개 API 영향

- `networkStateStore`, `networkConfigStore`, `BuildingBridge` 등 공개지만 내부 미사용 심볼은 `@deprecated` 후 major 제거.
- plugin 팩토리는 이름과 시그니처를 유지한다.

## 7. 검증과 완료 기준

```bash
node scripts/check-quality-ratchet.cjs
corepack pnpm exec eslint src examples --max-warnings 0
corepack pnpm test -- --runInBand
corepack pnpm test -- src/__tests__/exportSnapshot.test.ts --runInBand
node scripts/probe-creator-menu.cjs
```

완료 기준: 2절 목표 수치와 NFR-24-01~02 충족.

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 대형 컴포넌트 분할 중 UI 회귀 | 기존 probe(`probe-creator-*`, `probe-editor-return.cjs`)로 확인, 분할과 동작 변경을 같은 PR에 섞지 않음 |
| knip 오탐(동적 import, examples 전용 export) | 설정에 entry와 ignore 목록 명시 |

## 9. 열린 질문

1. 루트의 `info.tsx`, `todolist.md`, `index.ts`는 유지 대상인가.
2. 공개 export 중 내부 미사용 심볼의 외부 사용 여부를 확인할 수단(다운스트림 저장소 목록)이 있는가.
