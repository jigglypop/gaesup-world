# Codex Model Harness

이 문서는 모델 라우팅을 변경하거나 Astra 승격을 준비할 때만 읽는다. 일반 작업의 자동 context가 아니다.

## 목표와 source of truth

- root는 `gpt-5.6-sol/low`, 기본 subagent는 `gpt-5.6-luna/low`다.
- `.codex/hooks/astra-guard.mjs`의 `ROLE_POLICY`가 역할별 model, effort, context fork 상한의 canonical policy다.
- `.codex/config.toml`과 `.codex/agents/*.toml`은 실행 projection이며 `pnpm test:harness`가 드리프트를 차단한다.
- subagent는 self-contained task를 받고 `fork_turns="all"`을 사용하지 않는다.
- 동시 subagent는 최대 2개이며 서로 독립인 작업에만 사용한다.

## 라우팅

| 작업 | 역할 | 모델/effort | fork 상한 |
| --- | --- | --- | --- |
| 단순 보조 | `default` | Luna/low | 1 |
| 탐색과 위치 확인 | `explorer` | Luna/low | 1 |
| 작은 구현 | `worker` | Sol/low | 2 |
| 일반 architecture | `architect` | Sol/medium | 2 |
| runtime/physics/rendering | `runtime` | Sol/medium | 2 |
| asset/network/save/social | `platform` | Sol/medium | 2 |
| 완료 slice 검토 | `reviewer` | Terra/medium | 2 |
| 기계적 API 검사 | `api_surface_guard` | Luna/low | 1 |
| 성능·invariant 검사 | 해당 auditor | Terra/medium | 1 |
| 레이어 검사 | `layer_auditor` | Terra/low | 1 |
| 미해결 최종 설계 판정 | `astra_architect` | Astra/low | 0 (`none`) |

역할의 model 또는 effort를 spawn 인자로 바꾸지 않는다. 훅은 override, 미등록 역할, 누락되거나 과도한 `fork_turns`, 6,000자를 넘는 task message를 실행 전에 거부한다. root만 일반 agent를 만들 수 있고, 유일한 nested route는 `architect → astra_architect`다.

## Astra 승격 계약

Astra는 탐색, 구현, 수정, 테스트, 문서 검색, 일반 리뷰, 하위 agent 생성에 사용하지 않는다. 먼저 `architect`가 저장소 근거를 수집하고 판단한다. 다음 조건을 모두 만족할 때만 `astra_architect`를 한 번 호출한다.

1. 결정이 최소 3개 architecture domain 또는 장기 source of truth에 걸친다.
2. Sol architect가 근거를 확인한 뒤에도 양립 불가능한 선택지가 남는다.
3. 결과는 구현이 아닌 하나의 decision이다.
4. `fork_turns="none"`이며 message는 2,500자 이하의 evidence packet이다.

message는 아래 형식을 그대로 사용한다.

```text
[astra:architecture]
domains: world-model, runtime, persistence
current_boundary: ...
current_source_of_truth: ...
options: ...
evidence: ...
compatibility: ...
irreversible_impact: ...
decision_question: ...
```

`astra_architect`는 이 packet만 읽고 tool을 사용하지 않는다. `PreToolUse`는 최상위 caller `agent_type`도 검사하므로 configured Sol `architect`가 아닌 root·worker·reviewer 등의 Astra 호출은 같은 packet을 사용해도 차단된다. Astra가 활성 모델인 모든 local tool call도 차단된다.

## 차단 경계

- `SessionStart`, `UserPromptSubmit`: root Astra 실행을 중단한다. guard bootstrap 자체가 실패해도 이벤트별 block JSON으로 중단한다.
- `PreToolUse`: 모든 local tool을 관찰하며 Astra tool call과 잘못된 agent route를 deny한다.
- `SubagentStart`는 시작을 막지 못하므로 enforcement에 사용하지 않는다.
- allow 경로의 hook stdout은 비워 model context를 늘리지 않는다.

Project hook은 저장소가 trusted일 때만 실행되며 사용자가 hooks를 끄거나 우회할 수 있다. 조직 차원의 비활성화 불가능한 강제는 admin-managed `requirements.toml`에 같은 hook을 배포하고 `allow_managed_hooks_only = true`를 적용해야 한다.

## 검증

```bash
corepack pnpm test:harness
corepack pnpm exec eslint .codex/hooks/astra-guard.mjs
codex doctor --summary --no-color --ascii
codex debug prompt-input "harness config smoke"
```

두 Codex 명령은 로컬 Codex가 설치된 환경에서만 실행하며 API 요청을 만들지 않는다. `doctor`의 전체 종료 코드는 터미널 등 다른 환경 진단 때문에 실패할 수 있으므로 `Configuration [ok] config loaded`를 확인한다.
