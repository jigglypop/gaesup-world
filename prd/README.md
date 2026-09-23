# gaesup-world 엔진화 PRD

작성일: 2026-09-23
대상 버전: 2.0 (semver major)
상태: 초안

## 1. 한 문장 목표

gaesup-world를 "기능이 많은 R3F 라이브러리"에서 **웹 브라우저에서 월드를 만들고, 스크립트로 동작을 붙이고, 바로 배포할 수 있는 Unity식 웹 3D 게임 엔진**으로 만든다. 포지셔닝은 범용 엔진이 아니라 **생활형·월드 빌딩 게임에 특화된 수직형 엔진**이다.

## 2. 핵심 원칙

1. **통합이 기능 추가보다 먼저다.** 같은 일을 하는 경로가 둘 이상이면 새 기능을 올리기 전에 하나로 만든다.
2. **SceneDocument가 유일한 월드 원본이다.** 모든 편집 대상은 SceneObject와 Component로 표현되고, 나머지는 파생 인덱스나 렌더 투영이다.
3. **프레임 순서는 명시한다.** 입력, 스크립트, 물리, 애니메이션, 카메라, 렌더의 단계가 코드로 선언된다.
4. **엔진 코어와 장르 킷을 분리한다.** 생활형 게임 기능(inventory, quests, farming 등)과 네트워크는 선택 가능한 킷이다.
5. **실측으로만 완료를 선언한다.** 테스트, 타입, 프레임 할당, 브라우저 실행 결과 없이 "될 것"이라고 쓰지 않는다.

## 3. 문서 목록

| 번호 | 문서 | 우선순위 | 트랙 | 요약 |
|---|---|---|---|---|
| 00 | [현황 진단과 기준선](00-baseline.md) | P0 | Fast | 코드 분석 결과, 확인된 버그, 실측 기준선 절차 |
| 01 | [비전과 2026 기술 동향](01-vision-trends.md) | - | - | Unity 대비 격차, 기술 트렌드와 채택 결정 |
| 10 | [월드 데이터 모델 통합](10-world-model.md) | P0 | Epoch | SceneDocument 단일 원본, building/world 통합 |
| 11 | [프레임 파이프라인](11-frame-pipeline.md) | P0 | Epoch | 단계 선언, raw useFrame 제거, R3F v10 대비 |
| 12 | [스크립트 컴포넌트](12-script-component.md) | P0 | Epoch | MonoBehaviour에 해당하는 사용자 동작 API |
| 13 | [커널과 브리지](13-kernel-bridge.md) | P1 | Epoch | 등록 경로 단일화, 스냅샷 할당 제거 |
| 14 | [캐릭터와 물리](14-character-physics.md) | P1 | Fast → Epoch | 버그 수정, 물리 어댑터, collision layer |
| 15 | [카메라](15-camera.md) | P1 | Fast | 충돌 캐시 버그, Scene/Game 카메라 분리 |
| 16 | [애니메이션](16-animation.md) | P1 | Epoch | Animator 상태 머신, 결정 주체 단일화 |
| 17 | [입력](17-input.md) | P1 | Fast | 액션 맵, 게임패드·터치, 리바인딩, 리플레이 |
| 18 | [에디터](18-editor.md) | P1 | Epoch | building 편집 command화, UI 통합, prefab override |
| 19 | [렌더링과 WebGPU](19-rendering-webgpu.md) | P1 | Epoch | 메인 World WebGPU 전환, TSL 후처리 |
| 20 | [에셋 파이프라인](20-asset-pipeline.md) | P1 | Epoch | 메타데이터, import 검증, 압축, 의존성 |
| 21 | [저장](21-save.md) | P1 | Fast | 경로 단일화, visit 격리 |
| 22 | [네트워크](22-network.md) | P2 | Epoch | 전송 어댑터, 권한 서버, 입력 경계 |
| 23 | [게임플레이 킷](23-gameplay-kits.md) | P2 | Epoch | 스토어 결합 해제, cozy kit 분리 |
| 24 | [공개 API와 패키징](24-public-api-packaging.md) | P1 | Epoch | 명시적 export, 서브패스 격리, 2.0 |
| 25 | [빌드와 배포](25-build-publish.md) | P2 | Epoch | 에디터 결과물을 웹 게임으로 내보내기 |
| 26 | [품질과 검증](26-quality.md) | P0 | Fast | 경계 린트, E2E, ratchet 규칙 |
| 90 | [로드맵](90-roadmap.md) | - | - | 단계, 의존성, 마일스톤 |

## 4. 각 PRD의 공통 형식

모든 PRD는 다음 순서를 따른다.

1. 메타 표 (우선순위, 트랙, 선행 PRD, 관련 active plan)
2. 배경과 문제
3. 목표 / 비목표
4. 현재 상태 (파일 근거)
5. 요구사항 (FR: 기능, NFR: 비기능)
6. 설계
7. 단계별 작업 (slice 단위, 각 slice는 독립 병합 가능)
8. 공개 API 영향
9. 검증과 완료 기준
10. 리스크와 대응
11. 열린 질문 (사용자 결정이 필요한 항목)

## 5. 저장소 규칙과의 관계

- 이 PRD는 `AGENTS.md`, `CLAUDE.md`의 규칙을 바꾸지 않는다. 규칙 변경이 필요한 항목은 각 PRD의 "열린 질문"에 적는다.
- Epoch 트랙 PRD를 착수할 때는 `/start-epoch`로 `.codex/plans/active/`에 plan을 만들고, 이 PRD를 plan의 입력으로 링크한다. 완료 시 `/close-epoch`와 `HARNESS.md` 기록을 따른다.
- 테스트 기대 수치 변경, 공개 API 삭제, peer 의존성 변경은 사용자 확인 후 진행한다.
- 파일 경로 근거는 2026-09-23 기준 `master`(348f9b35)에서 확인한 것이다. 줄 번호는 이후 변경으로 달라질 수 있다.
