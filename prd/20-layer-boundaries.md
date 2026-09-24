# PRD-20 계층 경계와 의존 구조

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Fast |
| 선행 PRD | 25(검사 스크립트를 verify에 연결) |
| 담당 agent | architect |

## 1. 배경과 문제

AGENTS.md는 3계층을 정의한다. Layer 1 `src/core/<domain>/core/`는 React, Zustand, R3F를 import하지 않고, Layer 2 `bridge/`는 `CoreBridge`로 engine과 snapshot을 연결하며, Layer 3이 React 통합을 맡는다. 강제 장치도 있다(ESLint 제한, `architectureBoundaries.test.ts`, `check-entry-isolation.cjs`). 하지만 강제 장치에 구멍이 있고, 도메인 간 의존이 거의 하나의 덩어리로 얽혀 있다.

## 2. 목표 / 비목표

**목표**
- Layer 1 전이 누수를 0으로 만들고 CI에서 강제한다.
- Layer 2가 React를 끌어오지 않게 한다.
- 도메인 SCC 크기를 줄이는 ratchet을 둔다.

**비목표**
- 도메인 폴더 구조 재배치. 모듈 이동은 필요한 곳만 한다.
- `eslint-plugin-boundaries` 같은 새 플러그인 도입(기존 `no-restricted-imports`와 스크립트로 충분한지 먼저 확인).

## 3. 현재 상태

**20-F01 ESLint Layer 1 규칙이 정확한 이름만 막음** [확인]
- `eslint.config.js:170-180`이 `paths`로 `react`, `zustand`, `@react-three/fiber`만 막는다. `zustand/vanilla`, `react/jsx-runtime`, `@react-three/drei`, `@react-three/rapier`, store 상대경로 import는 통과한다.

**20-F02 전이 누수 5건과 허용치 일치** [실측]
- Layer 1 파일 77개 중 5개(npc/core 전체)가 zustand에 도달한다. 경로는 `npc/core/blueprint.ts:1-2` → `quests/stores/questStore`, `relations/stores/friendshipStore`, 그리고 `:24-27` `legacyConditionStores`.
- `check:layer1 --max-violations=5` 허용치가 현재 위반 수와 같다.
- `check:layer1`, `check:entries`, `check:quality`는 `verify`와 CI 어디에도 없다.

**20-F03 Layer 2가 boilerplate barrel을 거쳐 React에 도달** [실측]
- `WorldBridge`가 `@core/boilerplate` barrel → `boilerplate/hooks`로 React/R3F import 10개에 도달한다. MotionBridge, PhysicsBridge, NetworkBridge, AnimationBridge, UIBridge도 같은 barrel을 쓴다.
- `camera/bridge/useCameraBridge.ts`는 bridge 폴더 안의 React hook이다.
- `boilerplate/hooks/useEntity.ts:7-16`이 motions hook과 gaesupStore에 의존한다(위치 오류).

**20-F04 Layer 1의 값 import** [확인]
- `motions/core/*` 8개 파일이 `RapierRigidBody`를 `import type`이 아닌 값 import로 가져온다. `@typescript-eslint/consistent-type-imports`가 없다.

**20-F05 도메인 SCC** [실측]
- runtime import 기준 45개 도메인이 단일 SCC다. runtime, boilerplate, src:core, plugins를 빼도 29개가 한 SCC다.
- `runtime`은 fan-in 40, fan-out 35다. composition root(`createGaesupRuntime.ts`가 도메인 모듈 약 60개 import)이면서 leaf(`runtime/frame/index.ts`, `runtimeContext`를 도메인들이 import)다.
- 파일 단위 순환은 2개: `Autowired ↔ AbstractBridge ↔ ManagedEntity ↔ boilerplate/types`, `animation/bridge/types ↔ core/types`. `import/no-cycle`을 켜도 0건(도메인 barrel 경유는 파일 순환으로 잡히지 않음).

**20-F06 barrel 과다** [실측]
- index 파일 148개에 `export *` 401개. 도메인 간 barrel import 298건. `src/index.ts` 815줄, 루트 export 1,082개, 루트에서 도달하는 파일 864개.

**20-F07 architectureBoundaries 테스트의 baseline 허용** [확인]
- 직접 import만 검사하고 upward edge 14개와 rapier edge 9개를 baseline으로 허용한다. stale 검출은 있다(보존 자산).

### 3.1 2차 분석 추가(2026-09-24)

2차 재측정 [실측]: 20-F02(위반 5건, 허용치 5), 20-F05(타입 import 포함 45개, 값 import만 42개 도메인 SCC, runtime·boilerplate·plugins·core 루트를 빼도 29개), 20-F06(루트 폐포 867파일 101,162줄로 src의 91%, `export *` 445개)은 그대로다. kernel 분리(FR-20-06)는 시작 전이다. `runtime/frame`이 아직 `boilerplate/hooks/frameTime`과 `boilerplate/types`를 import한다.

**20-F08 엔진 도메인이 게임플레이 도메인에 의존(composition root 밖 18곳)** [확인]

| 엔진 모듈 | 의존 대상 |
|---|---|
| `camera/cinematic.ts` | dialogStore, sceneStore, characterStore |
| `camera/hooks/useCamera.ts`, `hooks/useKeyboard/index.ts`, `ui/hooks/useMinimap.ts`, `motions/controller/EntityController.tsx` | buildingStore |
| `rendering/sky/index.tsx`, `rendering/fog/DynamicFog.tsx`, `rendering/postprocess/ColorGrade.tsx`, `audio/hooks/useAmbientBgm.ts` | weatherStore |
| `rendering/tsl/toonWater.ts` | `building/components/mesh/water/normals` |
| `audio/components/Footsteps/index.tsx` | buildingStore, building constants |
| `motions/core/movement/{Direction,Impulse}Component.ts`(Layer 1) | `interactions/core` |
| `motions/entities/refs/{PartsGroupRef,RigidPartRef}.tsx` | `character/skeleton`, `character/boneAttachment` |
| `world/components/{BugSpot,FishSpot,Tree}` | tools, inventory, events, weather(게임플레이 콘텐츠가 엔진 `world` 도메인에 있음) |
| `world/components/WorldContainer/index.tsx:6` | `editor/components/panels/PerformanceCollector`(1줄 re-export) |
| `utils/memoization.ts` → `boilerplate/decorators`, `platform/serverHost.ts` → `networks/adapter` | |

`architectureBoundaries.test.ts`는 `*/core/` 파일만 검사하므로 이 의존을 잡지 못한다.

**20-F09 입력 타입을 interactions가 소유** [확인]
- `KeyboardState`, `GamepadState`, `InputAdapter`, `InputBackend`, `createMemoryInputBackend`가 `interactions/core/{types,adapter}.ts`에 있다(`interactions/core/types.ts:3`). 그래서 `input/*`(WorldInputBackend, WorldGamepadInput, WorldInputActions, movementAxes), motions, `stores/gaesupStore`, hooks, camera가 모두 interactions를 import한다.

**20-F10 계층 검사 범위가 코드의 11%** [실측]
- `*/core/` 77파일 12,210줄만 Layer 1 규칙 대상이다. React를 쓰지 않는 530파일 44,689줄(40%)이 검사 밖에 있다. 예: scene-object(19파일 3,116줄), plugins, navigation, scripting, prefab, gameplay/events, networks/adapter, input.

## 4. 요구사항

**FR**
- FR-20-01: ESLint Layer 1 규칙에 `patterns`(`react`, `react/*`, `react-dom*`, `zustand`, `zustand/*`, `@react-three/*`, `**/stores/**`, `**/hooks/**`, `**/components/**`)를 추가한다.
- FR-20-02: `npc/core`의 store 의존을 port 주입(`NPCBrainConditionStores`)으로 바꾸고 legacy 기본값을 bridge/plugin 계층으로 옮긴다. `check:layer1 --max-violations=0`.
- FR-20-03: `@core/boilerplate` barrel을 `boilerplate/bridge`, `boilerplate/react`로 나눈다. bridge는 `@core/boilerplate/bridge`에서만 import한다.
- FR-20-04: `useCameraBridge`를 `camera/hooks/`로, `useEntity`를 `motions/hooks/`로 옮긴다(re-export 유지).
- FR-20-05: `@typescript-eslint/consistent-type-imports`를 켠다.
- FR-20-06: `runtime/frame`과 `runtimeContext`를 도메인 import가 없는 `src/core/kernel/`로 분리한다. `createGaesupRuntime`만 composition root로 남긴다.
- FR-20-07: 도메인 SCC 분석 스크립트를 jest 테스트로 옮겨 baseline(SCC 크기, 도메인 간 edge 목록)을 고정하고 감소만 허용한다.
- FR-20-08: `check:layer1`, `check:entries`, `check:quality`를 `verify`와 CI에 추가한다(25 PRD).
- FR-20-09: 도메인 간 import는 도메인의 공개 index 또는 명시된 하위 경로만 허용한다. 내부 파일 직접 import는 lint로 막는다.
- FR-20-10: 엔진 도메인(motions, camera, rendering, audio, world 셸, hooks, ui, utils)은 게임플레이 도메인을 import하지 않는다. 시간·날씨는 `EnvironmentState` port, 지면 종류·높이는 `SurfaceProvider` port, 편집 모드는 `runtime.mode`(31 PRD)로 받는다. `BugSpot`, `FishSpot`, `Tree` 같은 콘텐츠는 게임플레이 kit으로 옮긴다.
- FR-20-11: 입력 타입과 `createMemoryInputBackend`를 `input/core`로 옮긴다(interactions에는 re-export 유지).
- FR-20-12: 계층 규칙을 뒤집는다. React, zustand, R3F import는 `components/`, `hooks/`, `react/`, `stores/` 폴더에서만 허용하고 나머지 모든 폴더에 Layer 1 규칙을 적용한다.

**NFR**
- NFR-20-01: Layer 1 전이 누수 0.
- NFR-20-02: Layer 2 모듈에서 React 도달 0(bridge가 hook을 포함하는 도메인은 hook을 `hooks/`로 이동).
- NFR-20-03: 도메인 SCC 크기 단조 감소.

## 5. 설계

### 5.1 kernel 분리

```
src/core/kernel/          ← 도메인 import 0
  frame/ (FrameScheduler, phases, useEngineFrame, useSharedFrame)
  runtimeContext
  serviceKeys (22 PRD)
src/core/runtime/         ← composition root
  createGaesupRuntime
src/core/<domain>/        ← kernel만 import, 다른 도메인은 port로
```

`runtime/frame/index.ts`의 도메인 간 import 53건은 kernel로 옮긴 뒤 도메인 쪽에서 채널을 등록하는 방향으로 뒤집는다.

### 5.1.1 목표 계층(웹 유니티)

```
kernel      frame(FrameScheduler), frameTime, emitter, logger·reportError, Result,
            typed service key, 정의 registry 팩토리, math                (도메인 import 0)
engine      input(InputBackend 소유) → motions/physics, camera, animation, navigation,
            assets(GLTF 캐시 하나), audio, save, scene-object·prefab·scripting·EntityWorld(30~32 PRD)
rendering   rendering, effects, next. 환경 정보는 port(EnvironmentState, SurfaceProvider)로 받음
world shell WorldContainer, WorldPhysics, createGaesupRuntime(kernel + engine + 등록된 kit)
kits        kit별 plugin(store + registry + components): building, npc, weather, farming, crafting,
            economy, inventory·items, mail, quests, relations, town, dialog, catalog, events, tools,
            interactions, world 콘텐츠(BugSpot, FishSpot, Tree), cinematic
editor      editor, project-settings, blueprints/editor, admin
```

의존은 위에서 아래로만 흐른다. 엔트리 하나는 계층 하나에 대응한다(`runtime` = kernel + engine + world shell, kit은 kit별 서브패스). 계층 그래프는 jest ratchet(FR-20-07)으로 강제한다.

### 5.2 검사 계층

| 검사 | 대상 | 실행 |
|---|---|---|
| ESLint `no-restricted-imports` patterns | 직접 import | lint |
| `check-entry-isolation --layer1` | 전이 import | verify, CI |
| `architectureBoundaries.test.ts` | upward edge baseline | jest |
| SCC baseline 테스트 | 도메인 그래프 | jest |

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 20-a | ESLint patterns 추가, `consistent-type-imports` | lint 통과, Layer 1 새 위반을 넣으면 실패 |
| 20-b | npc/core port 주입 | `check:layer1 --max-violations=0` 통과 |
| 20-c | boilerplate barrel 분리, bridge import 경로 변경 | Layer 2 React 도달 0 |
| 20-d | `useCameraBridge`, `useEntity` 이동 | export snapshot 불변 |
| 20-e | SCC baseline 테스트 추가 | 현재값 고정, 새 도메인 간 edge 추가 시 실패 |
| 20-f | kernel 분리(FR-20-06) | SCC 크기 감소 기록 |
| 20-g | 도메인 내부 파일 직접 import 금지 lint | barrel import 수 기록 |
| 20-h | 입력 타입 `input/core` 이동(FR-20-11), `WorldContainer`의 editor 경유 import 제거 | 도메인 간 edge 약 30개 감소, export snapshot 불변 |
| 20-i | 엔진 → 게임플레이 18곳을 port로 교체(FR-20-10). 날씨(`EnvironmentState`) → 지면(`SurfaceProvider`) → 편집 모드(31-e) 순서 | 20-F08 표의 edge 0, SCC 크기 감소 기록 |
| 20-j | 계층 규칙 반전(FR-20-12), 검사 범위 확대 | Layer 1 검사 대상 파일 비율 기록, 위반 0 |

## 7. 공개 API 영향

없음. 파일 이동은 re-export로 공개 경로를 유지한다.

## 8. 검증과 완료 기준

```bash
corepack pnpm exec eslint src examples --max-warnings 0
node scripts/check-entry-isolation.cjs --layer1 --max-violations=0
node scripts/check-entry-isolation.cjs src/server-contracts.ts
corepack pnpm test -- src/__tests__/architectureBoundaries.test.ts src/__tests__/exportSnapshot.test.ts --runInBand
```

완료 기준: NFR-20-01~03 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| kernel 분리 중 대량 import 경로 변경 | re-export shim을 남기고 도메인별로 옮김 |
| patterns가 정당한 import(`zustand/vanilla`를 Layer 2에서 사용)를 막음 | 규칙은 `**/core/**`에만 적용 |

## 10. 열린 질문

1. `eslint-plugin-boundaries` 도입이 필요한가, 기존 도구로 충분한가(20-e 이후 판단).
