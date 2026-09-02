# 인계

다른 에이전트나 세션이 상태를 다시 파악하지 않고 이어받을 수 있도록 세션을 체크포인트한다. `.codex/plans/active/`의 active plan에 다음을 갱신한다: 변경한 것(파일과 boundary), 이 작업 이후의 현재/목표 source of truth, 실행한 검증과 결과, 실행하지 않은 검증, 미해결 질문, 다음으로 가장 작은 slice. `HARNESS.md`에 라운드 섹션을 append한다(기존 섹션 수정 금지). 인계 중에는 plan을 `completed/`로 이동하지 않는다.
