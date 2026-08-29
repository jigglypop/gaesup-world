---
name: add-subpath-export
description: gaesup-world의 package subpath export를 추가하거나 변경할 때 사용한다. package.json, Vite, TypeScript, Jest, CJS declaration, 공개 API 테스트와 examples를 함께 갱신하는 작업에서 활성화한다.
---

# Subpath export 추가 및 변경

새 subpath마다 `src/<name>.ts` 엔트리와 package export 설정이 함께 동작해야 한다.

변경 순서:

1. `src/<name>.ts` 엔트리를 추가하거나 변경한다.
2. 기존 React 엔트리의 `reflect-metadata`와 bridge initialization 요구 사항을 확인한다.
3. `package.json`의 `exports`에 import, require, types, default를 반영한다.
4. `vite.config.ts`의 self-alias와 library entry를 반영한다.
5. `tsconfig.json`의 `paths`를 반영한다.
6. `jest.config.js`의 `moduleNameMapper`를 반영한다.
7. `scripts/copy-cjs-types.cjs`의 declaration 대상을 반영한다.
8. `src/__tests__/packageExports.test.ts`와 필요한 `publicApi.test.ts`를 갱신한다.
9. examples에서 `gaesup-world/<subpath>`로 실제 사용 경로를 만든다.

examples에서 `src/...`, `@/`, `@core/`를 import하지 않는다. runtime export는 `examples/pages/runtime.ts`, UI export는 `examples/pages/World.tsx`, editor panel 또는 `examples/App.tsx`에 연결한다.

검증:

```bash
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm build:types
corepack pnpm exec publint
corepack pnpm exec tsc --noEmit
corepack pnpm test:demo
```

실패는 기존 실패와 이번 export 변경으로 발생한 실패를 구분해 보고한다.
