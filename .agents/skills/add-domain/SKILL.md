---
name: add-domain
description: gaesup-world에 새 도메인을 추가하거나 기존 도메인을 확장할 때 사용한다. core, bridge, hooks, components, stores, plugin, 공개 API, examples와 저장 상태 테스트가 함께 필요한 작업에서 활성화한다.
---

# 도메인 추가 및 확장

`src/core/motions/`와 유사 도메인을 먼저 읽고 다음 구조를 따른다.

```text
src/core/<domain>/
├── core/
├── bridge/
├── hooks/
├── components/<Name>/{index.tsx,styles.css,types.ts}
├── stores/
├── __tests__/
├── types.ts
├── index.ts
└── plugin.ts
```

Layer 1에는 React, Zustand, `@react-three/fiber`를 넣지 않는다. Layer 2는 `CoreBridge`의 `buildEngine`, `executeCommand`, `createSnapshot`을 사용하고 필요한 bridge initialization과 DI를 확인한다.

frame loop에서 Three.js 객체를 반복 생성하지 않는다. snapshot cache를 in-place로 갱신하고 engine, subscription, timer, event listener, physics resource를 해제한다.

저장 상태가 있는 store는 `serialize()`와 `hydrate(data)`를 제공하고 `SaveSystem`을 사용한다. plugin ID, save extension ID, store service ID 중복을 확인한다.

공개 API 변경 시 `src/index.ts` 또는 subpath 엔트리, `package.json`, `vite.config.ts`, `tsconfig.json`, `jest.config.js`, `scripts/copy-cjs-types.cjs`, 관련 공개 API 테스트를 확인한다.

runtime 기능은 `examples/pages/runtime.ts`, UI 기능은 `examples/pages/World.tsx`, editor panel 또는 `examples/App.tsx`에 연결한다. examples에서는 `gaesup-world` 공개 경로만 import한다. plugin API 변경 시 `examples/plugins/cozy-life-package`도 확인한다.

검증:

```bash
corepack pnpm test -- src/core/<domain> --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
corepack pnpm exec eslint <changed-files>
```

저장 상태를 추가하면 duplicate key, null 입력, serialize/hydrate round-trip 테스트를 추가한다.
