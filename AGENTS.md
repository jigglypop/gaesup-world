# gaesup-world

`gaesup-world`는 React Three Fiber, Three.js, Rapier와 Zustand를 기반으로 하는 3D world library와 이를 소비하는 Vite showcase를 함께 관리한다. 장기 목표는 Blender asset authoring, persistent WorldDocument, WebGPU-first rendering, world creator, multiplayer와 social interaction을 연결하는 data-oriented 3D social world platform이다.

`AGENTS.md`, `.codex/agents/*.toml`의 위치와 필수 형식은 Codex 공식 문서를 따른다. 절차형 스킬은 `.claude/skills/**/SKILL.md`에 있으며(add-domain, add-subpath-export, verify, start-epoch, close-epoch) Codex에서도 해당 파일을 문서로 읽어 같은 절차를 따른다. 4개 역할 분리, context 문서, invariant와 epoch workflow는 현재 저장소 분석을 바탕으로 한 **추론한 설계**다.

## 저장소 규칙

- 기존 동작과 사용자 변경을 보존하고 요청 범위의 최소 migration slice만 수정한다.
- `reset`, `checkout`, `restore`, `revert`로 기존 변경을 제거하지 않는다.
- `dist/`, `demo-dist/`, `node_modules/`와 대용량 asset을 직접 수정하지 않는다.
- 이미 실행 중인 dev server를 다시 실행하거나 종료하지 않는다.
- 전체 재작성보다 strangler migration을 우선한다.
- 존재하지 않는 경로나 API를 추측하지 않고 현재 저장소를 확인한다.

## 코딩 규칙

- TypeScript strict를 유지하고 `any`를 사용하지 않는다.
- 데이터 타입은 `type`으로 정의한다. 기존 `interface`는 해당 작업이 직접 다루지 않으면 기계적으로 변경하지 않는다.
- 코드 식별자는 영어로 작성한다.
- 불필요한 주석, 빈 줄, magic number와 중복 코드를 추가하지 않는다.
- 타입은 가능한 경우 같은 domain의 `types.ts`에 분리한다.
- 컴포넌트는 `<Name>/index.tsx`, `styles.css`, `types.ts` 구조를 우선한다.
- `console.log`, `console.warn`, `console.error` 대신 project logger를 사용한다.
- store는 selector로 필요한 상태만 구독하고 전체 store를 구독하지 않는다.
- Props event는 `on*`, 내부 handler는 `handle*`, 상수는 `UPPER_SNAKE_CASE`를 사용한다.
- 프로젝트의 Prettier와 ESLint 설정을 따른다.

## Architecture 원칙

- Persistent world state는 React에 의존하지 않는다.
- Three.js와 Rapier 객체는 canonical persistent state가 아니다.
- Editor와 Runtime은 장기적으로 같은 World Model을 projection한다.
- Persistent mutation은 하나의 canonical write path를 가진다.
- Network와 save contract는 engine-neutral serializable data를 사용한다.
- WebGPU는 목표 primary renderer이고 WebGL-specific 구현은 compatibility boundary에 격리한다.
- 기존 typed-array, spatial, visibility, culling과 GPU upload 구현은 측정 근거 없이 객체 중심 구조로 교체하지 않는다.
- React component lifetime과 persistent entity lifetime을 결합하지 않는다.
- migration 중 old/new path가 공존하면 canonical path를 문서와 코드에서 명시한다.
- `gaesup-world`는 특정 미니홈피/SNS 제품의 business domain을 소유하지 않는다. 제품 기능은 application/backend가 소유하고 library에는 재사용 가능한 spatial primitive와 engine-neutral contract만 둔다.
- pet 기능은 AI brain과 runtime body를 분리한다. memory, personality, emotion reasoning, LLM/planner는 core에 넣지 않고 bounded intent execution만 runtime 책임으로 둔다.

세부 원칙은 다음 문서를 읽는다.

- `.codex/context/engineering.md` (투 트랙, 코드량 감소, DRY/KISS/YAGNI — 모든 작업에 적용)
- `.codex/context/architecture.md`
- `.codex/context/invariants.md`
- `.codex/context/migration.md`
- `.codex/context/r3f10-webgpu.md`
- `.codex/context/world-model.md`
- `.codex/context/asset-pipeline.md`
- `.codex/context/networking.md`
- `.codex/context/examples.md`
- `.codex/context/performance.md`
- `.codex/context/product-boundary.md` (공용 library와 제품 frontend/backend/AI 경계)
- `.codex/context/spatial-runtime.md` (placement/avatar/pet/portal/presence/spatial resource capability)
- `.codex/context/harness-gates.md` (discovery/architecture/public API/persistence/performance/completion gate)

## 계층과 구현

- Layer 1: `src/core/<domain>/core/`. 순수 engine과 calculation을 소유하며 React, Zustand, `@react-three/fiber`를 import하지 않는다.
- Layer 2: `src/core/<domain>/bridge/`. `CoreBridge`로 engine, command와 snapshot을 연결한다.
- Layer 3: `hooks/`, `components/`, `stores/`, `controllers/`. React integration과 UI를 담당한다.

Bridge는 `buildEngine`, `executeCommand`, `createSnapshot` 책임을 분리한다. frame hot path에서 Three.js 객체, 배열, 객체, clone과 spread를 반복 생성하지 않는다. snapshot과 scratch object를 재사용한다. engine, subscription, timer, listener, geometry, material, texture와 GPU resource는 ownership과 dispose 경로를 가진다.

저장 상태를 가진 store는 `serialize()`와 `hydrate()`를 제공하고 현재 `SaveSystem`과 save binding을 사용한다. PluginRegistry, Runtime, Service Registry, SaveSystem, building placement, spatial/render indices와 network adapter는 보존 가치가 높은 기존 자산이다.

## Public API

외부 사용 심볼은 `gaesup-world` 또는 적절한 subpath에서 export한다. public API 또는 subpath를 변경하면 다음을 함께 확인한다.

- `src/index.ts`와 해당 `src/<subpath>.ts`
- `package.json`의 `exports`
- `vite.config.ts`의 alias와 library entry
- `tsconfig.json`의 `paths`
- `jest.config.js`의 `moduleNameMapper`
- `scripts/copy-cjs-types.cjs`
- `src/__tests__/publicApi.test.ts`
- `src/__tests__/packageExports.test.ts`

## Examples

`examples/`는 library consumer, integration environment, product showcase와 UX prototype이다.

- `examples`는 `gaesup-world` 또는 `gaesup-world/<subpath>`만 import한다.
- `src/...`, `@/`, `@core/` 같은 private library path를 import하지 않는다.
- 새 public 기능은 examples에서 실제 접근 가능한 scenario, panel, route 또는 runtime seed로 검증한다.
- 기본 UX는 product scenario 중심이어야 하며 debug와 diagnostics는 Developer 영역으로 분리한다.
- World, Creator, Multiplayer, Assets와 Performance를 primary scenario로 취급한다.
- 기존 route와 기능은 조사 없이 삭제하지 않고 retain, integrate, Developer 이동, remove 후보로 분류한다.

## Codex 작업 흐름

plan은 architecture boundary·source of truth를 바꾸는 epoch 작업에만 요구된다. 일상 작업은 `.codex/context/engineering.md`의 fast track을 따라 plan 없이 바로 구현한다. epoch 작업 전에는 `.codex/plans/active/`의 관련 plan을 읽고, 없으면 `.codex/plans/TEMPLATE.md`를 복사해 먼저 작성하며, 완료 조건과 검증을 충족한 뒤에만 `completed/`로 이동한다. 절차는 `.codex/prompts/{start-epoch,close-epoch,verify,handoff}.md`를 따른다. 공용 spatial capability 추가/변경은 `.codex/prompts/spatial-runtime-feature.md`를 추가로 따른다.

Agent 선택:

- architecture, WorldDocument, public API, examples 구조: `architect`
- rendering, physics, simulation, WebGPU, performance: `runtime`
- Blender, assets, network, save, external integration contracts: `platform`
- 완료된 slice 검토: `reviewer`

하나의 migration slice에서 구현 agent는 최대 두 개만 사용한다.

## 검증

변경 범위에 맞는 좁은 검증부터 실행한다.

```bash
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
corepack pnpm exec eslint <changed-files>
corepack pnpm test -- src/core/<domain> --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm exec tsc --noEmit
corepack pnpm test -- --runInBand
corepack pnpm test:demo
corepack pnpm test:package
```

실행하지 않은 검증을 성공으로 보고하지 않는다. 기존 실패와 이번 변경의 regression을 구분한다. 최종 보고에는 변경 파일, source of truth 변화, compatibility, 실행한 검증, 실패와 미실행 검증, 다음 migration slice를 포함한다.
