---
name: close-epoch
description: active epoch plan의 slice를 완료 처리할 때 로드. 검증 실행, 해당 영역 감사, HARNESS.md 기록, plan 이동.
---

# Close Epoch

1. plan의 검증 섹션 명령을 실제로 실행한다. 미실행을 성공으로 보고하지 않는다.
2. 변경 영역에 해당하는 감사 서브에이전트만 실행한다(전부 돌리지 않는다): boundary/invariant 변경 → `invariant-guard`, 프레임 루프·브리지 → `frame-perf-auditor`, public API → `api-surface-guard`. 확정 위반만 수정 후 해당 검증 재실행, 의심은 보고에 추정으로 남긴다.
3. plan 완료 조건을 실제 결과로 갱신하고 `HARNESS.md`에 라운드를 append한다(변경 boundary, 실행한 검증과 결과, 다음 slice 한 줄).
4. 완료 조건 전부 충족 시에만 plan을 `completed/`로 이동한다. 아니면 active에 남기고 실패를 plan에 기록한다.
