# Epoch 2c: Executable Quality Gates

## 목표

현재 green 여부를 잘못 보고하거나 실행 전 실패하는 lint, architecture boundary, memory, package-consumer gate를 실제 저장소 계약에 맞게 복구한다. 이 slice는 production architecture를 한 번에 재작성하지 않고 legacy 위반을 정확한 baseline으로 고정해 신규 회귀를 차단한다.

## 현재 상태

- `pnpm lint`는 tracked `.tmp/package-consumer`와 그 minified build까지 검사해 3,570 errors를 보고한다. authored `src examples scripts`만 검사하면 10개 파일의 16 errors다.
- 16 errors는 import ordering 12건과 유효한 R3F `raycast`/`colorWrite` prop 4건이다.
- `boundaries/elements`의 첫 `src/core/**` 패턴이 모든 세부 layer를 `core`로 분류해 boundary error를 0건으로 만든다.
- 실제 dependency graph에는 Layer 1→Layer 2/3 및 Layer 2→Layer 3 local edge 29개와 Layer 1의 `@react-three/rapier` import 9개가 있다.
- examples의 private import는 현재 0개지만 기존 package-consumption test는 private alias와 `src/` resolved import를 수집하지 않는다.
- 세 `test:memory*` script는 제거된 Jest `--testPathPattern` 옵션을 사용하고, 옵션명만 고치면 matching suite가 없어 다시 실패한다.
- package의 Node engine `>=18`은 Vite 7/rimraf 6/semantic-release 24의 실제 Node 요구와 맞지 않는다.
- package consumer가 모든 optional peer를 직접 설치해 optional metadata 오류를 숨긴다.

## 범위

- ESLint에서 generated `.tmp/**`를 제외하고 authored source의 16 errors를 의미 변화 없이 정리한다.
- misleading boundary rule을 신규 회귀 방지용 architecture test로 대체하거나 비활성 debt를 명시한다.
- TypeScript resolution 기반으로 29 local upward edges와 9 Rapier imports를 exact legacy baseline으로 고정한다. 추가와 stale baseline 모두 실패해야 한다.
- examples가 `gaesup-world` public entry 외의 private alias 또는 `src/` resolved import를 사용하면 실패하는 test를 추가한다.
- memory script가 실제 cache/bridge/entity ownership suites를 Jest 30 CLI로 실행하도록 복구한다.
- Node engine과 direct/optional peer metadata를 built import graph에 맞추고 consumer verifier가 required와 explicitly exercised optional peers를 구분하도록 한다.
- strict declaration gate가 드러낸 scene JSON exact-optional 불일치를 authoring/canonical 타입과 owned parse/load/save 경계로 분리한다.
- public/package tests, `publint`, `test:package`, `test:demo`를 실행한다.

## 제외 범위

- baseline 29+9 architecture edges를 이번 slice에서 일괄 이동하지 않는다. domain별 strangler slice에서 줄인다.
- R3F 10/WebGPU, physics algorithm, WorldDocument와 network protocol은 변경하지 않는다. 단 strict declaration gate를 false-green 없이 통과시키기 위해 기존 scene-object의 component JSON authoring/canonical 경계만 함께 교정한다.
- exhaustive-deps debt와 React test renderer migration을 다루지 않는다.
- package subpath를 새로 만들거나 기존 export를 제거하지 않는다.

## Source of Truth

- authored lint 범위는 repository source/config이고 `.tmp`, `dist`, `demo-dist`, coverage는 generated output이다.
- architecture debt의 source of truth는 TypeScript가 실제 resolve한 dependency edge와 committed exact baseline이다.
- examples의 유일한 library boundary는 `package.json.exports`에 선언된 `gaesup-world` entry다.
- runtime package requirements의 source of truth는 built ESM/CJS가 정적으로 요구하는 direct peer와 각 subpath consumer scenario다.
- memory gate의 source of truth는 이름 우연이 아니라 명시한 cache/bridge/entity lifecycle suites다.
- `SceneJsonObject`는 `undefined` 없는 canonical read contract이고 `SceneJsonAuthoringObject`는 exact-optional 양쪽의 입력 contract다. persisted parse/load/save는 stable ID와 owned plain materialization을 source of truth로 사용한다.

## 호환성 전략

Production symbol, render behavior와 package exports는 유지한다. Import reordering은 side-effect-free ordering을 확인하고 적용한다. Node engine과 peer metadata는 이미 실제 toolchain/bundle이 요구하는 범위를 선언하도록 정정한다. Legacy architecture edge는 제거하지 않고 exact baseline으로 먼저 잠근다.

Scene-object에는 의도적 migration decision이 있다. 표준 authoring interface는 raw strict `SceneJsonObject`에 직접 assign되지 않고 factory를 거쳐야 한다. `createSceneComponent`, `createSceneObject`와 `loadSceneRuntime`은 입력/component identity를 보존하지 않고 owned copy를 사용하며, persisted parser는 object/component ID와 component type을 필수로 검증한다. `serializeSceneDocument`는 모든 validation issue에 `TypeError`를 던진다. 기존 public symbol, tuple type과 반환 component data의 mutable 타입은 유지하고 이 변화는 README, world-model context, consumer compile/runtime probe로 고정한다.

## 리스크

- import reorder가 side-effectful module evaluation 순서를 바꿀 수 있다.
- peer optionality 변경은 설치되는 dependency set을 늘릴 수 있지만 현재 built root가 statically import하는 package만 required로 승격해야 한다.
- boundary resolver가 type-only/export/dynamic imports를 누락하면 false green이 된다.
- memory suite를 지나치게 넓히면 CI 시간이 불필요하게 증가한다.
- owned scene materialization은 기존 alias identity 관찰과 malformed document의 silent 보정 동작을 바꾼다.

## 검증

- `corepack pnpm run lint`.
- 변경 source/config/test ESLint, 신규 test는 `--no-ignore`.
- architecture boundary 및 examples package-consumption tests.
- `corepack pnpm run test:memory`, `test:memory:verbose`, `test:memory:ci` 중 기본과 CI gate.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit` 및 `corepack pnpm exec tsc --noEmit`.
- `corepack pnpm test -- src/__tests__/publicApi.test.ts src/__tests__/packageExports.test.ts src/__tests__/examplePackageConsumption.test.ts --runInBand`.
- `corepack pnpm exec publint`.
- `corepack pnpm run test:package` 및 `corepack pnpm run test:demo`.
- `corepack pnpm test -- --runInBand`.
- `git diff --check`.

## 완료 조건

- [x] root lint가 generated output을 건너뛰고 0 errors / 0 warnings로 통과한다.
- [x] architecture baseline gate가 현재 29 local + 9 Rapier debt를 정확히 고정하고 신규/stale edge를 거부한다.
- [x] examples private import 0건이 executable regression으로 보호된다.
- [x] memory scripts가 실제 lifecycle suites를 실행해 통과한다.
- [x] Node engine, peer metadata와 consumer verifier가 실제 bundle requirement와 일치한다.
- [x] typecheck, public/package/demo, publint, 전체 Jest 결과를 기록한다.
- [x] 독립 invariant/API 감사를 통과하고 `HARNESS.md`에 append한다.

## 구현 결과

- `.tmp/**`를 lint와 Git 생성물 범위에서 제외하고 기존 tracked package-consumer fixture 13개를 삭제했다. authored lint 16건은 import order와 유효한 R3F prop allow-list만 정리했다.
- false-green이던 `eslint-plugin-boundaries` 규칙을 제거하고 TypeScript AST/resolution 기반 gate로 교체했다. 현재 local upward edge 29개와 Layer 1 Rapier edge 9개를 exact multiset으로 고정해 addition과 stale baseline을 모두 실패시키며, Layer 1의 direct/subpath React, Zustand, R3F import 신규 유입도 0 baseline으로 차단한다.
- examples의 모든 static/type/export/dynamic/require module reference를 검사해 private tsconfig alias, Vite-only alias와 `src` resolved import를 차단한다.
- `jest.memory.config.js`가 bridge/cache/entity ownership 5개 suite를 명시하며 세 memory script를 Jest 30 CLI로 복구했다.
- Node engine을 `^20.19.0 || >=22.12.0`으로 맞추고 statically required R3F peers를 required로 정정했다. public bundle에서 사용하지 않는 router는 peer에서 완전히 제거하고 examples용 devDependency만 유지했으며, unused/transitive direct dependency와 lock importer를 함께 정리했다.
- package/demo verifier는 repository의 `.tmp`와 `demo-dist` 대신 OS temp를 사용하고 성공·실패 모두 cleanup한다. consumer install은 legacy peer bypass 없이 모든 required peer를 설치한다.
- declaration finalizer는 source-only declaration을 포함한 ESM/CJS 848개 graph를 mirror하고 내부 alias, CSS side-effect import, extensionless relative reference를 제거한다. `.js`/`.cjs` target 존재와 graph 대칭을 postcondition으로 검사한다.
- consumer는 NodeNext ESM/CJS source와 runtime을 검사하고, 외부 peer declaration 결함은 일반 `skipLibCheck`로 격리하되 설치된 `gaesup-world` 소유 declaration만 별도 `skipLibCheck: false` compiler pass로 실패시킨다.
- declaration finalizer 재실행 전후 graph hash를 비교해 idempotence를 검증하고, 별도 Bundler consumer가 기존 `GLTF` 양방향 호환을 보호한다.
- strict declaration에서 드러난 browser timeout type, GLTF result type, WebGPU Navigator augmentation, scene JSON optional/index-signature, source-only flag type 경로를 호환 가능한 source type으로 수정했다.
- scene JSON은 strict `SceneJsonObject`와 `SceneJsonAuthoringObject`로 분리했다. component data는 descriptor 기반 owned copy로 만들며 accessor, symbol, `undefined`, null root, custom/sparse array, non-plain object, non-finite number, `-0`와 cycle을 거부한다. parser는 stable persisted ID/wrapper/transform을 검증하고 load와 serialize는 owned document를 재물질화한다.

## 최종 검증 결과

- `corepack pnpm run lint`: 0 errors / 0 warnings.
- 변경 source/config와 신규 test `--no-ignore` ESLint: 통과.
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`, `corepack pnpm exec tsc --noEmit`: 통과.
- focused boundary/examples/public/package/scene-object: 6 suites / 85 tests 통과. scene-object 단독은 2 suites / 41 tests 통과했다.
- `corepack pnpm run test:memory`: 5 suites / 86 tests 통과.
- `corepack pnpm run test:memory:ci`: 5 suites / 86 tests 통과, suite 종료 heap 80–137 MB.
- `corepack pnpm test -- --runInBand`: 189 suites / 1,743 tests 통과, 1 suite / 1 test skipped.
- `corepack pnpm run test:package`: fresh ESM/CJS 각 915 modules build, npm consumer 95 packages, exact-optional false/true strict owned declarations, GLTF Bundler compatibility, ESM/CJS invalid-data/owned-copy runtime, 648-module browser bundle 통과.
- `corepack pnpm run test:demo`: OS temp fresh 1,615-module build와 lazy packageSurface/CSS/theme/initial-chunk contract 통과.
- `corepack pnpm exec publint`: all good.
- `corepack pnpm install --frozen-lockfile`: lock 일치, obsolete direct dependencies 제거 후 prepare build 통과.
- relevant Prettier check, script syntax check, frozen lockfile 및 lockfile-only check, `git diff --check`: 통과.

## 실패·미실행과 잔여 debt

- 구현 중 temp consumer의 Vite config root-resolution 결합과 declaration `skipLibCheck` false-green을 재현했으며 plain config와 full declaration graph/owned strict gate로 수정 후 재검증했다.
- scene JSON 감사에서 undefined/index read 충돌, generic data omission, alias mutation, accessor/toJSON, sparse wrapper, unstable ID와 malformed transform의 silent normalization을 재현했다. authoring/canonical 분리와 persisted owned boundary로 수정하고 exact-optional 양쪽 compile probe 및 ESM/CJS runtime probe로 재검증했다.
- `three-stdlib`, `@dimforge/rapier3d-compat`, `@react-three/rapier`의 외부 NodeNext declaration은 자체적으로 strict-clean하지 않다. 외부 diagnostic은 이 저장소의 owned gate에서 제외하고 consumer source 및 repository-owned declaration은 별도로 검사한다.
- `test:memory:verbose`는 기본/CI gate가 같은 5 suites를 실행하므로 별도 실행하지 않았다.
- 전체 Jest의 기존 React 19 `react-test-renderer` deprecation, Three.js duplicate-instance 경고와 legacy `BridgeRegistry` console warning은 테스트 실패가 아니며 후속 debt다.
- peer range 하한 조합(React 18/R3F 8 등) 설치 matrix와 Playwright `test:browser`는 이번 slice에서 실행하지 않았다.
- legacy architecture 29+9 edge는 이번 slice에서 이동하지 않았다. 다음 domain strangler slice에서 baseline과 함께 감소시킨다.
