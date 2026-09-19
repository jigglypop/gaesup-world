# 저장소 검증 / Repository validation

`AGENTS.md`가 작업 규칙이고 `.codex/config.toml`이 프로젝트 설정입니다. 삭제된 과거 hook을 다시 설치하지 않고 현재 구성을 검사합니다.

`AGENTS.md` defines the working rules; `.codex/config.toml` holds project settings. Validation checks the current configuration rather than reinstalling removed historical hooks.

| 명령 / Command | 검사 / Check |
|---|---|
| `corepack pnpm run test:harness` | 설정, strict TypeScript flag, 검증 진입 파일 / configuration, strict flags, validation entries |
| `corepack pnpm run test:asset-tools` | Node test runner로 asset 도구 검사 / asset tools through Node's test runner |
| `corepack pnpm exec jest --runInBand` | library와 example tests / library and example tests |
| `corepack pnpm run verify:full` | lint, tests, build, package, memory, demo |
| `corepack pnpm run test:minihome:browser` | 실행 중인 5174 서버의 실제 Chrome / actual Chrome against the server on port 5174 |

Jest 뒤에 이중 `--`를 넣지 마세요. 테스트 경로로 해석될 수 있습니다. asset의 `node:test` 파일은 Jest 수집에서 제외하지만 `verify`에서 별도로 실행합니다.

Do not insert an extra `--` before Jest options: it may become a test-path pattern. Asset `node:test` files are excluded from Jest collection and executed separately by `verify`.

기존 캐릭터 호환 자산은 같은 저장소의 이전 체크아웃에서 복구했습니다. manual-v1은 `corepack pnpm run avatar:fixtures`로 생성하는 원본 procedural test geometry이며 최종 아트 승인과 다릅니다.

Legacy compatibility assets were recovered from the same repository's previous checkout. manual-v1 is original procedural test geometry generated with `corepack pnpm run avatar:fixtures`, not final art approval.
