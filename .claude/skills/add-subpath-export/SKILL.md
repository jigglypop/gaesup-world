---
name: add-subpath-export
description: gaesup-world에 패키지 subpath export를 추가/변경/삭제할 때의 6-파일 동시 수정 절차. package.json exports를 건드리는 모든 작업 전에 로드할 것.
---

# subpath export 추가/변경 절차

이 패키지는 워크스페이스 대신 **14개 subpath export**로 분할되어 있다 (`gaesup-world`, `/admin`, `/blueprints`, `/blueprints/editor`, `/runtime`, `/editor`, `/building`, `/gameplay`, `/navigation`, `/assets`, `/network`, `/plugins`, `/server-contracts`, `/postprocessing`, `/style.css`). 각 subpath는 `src/<name>.ts` 배럴 엔트리 파일 하나에 대응한다.

## 불변식

- 엔트리 파일 최상단 관례: React 표면을 포함하는 엔트리는 `import 'reflect-metadata';` 와 `import './core/initializeBridges';` 를 먼저 실행한다 (`src/index.ts`, `src/runtime.ts`, `src/editor.ts` 참조).
- examples는 subpath로만 import한다 — 새 subpath를 만들면 `examples/`에서 실제로 사용하는 코드를 최소 한 곳 추가해야 한다.

## 6개 파일 동시 수정 체크리스트

`src/__tests__/packageExports.test.ts`가 `package.json` exports ↔ `vite.config.ts` ↔ `tsconfig.json` ↔ `scripts/copy-cjs-types.cjs`의 정합성을 **파일을 직접 읽어 자동 대조**한다(각 export의 import/require × types/default 대상, files 포함 여부까지). 단, **`jest.config.js` moduleNameMapper는 이 테스트가 커버하지 않는다** — 빠뜨리면 가드 테스트는 통과하는데 해당 subpath를 import하는 테스트만 조용히 깨지므로 반드시 수동 확인할 것.

1. `package.json` — `exports` 맵에 import/require × types/default 4개 항목 추가. `files` 배열 커버 여부 확인.
2. `vite.config.ts` — self-alias(`gaesup-world/<name>` → `src/<name>.ts`)와 `build.lib.entry`에 엔트리 추가.
3. `tsconfig.json` — `paths`에 동일한 self-alias 추가.
4. `jest.config.js` — `moduleNameMapper`에 동일한 매핑 추가.
5. `scripts/copy-cjs-types.cjs` — `.d.cts` 복사 대상에 새 엔트리 추가.
6. `src/__tests__/packageExports.test.ts` — 새 subpath를 가드 테스트에 등록.

## 검증 (반드시 실행)

```
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
pnpm build:types
pnpm exec publint
```

전부 통과한 뒤 `HARNESS.md`에 라운드 섹션을 **append**(기존 섹션 수정 금지)하고, subpath ↔ examples ↔ docs 커버리지 표를 갱신한다.
