---
name: verify
description: gaesup-world 변경 사항을 도메인, 공개 API, export, examples, 저장 상태 기준으로 검증할 때 사용한다.
---

# 변경 사항 검증

변경 범위에 맞춰 좁은 검증부터 실행한다.

기본 검증:

```bash
corepack pnpm exec tsc -p tsconfig.build.json --noEmit
corepack pnpm exec eslint <changed-files>
```

도메인 변경:

```bash
corepack pnpm test -- src/core/<domain> --runInBand
```

memory 또는 lifecycle 변경:

```bash
corepack pnpm test:memory:ci
```

공개 API 또는 export 변경:

```bash
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm build:types
corepack pnpm exec publint
```

examples, plugin, runtime, UI 또는 route 변경:

```bash
corepack pnpm exec tsc --noEmit
corepack pnpm test:demo
```

전체 검증:

```bash
corepack pnpm verify
corepack pnpm verify:full
```

검증 결과는 다음 형식으로 보고한다.

```text
[성공] 명령 - 핵심 결과
[실패] 명령 - 실패 원인 또는 첫 번째 관련 오류
[미실행] 명령 - 실행하지 않은 이유
```

실행하지 않은 명령은 성공으로 보고하지 않는다. 기존 실패와 이번 변경으로 발생한 실패를 구분한다.
