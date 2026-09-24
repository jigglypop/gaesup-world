# gaesup-world 성능·소프트웨어 공학 개선 PRD

작성일: 2026-09-24
기준: `main` 7eb06f62 + 작업 트리(미커밋 변경 157건 포함)
상태: 초안

## 1. 목적

코드 전체(src 비테스트 1,027파일 110,305줄, examples 88파일 8,257줄, 테스트 399파일)를 6개 영역으로 나눠 정독하고 타입·린트·테스트·패키지 수치를 실행 측정했다. 이 문서 세트는 그 결과를 **성능**과 **소프트웨어 공학** 관점의 개선 과제로 정리한다.

| 분석 영역 | 범위 | 결과 문서 |
|---|---|---|
| 프레임 핫패스 | runtime/frame, simulation, motions, camera, animation, input, interactions, npc, time | 11 |
| 렌더링·GPU | rendering, next, building 렌더/컬링/메시, world, weather, assets, postprocessing | 12 |
| 상태·React | zustand store 43개, editor/building UI, save 경로 | 13 |
| 네트워크·저장·에셋 | networks, save, scene-object, world model, assets, wasm | 14 |
| 빌드·번들·툴링 | vite, dist, package.json, tsconfig, jest, eslint, scripts, CI | 15, 25 |
| 아키텍처·SE | 계층, boilerplate/DI, 중복 경로, 전역 상태, 순환, 테스트 | 20~24 |
| 엔진 모델(웹 유니티, 2차) | 엔티티·컴포넌트·트랜스폼, 스케줄러, 편집/플레이 모드, 스크립팅, 에셋 DB, 프리팹, 씬 관리 | 30~32 |

2차 분석(2026-09-24)은 같은 작업 트리에서 검증 명령을 다시 실행하고, 1차 PRD 항목의 현재 상태를 확인하고, 1차에 없던 발견을 추가했다. 추가 발견은 기존 PRD의 "2차 분석 추가" 절과 새 PRD 30~32에 있다.

## 2. 원칙

1. **측정 먼저.** 성능 PRD의 완료는 [10](10-perf-budget.md)의 예산과 기준 장면으로만 판정한다. 문서의 ms·draw call 수치는 `[추정]`이며 착수 전 실측으로 바꾼다.
2. **정확성 결함이 성능보다 먼저.** [00](00-baseline.md) 4절의 결함(D-xx)은 해당 PRD의 첫 slice로 처리한다.
3. **보존 자산은 교체하지 않고 연결한다.** `FrameScheduler`, `useSharedFrame`, `BuildingRenderSnapshot` typed array, `SpatialGrid`, `GLTFAssetCache`, `SaveSystem`, `SceneDocument`, `server-contracts` 격리, quality ratchet은 유지한다. 측정 근거 없이 객체 중심 구조로 바꾸지 않는다(이전 AGENTS.md 규칙을 이 PRD 원칙으로 유지).
4. **strangler.** 공개 API 제거는 `@deprecated` → 대체 경로 → major 제거 순서로 한다.
5. **slice 단위 병합.** 각 slice는 독립 병합 가능하고 자체 검증 명령을 가진다.

## 3. 문서 목록

| 번호 | 문서 | 분류 | 우선순위 | 트랙 | 요약 |
|---|---|---|---|---|---|
| 00 | [현황 진단과 기준선](00-baseline.md) | 공통 | P0 | Fast | 실측 수치, 정확성 결함 목록, 구조 지표, 보존 자산 |
| 10 | [성능 예산과 측정 체계](10-perf-budget.md) | 성능 | P0 | Fast | 예산 정의, seeded 기준 장면, CI 회귀 게이트 |
| 11 | [프레임 루프와 시뮬레이션](11-frame-loop.md) | 성능 | P0 | Fast → Epoch | 카메라 충돌, 60Hz store 갱신, 물리 시계 통합, 숨은 useFrame |
| 12 | [렌더링과 GPU](12-rendering-gpu.md) | 성능 | P0 | Epoch | 컬링과 React/collider 분리, draw call, 재질 공유, DPR·품질 프로파일 |
| 13 | [상태 관리와 React 렌더링](13-state-react.md) | 성능 | P0 | Epoch | buildingStore 인덱스 분리, 에디터·NPC 과구독, 입력 broadcast |
| 14 | [네트워크·저장·에셋 로딩](14-network-save-assets.md) | 성능 | P1 | Fast | wire 포맷, 원격 아바타 격리, 저장 복제 체인, 로더 통일 |
| 15 | [번들과 패키지](15-bundle-package.md) | 성능 | P1 | Epoch | 루트 barrel, 청크 공동배치, sideEffects, CJS, 의존성 배치 |
| 20 | [계층 경계와 의존 구조](20-layer-boundaries.md) | SE | P1 | Fast | Layer1 누수, 도메인 SCC, lint 패턴, 검사 스크립트 연결 |
| 21 | [단일 원본과 중복 경로](21-single-source.md) | SE | P1 | Epoch | world model, 저장, 네트워크 프로토콜, 건설 UI, 애니메이션 |
| 22 | [런타임 스코프와 전역 상태](22-runtime-scope.md) | SE | P1 | Epoch | module-level store, legacy fallback, 서비스 키, import 부수효과 |
| 23 | [boilerplate 정리와 오류 처리](23-boilerplate-errors.md) | SE | P0 | Fast | `@HandleError` 예외 은폐, 동작하지 않는 DI, decorator 정리 |
| 24 | [모듈 구조와 죽은 코드](24-module-structure.md) | SE | P2 | Fast | 대형 파일 분리, plugin 복제, 미사용 코드, 코드 냄새 |
| 25 | [검증 파이프라인과 툴링](25-verification-tooling.md) | SE | P0 | Fast | 깨진 verify, CI 구조, jest 비용, 컴파일러 이중화, scripts |
| 30 | [엔티티·컴포넌트·트랜스폼](30-entity-component.md) | 엔진 | P1 | Epoch | 엔티티 개념 8개 통합(`EntityWorld`), 컴포넌트 타입 registry, `TransformSystem`, 표준 컴포넌트 시스템 |
| 31 | [시스템·편집/플레이 모드·스크립팅](31-systems-modes-scripting.md) | 엔진 | P1 | Epoch | 스케줄러 4종 → `defineSystem` 2 lane, `runtime.mode`, play copy, 스크립트 고정 틱 |
| 32 | [에셋 DB·프리팹·씬 관리](32-assets-prefab-scene.md) | 엔진 | P1(32-a P0) | Fast → Epoch | UUID ID(D-22), GUID AssetDB, prefab revision·live variant, `SceneManager` 통합 |
| 90 | [로드맵](90-roadmap.md) | - | - | - | 단계, 의존성, 마일스톤 |

## 4. 공통 형식

모든 PRD는 다음 순서를 따른다.

1. 메타 표(우선순위, 트랙, 선행 PRD, 담당 agent)
2. 배경과 문제
3. 목표 / 비목표
4. 현재 상태(발견 항목, 파일 근거)
5. 요구사항(FR 기능, NFR 비기능)
6. 설계
7. 단계별 작업(slice)
8. 공개 API 영향
9. 검증과 완료 기준
10. 리스크와 대응
11. 열린 질문(사용자 결정 필요)

## 5. 표기 규칙

| 표기 | 의미 |
|---|---|
| `D-xx` | 정확성 결함. [00](00-baseline.md) 4절에서 관리 |
| `<PRD>-Fnn` | 해당 PRD의 발견 항목(예: `11-F01`) |
| `FR-<PRD>-nn`, `NFR-<PRD>-nn` | 기능·비기능 요구사항 |
| `<PRD>-a`, `<PRD>-b` | slice |
| `[실측]` | 명령을 실행해 얻은 수치 |
| `[확인]` | 코드 정독으로 확인한 사실 |
| `[추정]` | 코드 구조로 계산한 비용. 착수 전 측정 필요 |
| `[미검증]` | 가능성만 확인. 재현 또는 측정 필요 |

## 6. 저장소 규칙과의 관계

- 이 PRD는 `AGENTS.md` 규칙을 바꾸지 않는다. 규칙 변경이 필요한 항목은 각 PRD의 열린 질문에 적는다.
- 작업 트리의 `AGENTS.md`는 `.codex/*` 참조와 계층·plan 규칙을 뺀 짧은 규칙(속도·안정성·간결성, DRY/KISS/모듈화, WebGPU 속도 우선)으로 바뀌었다(2026-09-24 2차 확인). 각 PRD가 "AGENTS.md"로 인용한 계층·canonical·측정 규칙은 이 PRD 세트의 원칙으로 유지한다.
- 테스트 기대 수치 변경, 공개 API 삭제, peer 의존성 변경, 파일 삭제는 사용자 확인 후 진행한다.
- 파일 경로와 줄 번호는 2026-09-24 작업 트리 기준이다. 이후 변경으로 달라질 수 있다.
