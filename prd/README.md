# gaesup-world PRD

작성일: 2026-09-25
기준: `main` 8a0f3873 + 작업 트리
판: 3판(뿌리 재설계). 이전 판(성능·SE 개선 PRD 00~32, 90)은 git 기록에 있다.

## 1. 목표

웹에서 동작하는 유니티를 만든다. 에디터에서 씬을 만들고, Play로 바로 실행하고, 같은 데이터로 배포한다.

| 영역 | 목표 |
|---|---|
| 엔진 | 저작 원본 하나(`SceneDocument`), 런타임 엔티티 저장소 하나(`EntityWorld`), 시스템 등록 하나(`defineSystem`)를 둔다. 엔진이 캔버스와 React 없이 돈다 |
| 렌더 | WebGPU 우선. 엔티티 데이터에서 공유 batch로 추출해 그린다. React 컴포넌트는 렌더 단위가 아니다 |
| 화질 | 고품질 스타일라이즈드. 유니티 URP급을 기본으로 하고 기기 등급별로 기능을 더한다. 실사와 하드웨어 레이 트레이싱은 비목표다 |
| 에디터 | 모든 엔티티가 Hierarchy/Inspector에 나온다. Play/Stop은 저작 데이터를 건드리지 않는다 |
| 호환 | 1.x 공개 API는 adapter로 유지하고, 제거는 2.0에서만 한다 |

## 2. 원칙

1. **뿌리부터.** [00](00-diagnosis.md)의 뿌리 원인(RC-1~5)을 없애는 작업을 먼저 한다. 증상 패치는 두 경우에만 먼저 한다. 측정을 오염시키는 결함이거나, 사용자에게 바로 보이는 결함일 때다.
2. **검증이 먼저.** 모든 작업 항목은 [01](01-verification.md)의 수용 시나리오로 완료를 판정한다. 시나리오가 없는 항목은 착수하지 않는다.
3. **결정적 지표로 판정한다.** 호출 수, 생성 수, 바이트, draw call, commit 수는 CI에서 판정한다. ms는 기준 기기에서만 판정한다.
4. **기능 보존.** slice마다 기존 테스트, export snapshot, 수용 시나리오가 녹색이어야 한다(AGENTS.md "기능이 망가지면 안 된다").
5. **strangler.** 새 코어 옆에 adapter를 두고 도메인별로 옮긴다. 옛 경로는 옮긴 뒤 지운다. 옮기는 동안은 같은 장면을 옛 경로와 새 경로로 그려 비교한다(S-B12). 옛 경로에는 `@deprecated 대체: <경로>` JSDoc을 붙인다.
6. **한 slice는 한 PR이다.** 커밋 제목 끝에 slice ID를 적는다(예: `perf(render): ... (REN-01a)`).
7. **완료 항목은 지운다.** slice가 끝나면 PRD에서 지우고, 기록은 git log에 남긴다.
8. **보존 자산은 교체하지 않는다.** [00](00-diagnosis.md) 6절의 구현은 확장해서 쓴다.

## 3. 문서

| 문서 | 내용 |
|---|---|
| [00 진단](00-diagnosis.md) | 뿌리 원인 5개, 증상과 원인 대응, 기준선, 남은 정확성 결함, 보존 자산 |
| [01 검증](01-verification.md) | 엔진 카운터, 수용 시나리오(S-H, S-B), 판정 규칙, `pnpm accept`, `/accept` 페이지, CI, 마일스톤 확인 방법 |
| [10 엔진 코어](10-engine-core.md) | kernel, `EntityWorld`, 컴포넌트 레지스트리, `TransformSystem`, `SceneProjector`, `defineSystem`, `runtime.mode`, 물리, headless 호스트, runtime 스코프, 오류, 스크립트 |
| [20 렌더](20-render.md) | RenderWorld와 공용 batch, 가시성, 편집 오버레이, 셰이더 워밍업, 비동기 에셋 표시, 품질 등급, 그림자, 스키닝, 지형, 후처리, TSL, 화질 로드맵 |
| [30 도메인 이전](30-domains.md) | building, 월드 오브젝트, NPC, 캐릭터, 입력, 애니메이션, 카메라, 네트워크, 게임플레이 kit, 내비게이션, minihome |
| [40 에셋·씬·저장](40-assets-scene-save.md) | 로더·캐시, AssetDB, 프리팹, SceneManager, 저장, undo, wasm |
| [50 에디터](50-editor.md) | Hierarchy/Inspector, Play 제어, 패널 구독, 보조 캔버스, 디버그 도구, 라이팅 UI |
| [60 패키지·툴링](60-package-tooling.md) | 엔트리·번들, 2.0 정리, 계층 검사, 코드 건강, CI·jest |
| [90 로드맵](90-roadmap.md) | 마일스톤 M0~M7, 순서와 의존, 결정 기록 |

## 4. 표기

| 표기 | 의미 |
|---|---|
| `RC-n` | 뿌리 원인(00) |
| `D-xx` | 정확성 결함(00). 이전 판 번호를 유지한다 |
| `S-Hxx`, `S-Bxx` | 수용 시나리오(01). H는 headless, B는 browser |
| `VER`, `COR`, `REN`, `DOM`, `AST`, `EDT`, `PKG` + `-nn` | 작업 항목(01, 10, 20, 30, 40, 50, 60) |
| `-nna`, `-nnb` | 항목의 slice. 한 slice는 한 PR |
| `M0`~`M7` | 마일스톤(90) |
| [확인] | 코드 정독으로 확인한 사실 |
| [실측] | 명령을 실행해 얻은 수치 |
| [추정] | 코드 구조로 계산한 비용. 착수 전 측정한다 |

파일 경로는 `src/core/` 기준이다(예: `npc/core/reinforcement.ts`). 다른 위치는 저장소 루트 기준으로 적는다. 줄 번호는 2026-09-25 작업 트리 기준이다.

## 5. 저장소 규칙과의 관계

- 이 PRD는 `AGENTS.md`를 바꾸지 않는다.
- 사용자 확인 후 진행하는 변경: 테스트 기대값 변경, 공개 API 삭제, peer 의존성 변경, 파일 삭제, `test/accept/budgets.json` 예산 증가.
