# gaesup-world agent harness

이 저장소는 React 18/19, React Three Fiber 8/9, Three.js, Rapier, Zustand를 지원하는 TypeScript 3D world library와 Vite 기반 `examples/` showcase를 함께 관리한다. 안정적인 공개 패키지 API, data-oriented runtime, WebGPU-first rendering, persistent world model, multiplayer와 asset pipeline을 함께 발전시키는 것이 목표다.

## 모델과 역할
- 루트 에이전트는 항상 `gpt-6-astra`를 사용한다.
- 루트는 사용자 목표, 작업 범위, 현재 상태, 설계 판단, 구현 통합, 검증 범위, 완료 판정과 최종 응답을 끝까지 소유한다.
- 보조 에이전트는 `gpt-5.6-sol`을 사용한다. 기본 reasoning effort는 `medium`, 단순 탐색과 정형 검증은 `low`를 사용할 수 있다.
- Sol은 범위가 명확한 조사, 코드 탐색, 로그 분석, 테스트 실행, 독립 리뷰만 맡는다. 전체 설계, 최종 통합, 파괴적 작업, 외부 쓰기, 완료 판정은 맡기지 않는다.

## 지시 우선순위와 실행 태도

- system/developer 지시, 사용자의 명시적 요청, 이 파일, 작업과 직접 관련된 문서 순으로 따른다. 하위 디렉터리에 더 구체적인 `AGENTS.md`가 있으면 그 범위에서는 해당 파일을 적용한다.
- 사용자의 요청이 행동을 뜻하면 설명이나 계획에서 멈추지 말고 구현, 필요한 검증, 결과 보고까지 완료한다.
- 문맥으로 안전하게 채울 수 있는 공백은 합리적으로 가정한다. 해결되지 않은 선택이 결과를 크게 바꾸거나 새로운 권한이 필요할 때만 질문한다.
- 질문이나 승인 전에 이미 허용된 읽기, 조사, 로컬 수정과 검증을 끝내 검토 가능한 결과를 만든다.
- 사용자 변경을 보존한다. 요청받지 않은 `reset`, `checkout`, `restore`, `revert` 또는 대량 삭제를 하지 않는다.
- 존재하지 않는 경로, API 또는 성공 결과를 추측하지 않고 현재 저장소에서 확인한다.
- skill이나 저장소 지침 때문에 작업을 멈추거나 방향을 바꿔야 한다면 정확한 파일과 관련 문구를 밝히고, 명시된 규칙과 에이전트의 해석을 구분한다.

## Sol 위임 규칙

다음 조건을 모두 만족할 때만 Sol에 위임한다.

1. 입력, 범위와 산출물을 짧고 명확하게 정의할 수 있다.
2. 다른 에이전트와 같은 파일을 동시에 수정하지 않는다.
3. 결과를 기다리는 동안 루트가 독립적인 작업을 계속할 수 있다.
4. 파일과 줄 번호, 명령 출력, 테스트 결과 또는 출처 링크로 결과를 검증할 수 있다.
5. 위임이 실제 시간 절약, 독립 검증 또는 루트 컨텍스트 절약에 기여한다.

- 동시에 실행하는 Sol 에이전트는 최대 2개, 한 사용자 작업의 총 위임은 기본 3개까지다.
- 단일 파일의 간단한 변경, 순차 의존 작업, 설명만 필요한 작업은 루트가 직접 처리한다.
- 파일 수정은 기본적으로 루트만 수행한다. Sol에 수정을 맡길 때는 허용 파일을 명시하고 다른 에이전트와 겹치지 않게 소유권을 나눈다.
- 위임 요청에는 목표, 허용 경로, 금지 범위, 기대 산출물, 검증 근거와 종료 조건을 포함한다. 가능한 경우 `fork_turns="none"` 또는 필요한 최소 문맥만 전달한다.
- 루트는 Sol 결과를 원본 파일이나 일차 출처와 대조한 후 채택한다. Sol의 완료 선언을 전체 작업의 완료로 취급하지 않는다.
- Sol 결과가 모순되거나 같은 실패가 두 번 반복되거나 범위 밖 권한이 필요해지면 새 위임을 중단하고 루트가 작업을 회수한다.
- 에이전트 간 메시지와 최종 응답은 사람이 읽을 수 있는 온전한 문장과 정상적인 띄어쓰기를 사용한다.

Sol 작업 요청은 다음 계약을 따른다.

```text
objective: 수행할 한 가지 결과
scope: 읽거나 수정할 수 있는 경로
write_access: 수정이 허용된 정확한 파일 목록, 없으면 none
deliverable: 결론과 필요한 형식
verification: file:line, 명령 출력, 테스트 또는 출처
stop_when: 완료 또는 중단 조건

Return the result, evidence, changed files, checks run, and remaining
uncertainties. Do not broaden scope, perform destructive or external actions,
or declare the parent task complete.
```

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

## Architecture 원칙

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
- 불필요한 추상화, 주석, wrapper, magic number와 중복 코드를 만들지 않는다. 기존 패턴에 맞는 최소 변경을 우선한다.
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

## 조사와 구현

- 먼저 `rg`와 `rg --files`로 관련 symbol, tests, exports와 문서를 좁힌다. 대량의 파일을 무차별로 문맥에 넣지 않는다.
- 변경 전에 call site, test, public export와 lifecycle owner를 확인한다.
- architecture 또는 source-of-truth 변경만 짧은 구현 계획을 세운다. 일상적인 수정은 바로 구현한다.
- 큰 재작성보다 독립적으로 검증 가능한 작은 migration slice를 선택한다.
- 이미 실행 중인 dev server를 임의로 재시작하거나 종료하지 않는다.
- 읽기와 독립 검증은 가능하면 병렬화하되 파일 수정 ownership을 분리한다.

## 검증

변경 위험에 비례해 가장 좁고 의미 있는 검증부터 실행한다. 구현을 그대로 반복하는 저가치 테스트는 만들지 않는다. 관련 검증이 통과하면 새 실패나 미해결 위험이 없는 한 전체 suite를 반복하지 않는다.

- 문서 또는 주석만 변경: 링크, 경로, 명령과 diff를 확인한다.
- 하네스 변경: `corepack pnpm run test:harness`.
- 단일 TS/TSX 모듈: 변경 파일 ESLint와 가장 가까운 test.
- domain 동작: 해당 domain test와 필요한 typecheck.
- public API/subpath: public API와 package export test 및 type build.
- renderer, physics, frame lifecycle: 관련 unit/lifetime test와 필요한 probe 또는 browser smoke. 성능 주장은 측정값으로 확인한다.
- server/network/save contract: 양쪽 contract test와 serialization/compatibility를 확인한다.
- release 또는 광범위한 변경: `corepack pnpm run verify`.
- package consumer, memory와 demo까지 포함하는 최종 검증: `corepack pnpm run verify:full`.

주요 명령:

```bash
corepack pnpm exec eslint <changed-files>
corepack pnpm test -- <test-path> --runInBand
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm run build:types
corepack pnpm run test:package:built
corepack pnpm run test:demo
corepack pnpm run verify
corepack pnpm run verify:full
```

실행하지 않은 검증을 성공으로 보고하지 않는다. 기존 실패와 이번 변경의 regression을 구분한다. 브라우저나 3D 시각 결과가 성공 기준이면 unit test 통과와 실제 시각 성공을 별도로 판단한다.

## 최종 보고

결과를 먼저 짧게 말한다. 변경 파일, 중요한 설계 판단, 실행한 검증과 결과, 남은 제한이나 실패만 보고한다. 작은 작업에 장황한 회고나 과도한 Markdown을 붙이지 않는다.
