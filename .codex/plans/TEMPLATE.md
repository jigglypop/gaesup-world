# Epoch N: <slice 이름>

## 목표와 범위

- 바꾸는 boundary 한 문장. source of truth: <현재> → <목표> (old/new 공존 시 canonical path 명시)
- 제외: <이 slice에서 안 건드리는 것>
- 리스크: <있을 때만 한 줄>

## 검증

- `pnpm test -- <path> --runInBand` / `pnpm exec tsc -p tsconfig.build.json --noEmit`
- public API 변경 시: publicApi/packageExports 가드

## 완료 조건

- [ ] <검증 가능한 조건>
- [ ] 검증 실행·통과, HARNESS.md 기록 append
