# 검증

변경 범위를 덮는 가장 좁은 검증부터 실행하고 점차 넓힌다: 도메인 테스트(`pnpm test -- src/core/<domain> --runInBand`), 빌드 타입체크(`pnpm exec tsc -p tsconfig.build.json --noEmit`), 변경 파일만 lint. public API나 subpath를 변경했으면 `publicApi.test.ts`와 `packageExports.test.ts`를 추가로 실행하고 `AGENTS.md`에 나열된 동시 수정 대상 6개 파일을 확인한다. 실패 출력은 그대로 보고하고, 실행하지 않은 검증을 성공으로 보고하지 않는다. 기존 실패와 이번 slice가 만든 regression을 구분한다.
