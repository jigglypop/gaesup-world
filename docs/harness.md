# Astra/Sol 하네스 운영 참고

`AGENTS.md`는 에이전트가 상시 읽는 실행 규칙이고, 이 문서는 적용 범위와 측정 방법을 설명하는 운영 참고다. 새 세션부터 프로젝트의 `.codex/config.toml`이 적용되며 UI나 CLI에서 명시한 override가 우선한다. 현재 세션에는 소급 적용되지 않는다.

설정은 루트 Astra와 기본 하위 Sol, 동시 실행 2개를 지정한다. `max_depth=1`은 런타임에서도 하위 에이전트의 재위임을 막는다. 도구 호출에서는 `fork_turns: "none"`과 모델·추론 강도를 명시해야 하며, 설정만으로 개별 호출 인자를 강제할 수는 없다. 운영 규칙은 동시 최대 2명, 하위 재위임 금지, 같은 범위는 기존 에이전트 재사용을 요구한다. 동일 실패는 근거 있는 재시도 1회 뒤 Astra 판단으로 전환한다.

검증 명령은 `powershell -NoProfile -File scripts/check-harness.ps1`이다. 2026-09-12에 strict `config/read`로 프로젝트 설정 로드를 확인했고, 현 세션에서 명시적 Sol·low·none fork 작업도 성공했다. 비용 A/B 비교는 아직 측정하지 않았다.

문자 수 감소는 토큰 또는 비용 절감률이 아니다. 결과는 `docs/harness-metrics.csv`에 기록한다. 동일한 시작 상태와 같은 모델·추론·도구 조건으로 하네스 효과를 먼저 비교하고, 모델 분배 변경 효과는 별도로 표시한다. 대표적인 소규모 수정, 버그 수정, 복수 파일 과제를 실행한다. 세션 로그의 누적 `token_count`는 스레드별 마지막 총계만 쓰고 이벤트별 누적값을 합하지 않는다. 부모 집계가 자식을 포함하면 자식을 다시 더하지 않는다. 출력 토큰 정의에 추론이 포함되면 추론 토큰을 또 더하지 않고, cached 입력은 입력 토큰의 부분집합으로 취급하되 계정 로그 정의를 우선한다. `wall_seconds`는 과제 전체 시작부터 완료까지이며 병렬 스레드 시간을 더하지 않는다. 완료 품질과 재작업 횟수는 과제 단위로 기록한다. 누락은 미측정으로 표시하고 실패 과제는 절감 성공으로 계산하지 않는다.

근거: [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Latest model](https://developers.openai.com/api/docs/guides/latest-model)
