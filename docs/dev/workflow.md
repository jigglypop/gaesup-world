# 작업 흐름

엔진을 고치는 순서와 규칙이다. 판단 기준은 [principles.md](principles.md), 검증 명령은 [verification.md](verification.md)에 있다.

## PRD 중심 흐름

1. **계획**: 루트 [`PRD.md`](../../PRD.md)의 "실행 순서" 표에 slice를 적는다. 한 행은 ID, 내용, 결정적인 완료 기준(테스트, 카운터, 측정 수치)이다. 완료 기준이 없으면 착수하지 않는다.
2. **착수**: 표의 맨 위 행부터 한다. 순서를 바꾸려면 PRD를 먼저 고친다.
3. **구현**: 삭제·수정을 하고, 타입체크와 해당 모듈 테스트를 수시로 돌린다.
4. **검증**: `pnpm run verify:full`을 통과시킨다. 공개 API가 바뀌면 export snapshot과 소비자 검증 스크립트를 함께 갱신한다.
5. **커밋**: slice 하나에 커밋 하나. 제목 끝에 slice ID를 붙인다.
6. **정리**: PRD에서 끝난 행을 지운다(완료 표시나 진행 기록을 남기지 않는다. 기록은 git log가 갖는다). 바뀐 사용법·구조를 `docs/`에 반영한다.
7. **보고**: 채팅에 한국어로 무엇을 왜 바꿨는지, 수치와 함께 알린다.

`CLAUDE.md`의 규칙: 작업 전 PRD에 정리하고 끝나면 지운다, 임시 파일은 지운다, 새 md 파일을 무분별하게 만들지 않는다, 진행 상황을 한국어로 설명하면서 진행한다.

## 커밋 규칙

```
<type>(<scope>): <무엇이 어떻게 달라지는지 한 문장, 한국어> (<slice ID>)

- 본문은 바뀐 것과 근거를 항목으로. 수치가 있으면 넣는다.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

- type: `feat`, `fix`, `perf`, `refactor`, `chore`, `docs`, `test`.
- 제목은 결과를 쓴다. 예: `fix(camera): 카메라 충돌 탐사를 발이 아니라 몸 중심 높이에서 시작해, … 무너지지 않는다`.
- 작업 트리에 다른 사람의 미커밋 변경이 섞여 있으면 슬라이스 파일만 골라 스테이징한다. 한 파일에 두 작업이 섞였으면(예: export snapshot) 중간 상태의 blob을 만들어 `git update-index --cacheinfo`로 올리면 각 커밋이 스스로 일관된다.
- 브랜치: 작업 브랜치는 `main`이다(PR 기준 브랜치는 `master`). push는 요청이 있을 때만 한다.

## 병렬 에이전트

큰 slice는 서로 겹치지 않는 파일 묶음으로 나눠 에이전트에게 맡길 수 있다. DEL-1의 테스트 수정을 이렇게 나눴다.

- 각 에이전트에게 **소유 파일 목록**과 **건드리지 말 파일**을 명시한다. 소스 변경이 필요하면 보고만 하게 한다.
- 맥락(무엇이 지워졌고 새 API가 무엇인지)과 판단 규칙(지운 기능의 테스트는 삭제, 남는 기능은 수단만 교체, 단언 약화 금지)을 적는다.
- 미커밋 변경 위에서 일해야 하므로 worktree 격리를 쓰지 않는다(worktree는 HEAD에서 만들어진다).
- 결과는 그대로 믿지 않는다. 에이전트 보고에 틀린 주장이 섞일 수 있다(예: 이미 export되는 모듈을 "export 안 됨"이라고 보고). 삭제 판단은 grep과 컴파일러로 직접 확인한다.
- 다른 에이전트가 쓰는 파일을 바꿨으면 메시지로 알린다.

## 권한과 승인

- 공개 API 삭제는 먼저 사용자 승인을 받는다. 권한 분류기가 `package.json` exports·`tsconfig`·`eslint` 설정을 함께 바꾸는 묶음을 "공유 자원 수정"으로 막은 적이 있다(blueprints 삭제). 막히면 같은 결과를 다른 방법으로 우회하지 말고, 트리를 일관된 상태로 되돌린 뒤 사용자에게 묻는다.
- 되돌리기 어려운 작업(worktree 삭제, 강제 push, 외부 게시)은 확인을 받는다.

## 환경 메모 (Windows)

- 셸은 Git Bash와 PowerShell이 있다. Bash에서 `/`로 시작하는 인자는 경로로 바뀌므로 필요하면 `MSYS_NO_PATHCONV=1`을 앞에 붙인다.
- 저장소 파일은 CRLF와 LF가 섞여 있다. 스크립트로 치환할 때는 `\r\n`을 `\n`으로 바꿔 처리하고 원래 줄바꿈으로 되돌려 쓴다. `Edit`의 여러 줄 치환이 CRLF 파일에서 맞지 않으면 이 방식을 쓴다.
- 임시 스크립트와 측정 산출물은 세션 scratchpad에 두고 끝나면 지운다. 저장소에 단발성 스크립트를 남기지 않는다.
- 브라우저 확인은 `scripts/lib/devServer.cjs`의 `startProbeServer`(Vite dev 서버)와 `launchWebGpuBrowser`(Chrome + WebGPU 플래그)를 쓴다([measurement.md](measurement.md)).
- 긴 명령(`verify:full` 약 20분)은 백그라운드로 돌리고, 도는 동안 `src`를 바꾸지 않는다.

## 오래된 worktree

`git worktree list`에 2026-09-26에 멈춘 작업 폴더가 있다: `C:/dev/gaesup-world-gw`(브랜치 `minihome-on-gw`, 옛 minihome을 gw로 옮기는 계획 PRD 커밋 하나), `C:/dev/gw-l1a`~`gw-l5`(`f2b077d1` 기준, 일부에 미커밋 부분 변경). 옛 minihome을 지운 뒤라 방향이 맞지 않는다. 사용자 확인 없이 지우지 않는다.

## 세션 체크리스트

시작:
1. `CLAUDE.md`, `PRD.md`, [../README.md](../README.md)의 현재 상태를 읽는다.
2. `git status`, `git log --oneline -10`, `git worktree list`를 본다.
3. 맨 위 slice의 모듈을 [module-status.md](module-status.md)와 [architecture.md](architecture.md)에서 확인한다.

끝:
1. `pnpm run verify:full` 통과, 커밋.
2. PRD에서 끝난 행 삭제, `docs/` 갱신(특히 [../README.md](../README.md)의 "현재 상태").
3. scratchpad 임시 파일 삭제, 백그라운드 작업 정리.

## 관련 문서

- [principles.md](principles.md) · [verification.md](verification.md) · [measurement.md](measurement.md) · [decisions.md](decisions.md)
- [../../PRD.md](../../PRD.md) · [../../CLAUDE.md](../../CLAUDE.md)
