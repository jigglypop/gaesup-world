---
name: verify
description: 변경 규모에 맞는 검증 사다리. 작업을 "끝났다"고 보고하기 전, 커밋 전, 또는 사용자가 검증을 요청할 때 로드할 것.
---

# 검증 사다리

싼 것부터 비싼 것 순서로, 변경 반경에 맞는 단계까지 올라간다. 상위 단계 통과가 하위 단계를 포함하지 않으므로 건너뛰지 말 것.

## 0단계 — 항상 (모든 코드 변경)

```
pnpm exec tsc -p tsconfig.build.json --noEmit     # src 타입체크 (typecheck 스크립트 없음)
pnpm exec eslint <변경 파일들>                      # 변경 파일만! 저장소 전체는 기존 실패 ~3457건
```

## 1단계 — 도메인 로직 변경

```
pnpm test -- src/core/<domain> --runInBand
```

메모리/누수 관련 코드를 건드렸으면: `pnpm test:memory` (runInBand 내장).

## 2단계 — 공개 API / 엔트리 / export 변경

```
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
pnpm build:types
```

examples를 건드렸으면 `pnpm exec tsc --noEmit` (examples 포함 타입체크)도 실행.

## 3단계 — 릴리스 전 / 대규모 변경

```
pnpm verify        # lint + test(runInBand) + build:types + publint — lint 단계는 기존 실패로 빨간불일 수 있음을 감안
pnpm verify:full   # + 빌드 후 패키지 소비 테스트(test:package) + 데모 청크 검증(test:demo)
```

브라우저 스모크가 필요하면: `pnpm test:browser` (Playwright chromium 설치 포함, 오래 걸림).

## 보고 규칙

- 실패하면 실패 출력을 그대로 보고한다. "될 것"이라는 추정으로 성공을 보고하지 않는다.
- 기존(pre-existing) 실패와 이번 변경으로 생긴 실패를 구분해서 보고한다. 애매하면 `git stash` 후 동일 명령으로 기준선을 잰다.
