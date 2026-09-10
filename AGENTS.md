# gaesup-world agent harness

이 저장소는 React 18/19, React Three Fiber 8/9, Three.js, Rapier, Zustand를 지원하는 TypeScript 3D world library와 Vite 기반 `examples/` showcase를 함께 관리한다. 목표는 안정적인 공개 패키지 API, data-oriented runtime, WebGPU-first rendering, persistent world model, multiplayer와 asset pipeline을 함께 발전시키는 것이다.

## 우선순위와 실행 태도

- system/developer 지시, 사용자의 명시적 요청, 이 파일, 작업과 직접 관련된 문서 순으로 따른다. 하위 디렉터리에 더 구체적인 `AGENTS.md`가 있으면 그 범위에서는 해당 파일을 우선한다.
- 사용자의 요청이 작업을 뜻하면 설명이나 계획에서 멈추지 말고 구현, 필요한 검증, 결과 보고까지 완료한다.
- 문맥으로 안전하게 채울 수 있는 일상적인 공백은 합리적으로 가정한다. 결과를 크게 바꾸는 정보가 없을 때만 짧게 질문한다.
- 질문이나 승인 전에 이미 허용된 읽기, 조사, 로컬 수정, 검증을 끝내 검토 가능한 결과를 만든다.
- 사용자 변경을 보존한다. 요청받지 않은 `reset`, `checkout`, `restore`, `revert`, 대량 삭제를 하지 않는다.
- 존재하지 않는 경로, API, 성공 결과를 추측하지 않는다. 현재 저장소에서 확인한다.
- 지시나 skill 때문에 작업을 멈추거나 범위를 바꿔야 한다면 정확한 파일과 관련 문구를 밝히고, 명시 규칙과 해석을 구분한다.

## 비용 중심 모델 라우팅

기본 모델은 항상 `gpt-5.6-sol`의 `medium` reasoning이다. 탐색, 구현, 수정, 테스트, 리뷰, 문서화, 일반 설계와 일반 디버깅은 모두 Sol-medium으로 처리한다. 작업이 작다는 이유로 Astra를 쓰지 않는다.

`gpt-6-astra`의 `xhigh` reasoning은 아래 조건을 모두 만족하는 고도 추론에만 한 번, 좁은 읽기 전용 판단 작업으로 사용한다.

1. 결정이 최소 3개 architecture domain 또는 장기 source of truth에 걸친다.
2. 저장소 근거를 Sol-medium으로 먼저 조사했는데도 서로 양립할 수 없는 선택지가 남는다.
3. 잘못된 결정의 영향이 공개 API, persistent data, network protocol, renderer/runtime lifetime, 보안 경계 또는 대규모 migration에 장기적으로 남는다.
4. 요청 결과가 코드 작성이 아니라 명확한 설계 판단, 위험 분석 또는 원인 판정이다.

Astra-xhigh를 쓰지 않는 작업: 파일 찾기, 코드 요약, 단일 모듈 변경, 기계적 리팩터링, 테스트 작성과 실행, lint/build 수정, 일반 코드 리뷰, 문서 검색, UI 문구, 반복 구현, 이미 결정된 설계의 적용.

라우팅 절차:

1. Sol-medium이 관련 코드와 문서를 조사하고 선택지와 증거를 압축한다.
2. 조건이 충족될 때만 `model="gpt-6-astra"`, `reasoning_effort="xhigh"`, `fork_turns="none"`으로 읽기 전용 판단을 위임한다.
3. Astra에는 아래 형식의 2,500자 이하 evidence packet만 전달한다. 저장소 전체 문맥을 넘기지 않는다.
4. Astra의 판단을 Sol-medium이 현재 코드와 대조한 뒤 구현하고 검증한다. Astra에 탐색, 수정, 테스트, 재위임을 맡기지 않는다.

```text
[astra:advanced-reasoning]
decision_scope: ...
domains: domain-a, domain-b, domain-c
current_source_of_truth: ...
constraints: ...
options: ...
evidence: file:line and observed behavior
compatibility_and_risk: ...
decision_question: ...
```

애매하면 Sol-medium을 유지한다. Astra 호출은 관성적으로 반복하지 않으며, 새 근거나 새 결정 문제가 생긴 경우에만 다시 고려한다. 모델을 직접 선택할 수 없는 실행 환경에서는 현재 모델로 진행하되 Astra를 사용했다고 주장하지 않는다.

## 위임과 병렬 처리

- 서로 독립이고 동시에 수행하면 실제 시간이나 품질 이득이 있는 작업만 subagent에 맡긴다.
- 기본 subagent도 `gpt-5.6-sol`, `reasoning_effort="medium"`을 사용한다.
- 간단한 한 파일 작업, 순차 의존 작업, 설명만 필요한 작업은 직접 처리한다.
- 동시에 실행하는 subagent는 최대 2개다. 구현 agent끼리 같은 파일을 수정하지 않도록 경계를 나눈다.
- subagent 요청은 목표, 허용 파일, 금지 범위, 필요한 근거와 반환 형식을 자체 포함한다. `fork_turns="none"` 또는 필요한 최소 turn만 사용하고 전체 대화를 전달하지 않는다.
- root가 최종 통합, 충돌 확인, 검증과 사용자 보고를 소유한다. subagent 결과를 검증 없이 사실로 채택하지 않는다.
- agent 간 메시지와 최종 답변은 사람이 읽을 수 있도록 온전한 문장과 정상적인 띄어쓰기를 사용한다.

## 저장소 구조와 경계

- `src/`: 배포되는 library 코드. 공개 entry는 `src/index.ts`와 `src/*.ts` subpath다.
- `src/core/<domain>/core/`: 계산과 engine 로직. React, Zustand, `@react-three/fiber`에 의존하지 않는다.
- `src/core/<domain>/bridge/`: engine command와 snapshot 경계. `buildEngine`, `executeCommand`, `createSnapshot` 책임을 분리한다.
- `hooks/`, `components/`, `stores/`, `controllers/`: React integration, state projection과 UI다.
- `src/next/`: WebGPU-first core 실험 경로다. 기존 runtime과 섞을 때 ownership과 compatibility를 명시한다.
- `src/blueprints/`: serializable blueprint model, registry, factory와 editor integration이다.
- `examples/`: 실제 package consumer이자 integration/product showcase다. library 내부 private path를 import하지 않는다.
- `server/`: WebSocket room server와 policy service다.
- `scripts/`: package, asset, renderer와 browser 검증 도구다.
- `public/`: glTF, texture, font, WASM 같은 정적 asset이다.
- `docs/`: 현재 설계와 API 문서다. 관련 문서만 선택해 읽고 전체를 문맥에 넣지 않는다.

## 보존해야 할 architecture 원칙

- persistent world state는 React, Three.js와 Rapier 객체에 의존하지 않는 serializable data다.
- Editor와 Runtime은 같은 World Model을 projection하며 persistent mutation은 하나의 canonical write path를 가진다.
- network와 save contract는 engine-neutral data를 사용한다.
- React component lifetime과 persistent entity lifetime을 결합하지 않는다.
- engine, subscription, timer, listener, geometry, material, texture와 GPU resource는 명확한 owner와 dispose 경로를 가진다.
- frame hot path에서 배열, 객체, clone, spread와 Three.js 객체를 반복 생성하지 않는다. scratch object, typed array와 snapshot을 재사용한다.
- 기존 spatial, visibility, culling, GPU upload 구조는 측정 근거 없이 객체 중심 구조로 교체하지 않는다.
- WebGPU를 primary 방향으로 유지하고 WebGL 전용 구현은 compatibility boundary에 격리한다.
- old/new path가 함께 존재하는 migration은 canonical path와 제거 조건을 코드 또는 관련 문서에 명시한다.

## 코딩 규칙

- TypeScript strict와 현재 `tsconfig.json`의 `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, unused 검사를 유지한다. 새 `any`를 쓰지 않는다.
- 새 데이터 모델은 `type`을 우선한다. 기존 `interface`는 작업과 무관하면 일괄 변경하지 않는다.
- public 식별자와 코드 식별자는 영어로 쓴다. Props event는 `on*`, 내부 handler는 `handle*`, 상수는 `UPPER_SNAKE_CASE`를 사용한다.
- domain 타입은 가능한 한 해당 domain의 `types.ts`에 둔다. 기존 component 폴더의 `index.tsx`, `types.ts`, `styles.css` 구조를 따른다.
- `console.*` 대신 project logger와 diagnostics 경로를 사용한다.
- Zustand store는 필요한 selector만 구독한다. render 중 전체 store 구독이나 불안정한 객체 selector를 추가하지 않는다.
- 불필요한 추상화, 주석, wrapper, magic number, 중복 코드를 만들지 않는다. 기존 패턴에 맞는 최소 변경을 우선한다.
- generated output인 `dist/`, `demo-dist/`, dependency인 `node_modules/`, binary asset은 명시적 요청이나 생성 절차 없이 직접 편집하지 않는다.

## 공개 API와 examples

공개 symbol 또는 subpath를 바꾸면 다음 경계를 함께 확인한다.

- `src/index.ts`와 해당 `src/<subpath>.ts`
- `package.json`의 `exports`, `main`, `module`, `types`, `files`
- `vite.config.ts`의 alias와 library entry
- `tsconfig.json`의 `paths`
- `jest.config.js`의 `moduleNameMapper`
- `scripts/copy-cjs-types.cjs`
- `src/__tests__/publicApi.test.ts`
- `src/__tests__/packageExports.test.ts`
- ESM/CJS의 `.d.ts`/`.d.cts` 소비 경로

`examples/`에서는 `gaesup-world` 또는 `gaesup-world/<subpath>`만 사용한다. `src/...`, `@/`, `@core/` 같은 private import를 추가하지 않는다. 새 공개 기능은 접근 가능한 route, scenario, panel 또는 runtime seed로 확인한다. 진단 UI는 primary product flow를 가리지 않게 Developer 영역에 둔다.

## 조사와 구현 방식

- 먼저 `rg`와 `rg --files`로 관련 symbol, tests, exports와 문서를 좁힌다. 1,000개가 넘는 파일을 무차별로 문맥에 넣지 않는다.
- 변경 전에 call site, test, public export와 lifecycle owner를 확인한다.
- architecture 또는 source-of-truth 변경만 짧은 구현 계획을 세운다. 일상적인 수정은 바로 구현한다.
- 큰 재작성보다 독립적으로 검증 가능한 작은 migration slice를 선택한다.
- 이미 실행 중인 dev server를 임의로 재시작하거나 종료하지 않는다.
- 읽기와 독립 검증은 가능하면 병렬화하되, 파일 수정은 ownership을 분리한다.

## 검증 예산

변경 위험에 비례해 가장 좁고 의미 있는 검증부터 실행한다. 구현을 그대로 반복하는 저가치 테스트는 만들지 않는다. 관련 검증이 통과하면 새 실패나 미해결 위험이 없는 한 무조건 전체 suite를 반복하지 않는다.

- 문서 또는 주석만 변경: 링크, 경로, 명령과 diff를 확인한다.
- 단일 TS/TSX 모듈: 변경 파일 ESLint + 가장 가까운 test.
- domain 동작: 해당 domain test + 필요한 typecheck.
- public API/subpath: public API와 package export test + type build.
- renderer, physics, frame lifecycle: 관련 unit/lifetime test + 필요한 probe 또는 browser smoke. 성능 주장은 측정값으로 확인한다.
- server/network/save contract: 양쪽 contract test와 serialization/compatibility를 확인한다.
- release 또는 광범위 cross-cutting 변경: 전체 verify를 실행한다.

주요 명령:

```bash
corepack pnpm exec eslint <changed-files>
corepack pnpm test -- <test-path> --runInBand
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm build:types
corepack pnpm test:package:built
corepack pnpm test:demo
corepack pnpm verify
corepack pnpm verify:full
```

실행하지 않은 검증을 성공으로 보고하지 않는다. 기존 실패와 이번 변경의 regression을 구분한다. 브라우저나 3D 시각 결과가 성공 기준이면 unit test 통과와 실제 시각 성공을 별도로 판단한다.

## 최종 보고

결과를 먼저 짧게 말한다. 변경 파일, 중요한 설계 판단, 실행한 검증과 결과, 남은 제한이나 실패만 보고한다. 작은 작업에 장황한 회고나 과도한 Markdown을 붙이지 않는다. 목록은 항목이 실제로 병렬이거나 비교가 필요할 때만 사용한다.
