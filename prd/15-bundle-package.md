# PRD-15 번들과 패키지

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch |
| 선행 PRD | 20(barrel·경계), 23(decorator 제거) |
| 담당 agent | architect, platform |

## 1. 배경과 문제

외부화는 정확하다. dist ESM의 `//#region` 547개가 모두 `src/`이고 three, react, zustand, immer 구현은 번들에 없다. dist 청크 간 순환도 0이고 publint도 통과한다. 문제는 **엔트리 분리가 소비자 번들 크기를 줄이지 못한다**는 점이다.

1. 루트가 `export * from './core/editor'`를 하고, rolldown이 scene-object 모듈을 editor shell 청크에 함께 배치한다. 순수 데이터 API 두 개를 import하면 115KB gz와 `@xyflow/react`가 따라온다.
2. `sideEffects`는 CSS/GLSL만 선언하는데, 엔트리들이 최상위에서 `reflect-metadata`와 `initializeBridges()`를 실행하고 decorator가 import 시점에 레지스트리를 채운다.
3. CJS 빌드가 ESM 전용인 `three/webgpu`, `three/tsl`을 `require`한다(D-21).
4. 에디터 전용 의존성이 `dependencies`에 있어 모든 소비자가 설치한다.
5. 배포 크기의 59%가 bundler로 접근할 수 없는 샘플 GLB다.

## 2. 목표 / 비목표

**목표**
- 서브패스를 실제 번들 경계로 만든다. 순수 데이터 API는 React·three 없이 import된다.
- `sideEffects`를 실제 부수효과와 일치시킨다.
- 에디터 전용 의존성을 optional로 옮긴다.
- 배포 패키지를 코드와 필수 런타임 자산으로 한정한다.

**비목표**
- 빌드 도구 교체(vite 8/rolldown 유지).
- 공개 심볼 이름 변경.

## 3. 현재 상태

측정 수치는 [00](00-baseline.md) 3.1절에 있다.

### 3.1 High

**15-F01 루트 barrel과 청크 공동배치** [실측]
- `src/index.ts:6` `export * from './core/editor'`. 루트 정적 폐포 1,810,767B로 전체 ESM의 92.8%.
- README 퀵스타트의 `createSceneDocument`/`createSceneDocumentController`가 `shell-Bo5BD7fc.js`에서 re-export된다. 이 청크는 editor 컴포넌트 regions 46개를 담고 `@xyflow/react`를 import한다.
- `network` 폐포 519KB에 WorldContainer, WorldPostProcessing(`@react-three/postprocessing`), useClicker가 들어 있다.
- 결과: 직렬화 가능한 문서 API만 쓰는 소비자(서버 포함)도 에디터 UI와 React/three 런타임을 받는다.

### 3.2 Medium

| ID | 발견 | 근거 |
|---|---|---|
| 15-F02 | `sideEffects`와 실제 부수효과 불일치 | `package.json:172-175`는 CSS/GLSL만 선언. `src/index.ts:1-4`, `src/runtime.ts:1-4`, `src/editor.ts:1-4`가 `import 'reflect-metadata'`와 `initializeBridges()` 최상위 실행. `@DomainBridge`(`boilerplate/decorators/index.ts:7-12`)가 import 시점 `BridgeRegistry.register`, `DIContainer.registerService`. dist에 PURE 없는 최상위 decorator 호출(`useClicker-CA8IkurL.js:193`). 그 밖에 `enableMapSet()`(`buildingStore.ts:51`), `registerAnimatorController`(`animator/registry.ts:29`), `registerDefaultReinforcementAdapter`(`npc/core/reinforcement.ts:175`), `extend({...})` 4곳 |
| 15-F03 | CJS가 ESM 전용 three 서브패스를 require(D-21) | three 0.186 `./webgpu`, `./tsl`은 ESM 전용. dist CJS `require("three")` 26회, 각 서브패스 6회(예: `NodeFireEffects-BTLmd-9E.cjs`). jest 로그 `THREE_CJS_DEPRECATED` 141회. CJS 1.55MB, d.cts 1,026개, `scripts/copy-cjs-types.cjs` 404줄 유지비 |
| 15-F04 | 에디터 전용 의존성이 `dependencies` | `@xyflow/react`(`package.json:261`)는 `editor/components/panels/BuildingPanel/flow.tsx`만 사용. `zustand@^4`, `@xyflow/system`, d3-* 9개를 끌고 와 lockfile에 zustand 4.5.7과 5.0.15 공존. xyflow CSS 15,365B가 단일 `index.css`(145KB)에 합쳐짐. `immer`는 building store만, `mitt`는 camera만, `simplex-noise`는 building mesh만 사용 |
| 15-F05 | 배포 자산이 무겁고 exports로 접근 불가 | GLB 61개 8.36MB 배포, `exports`에 `./gltf/*`, `./wasm/*` 없음. `npcStore.ts:62-66`이 `/gltf/...` 절대 URL 기본값. wasm은 `document.baseURI` 기준 fetch(14-F15) |
| 15-F06 | 넓은 peer 범위가 테스트되지 않음 | `verify-package-consumer.cjs:818-823`은 최신만 설치(three 0.186, fiber 9, drei 10, rapier 2, pp 3). `three` 범위(`package.json:338`)는 0.x caret이라 0.169~0.177, 0.179~0.184가 빠짐. `react-dom` peer는 dist에서 import 0. `@react-three/postprocessing`은 WorldContainer → WorldPostProcessing 정적 import로 사실상 필수라 `./postprocessing` 분리가 무의미. `three-stdlib`는 LineGeometry, LineMaterial, SkeletonUtils, Water 네 가지만 쓰며 모두 `three/addons`에 있음 |
| 15-F11 | 서브패스 엔트리도 게임플레이·boilerplate를 끌고 옴 | 정적 import 폐포 [실측, 2026-09-24 2차]: `runtime` 427파일 48,737줄 50개 도메인(`export * from './core/world'`와 `createGaesupRuntime` 경유로 building 5.3K, networks 2.7K, npc 2.3K 줄, 모든 게임플레이 store, postprocessing, mitt, immer, reflect-metadata 포함). `avatar`는 `AvatarRuntime` → `AnimationSystem`(AbstractSystem) 경유로 boilerplate 1,963줄과 `reflect-metadata`. `building`은 npc 2.9K, networks 2.1K. `blueprints`는 boilerplate 2.8K, interactions 2.6K. 깨끗한 엔트리: gameplay(30파일), plugins(11), server-contracts(35), next(12) |

### 3.3 Low

| ID | 발견 | 근거 |
|---|---|---|
| 15-F07 | 라이브러리 빌드가 publicDir를 dist에 복사 | `publicDir: false` 없음. esm·cjs 빌드마다 fonts 15M, gltf 8.2M, texture 1.6M, draco 372K 복사(dist 36MB). dist/wasm도 이 복사로 생김 |
| 15-F08 | 데모 빌드 | 초기 6청크 196,668B(gz 63,764)로 양호. lazy rapier 2.24MB(gz 844KB), three.webgpu 669KB. `strictExecutionOrder: true`(`vite.config.ts:269`)로 lazy-init 래퍼 약 936개. sourcemap 127개(37.6MB) Pages 배포. PerformanceLab baseline 16.7MB 일괄 로드(10-F06) |
| 15-F09 | 타입 선언 | per-file d.ts 1,026쌍. 전역 augmentation(`Window.Sentry`, `Navigator.deviceMemory`, `Window.CHARACTER_URL`, `window.__camera`)이 공개 타입에 포함 [미검증: 충돌]. `dist/vite-env.d.ts` 배포. `typesVersions` 없어 `moduleResolution: node10` 소비자는 서브패스 타입 미해석 |
| 15-F10 | 설정 잔재 | `rolldownOptions.output.globals`, `lib.name`(UMD 전용), react-swc 설정 두 분기 중복(159-172, 229-242), 라이브러리 sourcemap 없음, `files`가 있어 `.npmignore` 무효 |

## 4. 요구사항

**FR**
- FR-15-01: 루트에서 editor re-export를 제거한다. 한 minor 동안 루트 re-export에 `@deprecated` JSDoc을 붙이고 `gaesup-world/editor`로 안내한다.
- FR-15-02: scene-document와 command 계열을 React-free 서브패스(`gaesup-world/scene`)로 제공한다. `server-contracts`와 같은 격리 검사를 적용한다.
- FR-15-03: ESM 빌드는 `preserveModules: true, preserveModulesRoot: 'src'` 또는 도메인 기준 `advancedChunks`로 청크 공동배치를 끊는다(측정 후 선택).
- FR-15-04: `network`를 프로토콜(`gaesup-world/network`)과 React 통합(`gaesup-world/network/react`)으로 나눈다.
- FR-15-05: 레지스트리 등록을 factory 안의 lazy 등록으로 바꾼다. 부수효과가 남는 모듈은 `sideEffects`에 명시한다.
- FR-15-06: CJS 빌드, `build:cjs`, d.cts 생성, `copy-cjs-types.cjs`를 제거하고 exports를 ESM 단일로 만든다(`engines`가 이미 require(esm) 지원 버전).
- FR-15-07: `@xyflow/react`를 optional peer(`peerDependenciesMeta`)로 옮긴다. CSS를 `style.css`와 `editor.css`로 나눈다.
- FR-15-08: `reflect-metadata`를 dependencies에서 제거한다(23 PRD 완료 후).
- FR-15-09: `WorldPostProcessing`을 `React.lazy`로 바꾸고 `@react-three/postprocessing`을 optional peer로 둔다.
- FR-15-10: `three-stdlib` 사용을 `three/addons`로 바꾸고 peer에서 제거한다.
- FR-15-11: peer 범위를 CI 매트릭스로 검증한 범위로 좁히거나, 최소 버전 매트릭스(fiber 8/drei 9/three 0.168/React 18)를 CI에 추가한다.
- FR-15-12: `"./wasm/*"` export를 추가하고 wasm URL을 `import.meta.url` 기준으로 만든다. 샘플 GLB는 별도 패키지나 CDN으로 분리한다.
- FR-15-13: 라이브러리 빌드에 `publicDir: false`를 설정하고 wasm만 명시적으로 복사한다.
- FR-15-14: 공개 타입에서 전역 augmentation과 `vite-env.d.ts`를 제거한다.
- FR-15-15: 엔트리별 정적 import 폐포(파일 수, 줄 수, 도메인 목록)를 jest ratchet으로 고정하고 감소만 허용한다. `runtime`은 kernel + engine + world shell만, 게임플레이 kit은 kit별 서브패스로 둔다(20 PRD 5.1 계층, 22 FR-22-11).

**NFR**
- NFR-15-01: 루트에서 `{ createSceneDocument, createSceneDocumentController }` import 결과 < 20KB gz, 외부 패키지 import 0.
- NFR-15-02: `network` 프로토콜 import 폐포에 React·R3F·three 0.
- NFR-15-03: `npm pack` 해제 크기 50% 이상 감소.
- NFR-15-04: export snapshot의 심볼 집합은 deprecation 기간 동안 불변.

## 5. 설계

### 5.1 엔트리 구조

| 엔트리 | 내용 | React | three |
|---|---|---|---|
| `gaesup-world/scene` | SceneDocument, command, migration, serialization | 없음 | 없음 |
| `gaesup-world/server-contracts` | 기존 유지 | 없음 | 없음 |
| `gaesup-world/network` | 프로토콜, codec, adapter | 없음 | 없음 |
| `gaesup-world/network/react` | `MultiplayerCanvas`, `RemotePlayers`, hooks | 있음 | 있음 |
| `gaesup-world/editor` | editor UI, `@xyflow/react` | 있음 | 있음 |
| `gaesup-world` | runtime 컴포넌트와 hooks. editor 제외 | 있음 | 있음 |

### 5.2 소비자 번들 측정

빌드 에이전트가 만든 rolldown 소비자 tree-shake 측정(`import` 목록 → minify → gz)을 `scripts/performance/bundle.mjs`에 통합하고 10 PRD의 `perf:check`에서 NFR-15-01·02를 판정한다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 15-a | `publicDir: false` + wasm 명시 복사, 설정 잔재 정리(15-F10) | dist 크기 기록. `test:package:built` 통과 |
| 15-b | 소비자 번들 측정을 `perf:check`에 추가하고 현재값 기록. 엔트리 폐포 ratchet(FR-15-15) | 00 문서 3.1절 표를 스크립트로 재현. 15-F11 수치 고정 |
| 15-c | `gaesup-world/scene` 서브패스 추가, 격리 검사 | NFR-15-01 충족 |
| 15-d | 루트 editor re-export deprecate, 청크 전략 적용(FR-15-03) | 루트 폐포 감소 기록, export snapshot 불변 |
| 15-e | `network` / `network/react` 분리 | NFR-15-02 충족 |
| 15-f | `@xyflow/react` optional peer, CSS 분리, `WorldPostProcessing` lazy | 빈 프로젝트 `npm i --omit=optional` 후 xyflow 미설치로 runtime 동작 |
| 15-g | lazy 레지스트리 등록, `sideEffects` 명시(23 PRD 이후) | webpack·rollup 소비자 번들에서 `BridgeRegistry.list()` 동일 |
| 15-h | CJS 제거(major) | `node -e "require('gaesup-world')"` require(esm) 통과, `test:package:built` 통과 |
| 15-i | `three-stdlib` → `three/addons`, peer 범위 정리 또는 매트릭스 | CI 매트릭스 통과 |
| 15-j | `./wasm/*` export, 샘플 GLB 분리, 공개 타입 정리 | NFR-15-03 충족 |

## 7. 공개 API 영향

- 루트에서 editor 심볼 제거는 major 변경이다. minor에서는 deprecate만 한다.
- CJS 제거, peer 변경, `three-stdlib` peer 제거는 major 변경이다.
- 새 서브패스(`scene`, `network/react`)를 추가하면 AGENTS.md Public API 절의 파일 8종(`src/index.ts`, `package.json` exports, `vite.config.ts`, `tsconfig.json` paths, `jest.config.js`, `copy-cjs-types.cjs`, `publicApi.test.ts`, `packageExports.test.ts`)을 함께 갱신한다.

## 8. 검증과 완료 기준

```bash
corepack pnpm build
corepack pnpm test:package:built
corepack pnpm exec publint
corepack pnpm test -- src/__tests__/publicApi.test.ts src/__tests__/packageExports.test.ts src/__tests__/exportSnapshot.test.ts --runInBand
node scripts/check-entry-isolation.cjs src/server-contracts.ts
corepack pnpm test:demo
```

완료 기준: NFR-15-01~04 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| `preserveModules`로 파일 수 증가, 소비자 빌드 시간 증가 | `advancedChunks`와 비교 측정 후 선택 |
| 루트 editor 제거로 기존 소비자 import 깨짐 | deprecate 기간과 codemod 안내, major에서 제거 |
| lazy 등록으로 첫 사용 시점 지연 | `createGaesupRuntime`에서 명시 등록 |
| CJS 제거로 Jest CJS 소비자 영향 | require(esm) 가능 Node 버전 명시, 소비자 예시 추가 |

## 10. 열린 질문

1. 다음 major(2.0)에 CJS 제거와 루트 editor 제거를 넣을 것인가.
2. peer 범위를 좁힐 것인가(예: three ≥ 0.185, fiber 9, React 19), 매트릭스로 넓은 범위를 유지할 것인가.
3. 샘플 GLB를 별도 패키지(`gaesup-world-assets`)로 분리할 것인가, CDN으로 둘 것인가.
