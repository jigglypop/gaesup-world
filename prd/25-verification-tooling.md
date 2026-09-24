# PRD-25 검증 파이프라인과 툴링

| 항목 | 값 |
|---|---|
| 우선순위 | P0(25-a), P1(나머지) |
| 트랙 | Fast |
| 선행 PRD | 00 |
| 담당 agent | platform, reviewer |

## 1. 배경과 문제

타입 검사(tsc 7 native, 약 3초)와 린트(약 19초, 에러 0)는 빠르고 깨끗하다. 문제는 다음과 같다.

1. **검증 파이프라인이 작업 트리에서 깨져 있다(D-19).** `verify`의 첫 단계가 삭제된 파일을 읽다 실패하고, jest 9건이 삭제된 docs를 가리킨다.
2. **CI가 느리고 중요한 검사를 돌리지 않는다.** 단일 직렬 job, 캐시 없음, 경계·품질 검사 미연결. 트리거 브랜치와 기본 브랜치가 다르다.
3. **테스트 비용이 한 파일에 몰려 있고, 모든 테스트가 jsdom + ts-jest로 돈다.**
4. **컴파일러가 두 개다.** CI 타입 판정(TS 7)과 IDE·ts-jest·typescript-eslint(TS 6)가 다르다.
5. **설정과 스크립트가 중복·방치되어 있다.**

## 2. 목표 / 비목표

**목표**
- `verify`를 녹색으로 되돌리고 harness 참조를 실제 파일과 일치시킨다.
- CI를 병렬 job으로 나누고 경계·품질·성능 게이트를 연결한다.
- 전체 jest를 병렬 60초 이하로 줄인다.
- 별칭과 컴파일러 설정의 원천을 하나로 만든다.

**비목표**
- 테스트 러너 교체(vitest 등). jest 유지.

## 3. 현재 상태

**25-F01 깨진 verify와 harness drift(D-19)** [실측]
- `scripts/check-harness.mjs:9`가 `.codex/config.toml`을 읽다 ENOENT. `verify` 체인 첫 단계(`package.json:233`)라 `verify`, `verify:full`, `release.yml` verify job이 실패한다.
- `src/__tests__/packageFiles.test.ts` 9건 실패: `package.json:194-200` `files`의 docs 7개 패턴과 README.md/README.ko.md의 `docs/...` 링크.
- `verify-package-consumer.cjs:299`에 docs allowlist 정규식.
- `AGENTS.md:50-62`가 `.codex/context/*.md` 13개를 참조하지만 `.codex/` 디렉터리가 없다. HEAD에서도 3개만 추적 중이고 engineering/architecture 등 10개는 `ee31b3d5`(2026-09-11)에서 삭제됐다. `.codex/plans/TEMPLATE.md`, `prompts/{start-epoch,close-epoch,verify,handoff}.md`는 HEAD에 없다.

**25-F02 CI 구조** [확인]
- `.github/workflows/release.yml:17-29` 단일 직렬 job, `package-manager-cache: false`, jest 캐시 없음(cold 170초).
- `pnpm install --frozen-lockfile`에 `--ignore-scripts`가 없어 root `prepare`(= build)가 실행되고 `verify`가 다시 build한다 [추정: CI 로그 미확인].
- workflow는 `main`만 트리거하는데 `origin/HEAD`는 `origin/master`다. master 대상 PR은 CI를 거치지 않는다.
- `check:quality`, `check:layer1`, `check:entries`, 성능 벤치는 verify와 CI 어디에도 없다.
- `verify:full`은 네트워크 `npm install`을 하는 consumer 검증(1,841줄 스크립트)과 demo 빌드를 포함하고 timeout 30분이다.

**25-F03 jest 비용** [실측]
- `src/__tests__/examplePackageConsumption.test.ts` 38.0초(전체의 28%). TS 6 `ts.createProgram`을 테스트 두 개에서 각각 생성(493, 500행). `typecheck`(TS 7, 2.9초)와 역할이 겹친다.
- `jest.config.js:2-3` ts-jest + jsdom 전역. 394개 중 221개 파일은 DOM/React 참조가 없다.
- `transformIgnorePatterns`(44-46행)로 three, @react-three, zustand 원본 JS도 ts-jest 변환. Layer 1 23파일 기준 cold 12.6초 vs warm 8.4초.
- node 환경은 jsdom 대비 13% 빠르지만 단순 전환 시 6개 테스트가 실패한다.
- `jest.memory.config.js`는 본 suite에 이미 포함된 5개 파일을 다시 돌리고 heap 기준으로 판정하지 않는다. `coverageThreshold` 없음.
- `jest.setup.js`의 `logger.disable()`이 오류 로그 경로를 가린다(23 PRD).

**25-F04 벽시계 테스트(D-20)** [실측]
- `useBaseLifecycle.test.ts:420` 1,000ms 임계값이 부하 상태에서 1,567ms로 실패.

**25-F05 컴파일러 이중화** [확인]
- `@typescript/native` = `npm:typescript@7.0.2`(`package.json:296`)가 `tsc` 바이너리를 제공한다.
- `typescript` = `npm:@typescript/typescript6@6.0.2`(325행)을 ts-jest(peer `<7`), typescript-eslint(peer `<6.1.0`), `copy-cjs-types.cjs`, `examplePackageConsumption` 테스트, IDE가 쓴다.
- `typecheck`(230행)가 서로 겹치는 프로젝트 3개를 돌린다(main은 test의 부분집합).

**25-F06 별칭 4곳 중복** [확인]
- tsconfig `paths`(36-61행), vite `alias`(73-146행), jest `moduleNameMapper`(4-32행), `check-entry-isolation.cjs:5-13`.
- 사용 0 별칭: `@world`, `@interactions`, `@ui`(vite 전용), `@constants`, `@types`. `@types/*`(tsconfig:59, jest:28)는 npm `@types` 스코프를 가린다.
- vite `resolve.tsconfigPaths: true`로 수동 alias 목록이 중복이다.

**25-F07 ESLint 누락** [실측]
- `react-hooks`는 `rules-of-hooks`만 켜짐(49행). `exhaustive-deps`를 켜면 54건.
- 타입 인식 규칙(`no-floating-promises`) 없음. 모든 파일에 `globals.node`(37행).
- Layer 1 제한의 구멍은 20 PRD.

**25-F08 테스트 공백과 mock 의존** [실측]
- 테스트 0: effects(414줄), wasm(221), ops(128), error(102), items.
- 비중 낮음: npc(3,401줄에 5개), avatar(1,079줄에 1개), navigation(1,062줄에 3개, `NavigationSystem.ts` 744줄).
- `jest.mock` 사용 83파일, 그중 `@react-three/fiber` mock 17. `useManagedEntity.test.ts`처럼 mock이 결함을 가린 사례가 있다(D-02).

**25-F09 scripts 방치** [실측]
- 최상위 61개 중 36개가 어디에서도 참조되지 않는다. probe 39개 중 29개.
- 13개 스크립트가 포트 5173을 하드코딩하는데 vite dev 포트는 5174(`vite.config.ts:261`).
- 공용 `scripts/lib/devServer.cjs`를 쓰는 probe는 0개이고 `pageerror` 보일러플레이트가 30개 파일에 반복된다.
- `policy:dev`는 존재하지 않는 `server/`를 참조. `publish:full`은 prepare를 두 번 실행. `test:browser`는 실행마다 chromium 설치.

## 4. 요구사항

**FR**
- FR-25-01: harness 참조를 실제 파일과 일치시킨다. 삭제가 의도라면 `check-harness.mjs`의 `.codex/config.toml` 의존 제거, AGENTS.md의 `.codex/*` 참조 정리, `package.json` `files`와 README 링크, `verify-package-consumer.cjs` allowlist 정리. 의도가 아니라면 복원(열린 질문 1).
- FR-25-02: CI를 병렬 job으로 나눈다: `lint+typecheck+checks`, `jest`(shard 또는 `--maxWorkers=50%`, `actions/cache`로 jest 캐시), `package`, `demo`, `perf`(10 PRD 결정적 지표).
- FR-25-03: CI install에 `--ignore-scripts`를 붙이고 build는 한 번만 한다.
- FR-25-04: 트리거 브랜치를 기본 브랜치와 일치시킨다(`main`/`master` 정리).
- FR-25-05: `check:quality`, `check:layer1`, `check:entries`를 `verify`와 CI에 추가한다.
- FR-25-06: `examplePackageConsumption`의 Program을 `beforeAll`에서 한 번만 만들거나, 이 검사를 TS 7 typecheck로 옮긴다.
- FR-25-07: jest `projects`로 node/jsdom을 분리한다. Layer 1과 순수 로직 테스트는 node 환경에서 돈다.
- FR-25-08: `@swc/jest` 전환은 측정 후 결정한다(Layer 1 23파일과 전체 suite 비교).
- FR-25-09: `jest.memory.config.js`는 heap 증가 기준 판정을 추가하거나 본 suite와 중복되지 않게 한다.
- FR-25-10: 벽시계 임계값 테스트를 호출 수 기준으로 바꾼다(D-20, 10 PRD 10-b).
- FR-25-11: `typecheck`의 중복 프로젝트를 줄인다. TS 7 API가 안정화되면 ts-jest, typescript-eslint를 TS 7로 옮겨 컴파일러를 단일화한다.
- FR-25-12: tsconfig `paths`를 별칭의 단일 원천으로 두고 jest `moduleNameMapper`와 `check-entry-isolation` 별칭은 생성한다. vite 수동 alias를 제거한다. 사용 0 별칭과 `@types/*`를 제거한다.
- FR-25-13: `react-hooks/exhaustive-deps`를 켜고 54건을 정리한다. 타입 인식 `no-floating-promises`를 켠다. `globals.node`는 scripts와 설정 파일에만 적용한다.
- FR-25-14: 테스트 0 도메인(effects, wasm, ops, error, items)에 최소 계약 테스트를 추가한다. npc, avatar, navigation에 통합 테스트를 추가한다.
- FR-25-15: mock이 대상 자체를 대체하는 테스트(`useManagedEntity.test.ts` 유형)를 찾아 실제 구현 통합 테스트로 바꾼다.
- FR-25-16: scripts를 정리한다. 참조 없는 36개는 `scripts/archive/`로 옮기거나 삭제(사용자 확인). probe는 `scripts/lib/devServer.cjs`와 공용 `pageerror` 수집기를 쓰고 포트는 vite 설정에서 읽는다.

**NFR**
- NFR-25-01: `pnpm verify`가 깨끗한 checkout에서 통과한다.
- NFR-25-02: PR CI 벽시계 시간 15분 이하(병렬 job).
- NFR-25-03: 전체 jest 병렬 60초 이하(기준 기기).
- NFR-25-04: 설정 원천 하나(별칭), 컴파일러 하나(최종).

## 5. 설계

### 5.1 CI job

```
lint-typecheck   : eslint, tsc(build/test), check:quality, check:layer1, check:entries, check-harness
jest             : jest --shard=1/2, 2/2 (jest 캐시)
package          : build → publint → test:package:built
demo             : build:demo → test:demo
perf             : perf:check (결정적 지표만)
browser(nightly) : test:browser, probe-*, frame-harness(ms 지표)
```

### 5.2 jest projects

| project | 환경 | 대상 |
|---|---|---|
| `node` | node | `src/core/*/core/**`, `scene-object`, `save/core`, `networks/adapter`, 순수 util |
| `dom` | jsdom | hooks, components, stores(React 통합) |
| `package` | node | `src/__tests__/*` 패키지·API 계약 |

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 25-a | D-19 harness·docs 참조 정리(열린 질문 1 결정 후) | `node scripts/check-harness.mjs`, `jest src/__tests__/packageFiles.test.ts` 통과 |
| 25-b | D-20 벽시계 테스트 교체, `examplePackageConsumption` Program 재사용. 완료(2026-09-25): 남은 벽시계 임계값 7파일을 호출 수·기능 단언으로 교체. `tsc -p tsconfig.json`과 중복이던 예제 전체 typecheck 테스트를 지우고 export 조회용 Program은 예제 파일만 root로 만든다(58.5→17.1s) | 전체 jest에서 해당 파일 시간 절반 이하 |
| 25-c | `check:*`를 verify에 추가, CI 트리거 브랜치 정리, `--ignore-scripts` | PR에서 check 실행 확인 |
| 25-d | CI 병렬 job 분리와 캐시 | PR CI 시간 기록 |
| 25-e | jest projects(node/dom/package) | 전체 jest 시간 기록, 실패 0 |
| 25-f | 별칭 단일 원천, 사용 0 별칭 제거 | tsconfig 외 수동 별칭 목록 0 |
| 25-g | ESLint `exhaustive-deps`, `no-floating-promises`, globals 범위 | lint 통과 |
| 25-h | 테스트 공백 도메인 계약 테스트, mock 대체 테스트 교체 | 테스트 0 도메인 0 |
| 25-i | scripts 정리와 probe 공용화 | 참조 없는 스크립트 0 |
| 25-j | 컴파일러 단일화(TS 7 생태계 준비 후) | `typescript` 별칭 제거 |

## 7. 공개 API 영향

없음.

## 8. 검증과 완료 기준

```bash
corepack pnpm run verify
node scripts/check-harness.mjs
corepack pnpm exec jest --listTests | wc -l
corepack pnpm exec jest
```

완료 기준: NFR-25-01~04 충족.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| jest node 환경 전환으로 숨은 DOM 의존 테스트 실패 | 실패 6건을 먼저 목록화하고 dom project에 남김 |
| `exhaustive-deps` 정리 중 의도된 의존 누락이 동작 변경 | 규칙을 warn으로 시작, 파일 단위로 error 전환 |
| scripts 삭제로 개인 워크플로 파손 | 삭제 대신 archive 이동, 사용자 확인 |

## 10. 열린 질문

1. 작업 트리에서 삭제된 `.codex/*`, `docs/*.md`, `HARNESS.md`는 의도된 삭제인가. AGENTS.md의 `.codex/context/*.md` 참조를 제거할 것인가, 파일을 복원할 것인가.
2. CI 트리거를 `main`과 `master` 중 무엇으로 통일할 것인가.
3. 참조 없는 scripts 36개를 삭제해도 되는가.
