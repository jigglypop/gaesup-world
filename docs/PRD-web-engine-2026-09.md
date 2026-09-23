# gaesup-world 미니홈피·성능·웹 엔진 확장 PRD

- 작성일·기술 조사 기준일: 2026-09-21
- 상태: 구현 착수를 위한 상세 초안. 목표 수치는 제안값이며 성능 달성 보고가 아니다.
- 대상: `examples/`, 공개 npm 패키지, `src/core`, `src/next`, 배포 파이프라인, Unity 연동 및 웹 제작 도구
- 코드 확인 기준: HEAD `ccd2767413edbf29744b64abe6d068b28967cd74`, 로컬 package version `1.0.31`, 작업 트리 수정·미추적 파일 존재
- 최초 산출물은 PRD였으며, 이후 사용자의 전체 실행 지시에 따라 구현 진행 중이다. 실제 완료·검증 상태는 [실행 기록](prd-execution-2026-09.md)에서 추적한다. 아래 초기 퍼센트는 착수 전 추정값이다.
- 하위 기술 명세: [Runtime·렌더링 개선 PRD](PRD-runtime-performance.md). 기존 R01–R31과 S0–S8을 유지하며 이 문서에서 재번호를 부여하지 않는다.

## 0. 중요도·현재 구현도 요약

2026-09-21 기준 계획용 평가다. 중요도는 이번 다섯 요청 사이의 우선순위 가중치이며 합계 100%다. 구현도는 각 요청의 목표 범위를 분모로 한 코드·산출물 기반 추정값으로, 테스트 통과율이나 배포 완료율이 아니다. 전수 인벤토리가 아직 확정되지 않아 구현도는 약 ±10%p 오차를 가진다.

추정 기준: 0%=실행 가능한 구현 없음, 25%=기반/일부 모듈 존재, 50%=대표 경로 연결·주요 공백 존재, 75%=대부분 연결·통합 잔여, 100%=정의된 구현 산출물 전부 존재. 검증·배포 상태는 별도로 판정한다. 분석·범위 산정 요청에는 코드 대신 조사·명세 산출물의 완성도를 적용한다.

| 순위 | 요청 | 중요도 | 현재 구현도·산출물 완성도 | 판단 근거와 주요 잔여 |
| --- | --- | --- | --- | --- |
| 1 | 코어 성능 병목 전수 분석 | 30% | 약 40% | R01–R31과 실험실 존재. 전체 모듈 인벤토리·실기기·비용 순위·미검증 경로 조사 필요 |
| 2 | 미니홈피에 현재 기능 노출 | 25% | 약 50% | 방·프로필·기록·편집·저장·공유·진단 경로 존재. 실제 asset/avatar·audio/NPC·온라인 연결과 기능 전수 대응 필요 |
| 3 | DRY/KISS 기반 성능 최적화 | 20% | 약 30% | 일부 정확성·월드 소유권·clock 개선 진행. core/next 계약·나머지 hot path·동일 조건 A/B 필요 |
| 4 | 웹 제작 엔진 구현 범위 산정 | 15% | 약 90% | 이 PRD에 E1–E3·격차·의존성·공수 초안 작성. 전수 조사 후 범위·추정 재확정 필요 |
| 5 | npm 발행 후 자동배포 | 10% | 약 30% | 발행·빌드·gh-pages·version 스크립트 존재. 자동 workflow·권한·registry→live 연결 검증 필요 |

가중 진행 추정치는 약 **47%**다: `30%×40% + 25%×50% + 20%×30% + 15%×90% + 10%×30% = 47%`. 이는 서로 다른 작업의 계획상 진척을 요약한 값이며, 제품의 완성도·검증률·릴리스 가능성을 뜻하지 않는다. 공수 가중 진척률로도 사용하지 않는다.

**웹 엔진 범위 산정 90%는 웹 엔진 구현 90%라는 의미가 아니다.** 범용 제작 엔진 E1–E3 전체의 구현도는 기반 모듈과 도구가 있는 약 20–30% 수준으로 추정하며, 장기 기능의 분모가 확정되기 전에는 하나의 확정 수치로 집계하지 않는다.

검증 상태: 하위 PRD에는 R 항목 전체 조건 검증 0/31로 기록되어 있다. 일부 구현·시나리오 통과와 전 항목 인수 완료는 다르다. 이번 평가에서는 브라우저·Unity·npm·라이브 배포를 새로 검증하지 않았다.

실행 순서: **기존 변경·baseline 확정 → 미니홈피 핵심 경로와 코어 조사 → 측정된 병목 최적화 → 통합 검증 → npm·자동배포**. 엔진 범위 산정은 조사 결과를 반영해 병행 갱신한다. 배포의 중요도 10%는 생략 가능하다는 뜻이 아니라, 앞선 작업의 결과를 전달하는 필수 최종 관문이라는 뜻이다.

## 1. 제품 목표와 완료 정의

미니홈피를 실제 라이브러리 기능을 체험하는 대표 제품으로 만들고, 그 사용 경로에서 발견되는 코어 병목을 계측·개선한다. 검증된 공개 패키지와 같은 릴리스의 예제를 자동 배포한다. 이를 기반으로 브라우저에서 장면을 만들고, 실행하고, 저장하고, 배포할 수 있는 범용 웹 3D 제작 엔진으로 확장한다.

| 사용자 요청 | 산출물 | 완료 기준 |
| --- | --- | --- |
| 현재 기능이 많이 드러나는 미니홈피 | 기능 목록, 실제 조작 경로, 대표 장면, 모바일 UI | 공개 기능 전수 분류, 미니홈피에 적합한 기능의 실제 런타임 연결, 사용자 시나리오 검증 |
| 코어 병목 전부 분석 | 모듈별 감사표, trace, 비용 순위, 재현 장면 | 감사 대상 모듈 누락 0, 모든 후보에 측정 또는 미측정 사유, 확정 병목에 재현 자료 |
| DRY/KISS 성능 최적화 | 작은 단위 변경, 공통 계약, 전후 비교 | 기능·저장·공개 API 회귀 없이 측정상 개선 또는 복잡도 감소 입증 |
| npm push 후 자동배포 | main 기반 release workflow와 운영 기록 | npm fresh install, 동일 버전 예제, 라이브 URL·version.json·핵심 동작 확인 |
| Unity 같은 웹 유틸 엔진 범위 | 역량별 격차, 단계·의존성·공수 | 브라우저 제작→실행→저장→배포 흐름의 필수 기능과 장기 범위를 구체화 |

“병목 전부”는 모든 환경에서 병목이 사라짐을 뜻하지 않는다. 저장소 전체 실행 경로를 조사하고, 지정한 장치·부하에서 비용을 검증하며, 미검증 경계를 빠짐없이 기록하는 것을 뜻한다.

## 2. 현재 상태와 근거 수준

아래는 코드·문서 확인 결과다. 이번 작성에서 브라우저 실행이나 성능 재측정을 수행하지 않았다. 기존 성능 문서의 성공 건수는 현재 릴리스의 검증 수치로 재사용하지 않는다.

| 영역 | 확인한 현재 상태 | 이번 계획에서 해결할 점 |
| --- | --- | --- |
| 진입 화면 | `examples/main.tsx`가 미니홈피, `/engine`, `/performance`를 lazy load | 제품 경로와 개발자 진단 연결, 기능별 노출 추적 |
| 미니홈피 | `Minihome.tsx`, `Miniroom.tsx`, model/session/sharing/room 계층 존재. 프로필·일기·방명록 데이터, 6종 가구, 3종 테마 | 연결된 기능과 검사 전용 API 구분, 실제 에셋·아바타·모바일·온라인 경로 확대 |
| 진단 | `RoomDiagnostics.tsx`, `apiChecks.ts`, performance 시나리오·baseline 존재 | 격리 fixture API 성공과 열린 미니룸에서의 기능 성공을 구분 |
| 코어 개선 | 하위 PRD에 R01–R31, 월드 소유권·clock·저장·GPU 등 진행 기록 | 작업 중 변경을 먼저 통합 검증하고 남은 항목을 연결 |
| 공개 패키지 | runtime/editor/assets/avatar 등 서브패스, ESM/CJS/types, consumer 검사 스크립트 | 지원 peer 조합별 설치·실행 보증, 실제 배포 tarball 검증 |
| 발행 설정 | `.releaserc.json`의 main 기반 semantic-release. `publish:full`도 존재 | 발행 주체를 하나로 정하고 재실행·버전 중복 방지 |
| 데모 배포 | gh-pages 스크립트, `scripts/build-demo.mjs`의 route 복사·version.json | 로컬 조사에서 `.github` workflow 파일을 찾지 못함. 원격 설정·실제 호스팅 확인 후 자동화 |
| Unity 교환 | `docs/unity.md`, 장면 JSON·GLB 경로 존재 | 문서상 Unity Editor 컴파일·실제 왕복 미검증. 임의의 Unity 프로젝트 호환과 구분 |

작업 시작 시 dirty diff·untracked 파일을 포함한 source manifest와 hash를 저장한다. 기존 변경을 덮어쓰지 않으며, 위 HEAD만으로 baseline을 재현할 수 있다고 표시하지 않는다.

## 3. 사용자와 대표 사용자 여정

1. 방문자: 링크를 열고 방을 둘러본다. 렌더 준비 상태를 확인하고 모바일 터치로 이동·선택한다.
2. 방 주인: 프로필을 바꾸고 가구를 놓고, 색·위치를 편집하고, 저장 후 다시 열어 같은 상태를 확인한다.
3. 창작자: 모델·아바타·조명·소리를 적용하고 상호작용을 연결한다. 편집과 플레이를 왕복하며 작업 내용을 보존한다.
4. 라이브러리 사용자: 미니홈피에서 기능을 체험한 뒤 공개 API·예제 코드·성능 시나리오를 확인하고 새 프로젝트에 설치한다.
5. 운영자: 한 릴리스의 패키지·사이트·검증 결과를 추적하고 실패한 배포를 복구한다.

## 4. 미니홈피 기능 요구사항

### 4.1 기능 전수 목록과 노출 정책 — MH-01

package exports, `src/core/index.ts`, 서브패스, `/engine`을 조사하여 기능 레지스트리를 작성한다. 항목 필드: ID, 공개 API, 소유 모듈, 현재 구현 수준, 미니홈피 사용 위치, 사용자 동작, 상태 저장, 오류 처리, 검증 시나리오, 미노출 사유, 후속 단계.

노출 수준은 `제품에서 사용`, `고급 도구에서 사용`, `진단 전용`, `통합 대기`로 구분한다. 공개 API 개수를 기능 개수로 세지 않는다. 화면 버튼이나 fixture 검사만 존재하면 제품 연결 완료로 세지 않는다. 미니홈피에 직접 어울리지 않는 월드·지형·대규모 네트워크 기능은 연결된 `/engine` 실습 장면에 배치하고 접근 링크를 제공한다.

목표: 공개 기능군 목록화 100%, 미니홈피 적합 기능의 실제 노출 90% 이상. 분모와 제외 사유는 목록에서 검토하며 임의로 줄이지 않는다. 기존 사용자 기능은 보존한다.

### 4.2 기능별 요구사항과 인수 조건

| ID | 기능·사용자 동작 | 라이브러리 연결 방향 | 인수 조건 |
| --- | --- | --- | --- |
| MH-02 | 프로필·테마·일기·방명록 편집 | 기존 model/session 유지, 저장 계약 정리 | 새로고침·백업 복원 후 동일 값, 공유 방 열기와 내 방 덮어쓰기 구분 |
| MH-03 | 가구 생성·선택·이동·회전·복제·삭제 | SceneDocument command, transform, picking | 안정 ID 유지, 취소·undo/redo 후 문서와 화면 일치, 오래된 revision 처리 |
| MH-04 | 바닥·벽·스냅·배치 가능 영역 | building, 공간 질의, collider | 겹침·경계 정책이 화면과 판정에서 일치, 편집 중 내비 갱신 |
| MH-05 | 실제 GLB 가구·재질·색 변경 | 공통 asset cache·material 계약 | 기본 에셋 준비, 실패 시 복구 UI, 반복 교체 후 리소스 누수 없음 |
| MH-06 | 실제 아바타 이동·외형·애니메이션 | avatar/motion/input/camera | idle·walk 전환, 물리·카메라 충돌, 마우스·키보드·터치. 장착 규약 검증 |
| MH-07 | 조명·시간·날씨·품질 설정 | time/weather/rendering | 방에 즉시 반영, 저장 복원, 품질 전환 후 선택·그림자 유지 |
| MH-08 | 가구 상호작용·간단 NPC | gameplay/events/navigation | 앉기·조명 토글 등 실제 행동, 도달 실패 처리, 종료 후 중복 구독 없음 |
| MH-09 | BGM·효과음·볼륨 | audio runtime | 사용자 입력 후 재생, stop·방 전환·복원 경쟁에서 이전 음원 재생 없음 |
| MH-10 | 저장 슬롯·내보내기·가져오기 | save, schema migration, scene serialization | 실패 시 부분 적용 없음, 저장 중 변경의 revision 보존, 용량 초과 설명 |
| MH-11 | 공유 링크·방문 | 기존 sharing/session→온라인 저장 어댑터 | 로컬 공유와 서버 동기화 표시 구분, 방문자 편집 권한·소유권 검사 |
| MH-12 | 실시간 방문·방명록 영속화 | network adapter·인증·서버 저장 | 두 독립 세션 실연동, 중복 명령 방지, 재접속 복구. 서버 의존성 명시 |
| MH-13 | GLB·Unity JSON 교환 | 기존 scene-object Unity bridge | 형식별 버튼·설명, 계층·ID·transform 왕복, 실제 Unity Editor 검증 |
| MH-14 | 기능 확인·성능 실험 진입 | RoomDiagnostics와 `/performance` | 기능에서 관련 시나리오로 이동, 사용 중 방을 검사 fixture가 변경하지 않음 |

### 4.3 UI와 초기 로드

- 데스크톱: 방을 중심에 두고 프로필·기록과 편집 도구를 배치한다. 모바일: 방 우선, 편집 도구는 하단 시트로 제공한다.
- 주요 조작은 44 CSS px 이상의 터치 영역을 목표로 한다. 키보드 포커스·레이블·삭제 취소 경로를 제공한다.
- 사용자 화면에는 “가구 추가”, “저장”, “방문”처럼 동작을 표시한다. API 이름·성능 수치는 진단 패널에 둔다.
- 로딩은 renderer, 필수 asset, save restore, network 상태로 구성한다. 관측할 수 없는 진행률을 만들지 않는다.
- 오류 UI는 실패한 단계와 재시도 동작을 제공한다. 백업 손상·에셋 실패 때문에 빈 화면이 되지 않는다.
- idle demand rendering은 애니메이션·물리·오디오·네트워크가 요구하는 실행을 중단하지 않는 조건에서 적용한다.

## 5. 코어 병목 전수 분석 — PERF-01

### 5.1 조사 범위

`src/core`, `src/next`, 공개 entry 및 examples 연결 경로의 모든 실행 모듈을 목록화한다. 각 항목에 호출 빈도, 입력 규모, 시간·공간 복잡도, 할당, 소유권, 의존성, trace 링크, 판정과 담당 단계를 기록한다. 순수 타입·정적 정의는 비실행으로 분류하되 목록에서 누락하지 않는다.

| 영역 | 조사할 비용·오류 | 측정·검증 | 기존 연결 |
| --- | --- | --- | --- |
| React·Zustand | frame별 setState, broad subscription, unstable snapshot | commit 수·시간, 변경당 알림, 무변경 idle | R01, R25 |
| clock·runtime | 중복 RAF, catch-up 폭주, 월드 간 공유 상태 | tick 수·단계별 CPU·두 월드 격리·pause/resume | R25–R29 |
| physics·camera·picking | 반복 질의, 잘못된 broad phase, 임시 객체 | query 수·CPU, collision/nearest 정확성 | R03–R05 |
| NPC·navigation | 전량 재탐색, 장애물 전체 rebuild | 규모별 p95, dirty 범위, 경로 동등성 | R19 및 관련 R 항목 |
| scene·editor·terrain | 전체 복제·검증, 청크 전체 재생성 | command·undo·mesh rebuild 비용 | R18, R20 |
| renderer·GPU | draw/dispatch, buffer upload, readback 대기, pipeline 생성 | CPU/GPU 분리, pass별 비용, 업로드 bytes | R06, R09–R17, R27–R28 |
| assets·avatar | 중복 load/decode, clone/skeleton, texture | cache hit, cold/warm 시간, texture 추정 크기·수명 | R10, R21–R23 |
| save·audio·plugin | serialize, IDB, 복원 재진입, 미해제 서비스 | 단계별 latency, 실패 주입, 50회 수명 반복 | R02, R07, R24–R25 |
| multiplayer | queue 증폭, snapshot 전체 복제, 잘못된 tick | bytes/s, queue 길이, 보정량, 손실·지연·재접속 | R26, R30–R31 |
| package·worker·WASM | root import 부작용, 불필요 번들, 복사·초기화 | fresh consumer bytes, parse/compile, 메시지 복사 시간 | R29 및 추가 감사 |

코드에서 비효율이 의심되는 상태는 “후보”, 반복 trace에서 유의미한 비용을 확인하면 “확정 병목”, 변경 후 같은 조건에서 개선을 확인하면 “개선 검증”으로 기록한다. 기존 R 항목 외에 발견한 문제는 PERF 추가 ID를 발급하고 하위 PRD에 연결한다.

### 5.2 2026년 9월 기술 적용 판단

기준일에 확인한 공식 문서를 사용한다. 최신 문서는 갱신되므로 적용 시 라이브러리·브라우저 정확한 버전과 feature detection 결과를 실행 기록에 고정한다. 모든 최신 기술이 성능을 개선한다고 가정하지 않는다.

| 기술 | 적용 방침 | 도입 조건 |
| --- | --- | --- |
| WebGPU·TSL | 주 렌더 경로로 유지, WebGL 경로와 capability 계약 명시 | 실제 backend 표시, device/adapter 실패·device loss 복구 검증 |
| WebGPURenderer 호환 | 기존 ShaderMaterial/onBeforeCompile 경로를 별도 조사 | 자동 shader 호환을 가정하지 않고 material별 지원표·시각 비교 |
| instancing·LOD·culling | 동일 재질·geometry부터 batch, dirty range 갱신 | 작은 방과 대규모 장면을 함께 비교; 투명도·그림자·피킹 정확성 보존 |
| GPU compute·indirect | 비용이 큰 culling/대량 데이터에 한정 평가 | CPU 왕복 readback·동기화 비용 포함한 이득과 fallback 검증 |
| demand rendering·DPR | 정적 방과 유휴 UI 우선, 품질 정책으로 노출 | 재개 누락·입력 지연·애니메이션 정지 없음 |
| 압축 asset·streaming | KTX2/Basis, Meshopt/Draco를 전송·디코딩 비용으로 비교 | 사용 에셋·loader·장치에 맞춰 선택, 색 공간·품질 비교 |
| Worker·OffscreenCanvas·WASM | 병목으로 확인된 독립 계산부터 검토 | 전송·복사 비용, 배포 헤더, lifecycle을 포함해 검증 |
| React 18/19·R3F 8/9 | 실제 지원 조합별 최소·대표 버전 검사 | peer range 표기만으로 전체 조합 호환을 주장하지 않음 |

근거: [Three.js WebGPURenderer](https://threejs.org/manual/en/webgpurenderer.html)는 backend fallback과 shader migration 제약을 설명한다. [R3F 성능 가이드](https://r3f.docs.pmnd.rs/advanced/scaling-performance)는 demand rendering, 자원 재사용, instancing, 적응 품질을 다룬다. [Chrome WebGPU 개요](https://developer.chrome.com/docs/web-platform/webgpu/overview)는 API 배경 자료이며 모든 OS·GPU의 지원 보증으로 사용하지 않는다. 위 도입 우선순위는 이를 현재 저장소에 적용한 설계 판단이다.

### 5.3 측정 프로토콜과 초기 성능 예산

- 동일 소스·lockfile·seed·asset hash·해상도·DPR·품질·브라우저·GPU·전원 조건으로 비교한다. backend와 hardware/software adapter를 기록한다.
- cold load와 warm steady state를 분리한다. warm-up 10초 뒤 60초를 5회 측정하며 A/B 순서를 교차한다. 실행별 p50/p95/p99와 반복 실행 중앙값·범위를 함께 보존한다.
- 프레임 간격, main thread CPU, GPU 시간은 다른 지표다. timestamp query 미지원은 N/A로 표시하며 CPU 시간을 GPU 시간으로 대체하지 않는다.
- 모바일 열화·백그라운드·탭 가시성 변화를 기록한다. 자동화 Chromium 외 Android Chrome·iOS Safari 실기기, 데스크톱 Chromium·Firefox·Safari의 지원 경로를 검증한다.
- 규모: 가구 30/100/500, scene object 1k/10k, avatar 1/10/30, 방문자 2/8/32, asset gallery 24/96. 대표 실사용과 스트레스 결과를 분리한다.
- GPU 메모리는 보편적 정밀 측정을 전제하지 않는다. 엔진 소유 자원 bytes 추정·개수, 브라우저 제공 수치, 미지원 항목을 구분한다.

| 제안 예산 | 대표 조건·목표 | 판정 |
| --- | --- | --- |
| 데스크톱 상호작용 | 1080p DPR 1, 중급 GPU, 가구 100·avatar 1, 목표 60Hz | 프레임 간격 p95 ≤18ms, p99 ≤33.3ms, CPU/GPU 각각 별도 기록 |
| 모바일 상호작용 | 지정 중급 실기기, DPR 상한 1.5, 가구 30·avatar 1 | 프레임 간격 p95 ≤33.3ms, 입력→화면 p95 ≤100ms |
| 편집 | 1k object 일반 command | p95 ≤16ms; 10k는 ≤50ms, 큰 import는 비동기 진행 표시 |
| 초기 진입 | cold cache, 10Mbps·RTT 80ms 고정 조건 | 조작 가능 ≤5초 제안. HTML·JS·asset·GPU 준비 비용 분리 |
| 유휴 | 애니메이션·물리 변화 없는 방, 안정화 후 10초 | 지속 frame render 0, 입력·저장·resize에서 정확히 재개 |
| 수명 | mount/unmount·방/asset 교체 50회 | 엔진 소유 listener·RAF·GPU 자원 잔존 0; cache 예산 내 plateau |
| 회귀 | 같은 품질·기능의 기준 장면 | p95 5% 초과 악화 시 조사, 반복 범위 겹치면 개선 확정 보류 |

장치 모델은 S0에서 지정한다. 예산 미달 시 원인과 기능·화질 trade-off를 기록하고 품질을 몰래 낮춰 통과시키지 않는다. 네트워크/대규모 목표는 서버·장치 baseline 확보 뒤 수치화한다.

## 6. DRY·KISS 최적화 요구사항 — OPT-01

1. clock, entity identity, scene command, asset cache, resource disposal, backend capability의 소유자를 명확히 한다. 월드별 격리를 유지하고 전역 singleton으로 중복을 합치지 않는다.
2. frame hot path는 안정된 객체·buffer·참조를 재사용한다. 풀링은 GC 비용을 확인한 경로에 적용하고 반환값 aliasing과 stale handle을 검사한다.
3. 변경된 데이터만 계산·업로드·알림한다. command/dirty revision을 공유하되 React UI와 시뮬레이션 갱신 주기를 분리한다.
4. 유사 코드가 동일한 계약·실패 처리를 공유할 때만 추출한다. 일반화된 관리자나 새 ECS를 중복 감소만을 이유로 추가하지 않는다.
5. `core`와 `next`는 entity·transform·lifecycle 계약부터 맞춘다. backend별 구현 차이는 작은 adapter로 남기고 일괄 재작성하지 않는다.
6. 내부 모듈은 공개 root barrel 역참조를 줄인다. headless runtime import가 DOM·GPU 초기화를 발생시키지 않도록 검사한다.
7. 공개 API·저장 schema 변경은 migration·호환 테스트·semver를 함께 변경한다. 이름 정리와 성능 변경을 분리해 회귀 원인을 추적한다.

변경 1건의 필수 기록: 문제·재현 → 비용 근거 → 최소 변경 → 정확성 검사 → 동일 조건 A/B → 크기·가독성·유지보수 영향 → 수용/보류 사유. 단순 중복 제거는 유지보수 개선으로 보고하며 측정 없이 성능 향상을 주장하지 않는다.

## 7. npm 발행과 예제 자동배포 — REL-01

### 7.1 파이프라인

`main 변경 → 검증 → 버전 결정 → 패키지 생성·검증 → npm 발행 → registry/fresh install 검증 → 동일 릴리스 예제 빌드 → Pages 배포 → 라이브 검증`

- semantic-release를 기존 설정에 맞춰 기본 발행 주체로 삼는다. `publish:full`과 CI가 같은 버전을 동시에 발행하지 않도록 release concurrency와 재실행 정책을 둔다.
- PR 단계에서 harness/lint/관련 테스트/build/publint/consumer/demo 검사. 릴리스에서 `verify:full`에 해당하는 필수 검증과 관련 브라우저 경로를 통과해야 한다.
- React18/R3F8 및 React19/R3F9 대표 소비자와 선언한 Three 최소·대표 지원 버전을 검사한다. 실패 조합은 조용히 peer 범위에서 제거하지 않고 호환 수정 또는 명시적 변경으로 처리한다.
- npm OIDC trusted publishing을 우선한다. 공식 문서의 현재 최소 조건은 npm 11.5.1·Node 22.14.0이며 선택한 semantic-release와 CI 환경의 호환도 확인한다. 권한·workflow 이름·직접 publish 허용 설정을 실제 패키지 설정에서 확인한다. [npm 공식 문서](https://docs.npmjs.com/trusted-publishers/)
- GitHub Pages를 현재 스크립트 기반 기본 대상으로 삼되 원격 repository·Pages 설정·도메인을 실행 전에 확인한다. 별도 서비스로 이전할 경우 배포 adapter와 URL만 교체한다.
- 배포용 examples는 가능하면 발행된 정확한 버전을 설치해 빌드한다. 현재 로컬 소스 alias를 쓰는 경로는 tarball 기반 소비자 빌드로 별도 검증하여 “배포 패키지를 사용하는 예제”임을 보장한다.
- artifact manifest에 version, release source SHA, package integrity, example asset hash, build time, CI run URL을 기록한다. semantic-release의 버전 커밋과 검증 소스의 관계도 기록한다.

### 7.2 완료·실패 처리

| 관문 | 확인할 증거 | 실패 시 행동 |
| --- | --- | --- |
| npm | registry version·dist-tag·integrity, 빈 프로젝트 fresh install, ESM/CJS/types·Vite 실행 | 전파 지연은 제한된 backoff. 기존 버전이면 integrity 대조 후 후속 단계 재개 |
| 데모 | `/`, `/engine`, `/performance` 직접 진입·새로고침, base path·asset 200 | 이전 정상 배포 유지, 같은 검증 artifact로 재배포 |
| 라이브 | version.json과 npm version·source 관계 일치, 실제 미니룸·저장·복원 | 불일치면 완료 처리 금지, 캐시와 배포 상태 조사 |
| 발행 성공·배포 실패 | npm 성공과 사이트 실패 상태 각각 기록 | npm 버전 재발행 대신 배포 job 재실행 |
| 릴리스 결함 | 재현·영향 버전·후속 수정 | patch 발행, 필요 시 dist-tag 조정. npm 발행 삭제를 일반 rollback으로 사용하지 않음 |

main push, npm 성공, Pages 배포, 라이브 동작은 각각 별도 상태다. PRD 작성 단계에서는 실제 원격 발행 상태를 확인했다고 간주하지 않는다.

## 8. Unity 같은 웹 제작 엔진으로의 구현 범위 — ENG-01

제품 역량은 “장면 제작→플레이→디버깅→저장→배포”를 하나의 프로젝트에서 수행하는 정도로 평가한다. 기존 Unity 교환 기능과 웹 제작 엔진의 완성도는 별도 축이다. 아래 단계는 우선순위이며 뒤 단계 기능을 요구 범위에서 삭제하는 의미가 아니다.

| 역량 | 현재 출발점 | 구현해야 할 범위 | 단계 |
| --- | --- | --- | --- |
| 프로젝트·장면 | SceneDocument·command·save | project manifest, 다중 scene, stable ID, asset reference, migration | E1 |
| 에디터 | editor/tools 및 미니룸 편집 경로 | hierarchy·inspector·viewport·transform gizmo, multi-select, snap, undo/redo | E1 |
| 편집/실행 | runtime lifecycle·clock 진행 | play/pause/step/stop, 편집 snapshot 복원, runtime 변경 반영 정책 | E1 |
| asset pipeline | GLTF cache·avatar·도구 | import/validate/compress, dependency/hash, reimport, missing reference 복구 | E1–E2 |
| scene/prefab | 객체·component 데이터 | prefab instance·override·variant, 참조 순환·삭제·migration | E2 |
| gameplay 작성 | events·blueprints·plugin | typed component schema, lifecycle, script/graph 연결, 오류 위치·재시작 | E2 |
| 물리·내비 | Rapier·query·navigation | authoring·debug view, collision layer, controller, nav bake/증분 갱신 | E1–E2 |
| animation·audio·UI | motion/avatar/audio/UI | 상태 전이 편집, timeline/cinematic, audio bus, UI binding | E2–E3 |
| rendering | WebGPU/TSL·postprocess·next | capability·quality profile, light/environment 편집, pass profiler | E1–E2 |
| 빌드·배포 | npm·Vite·gh-pages | project build manifest, asset chunk/cache, preview, one-click publish | E1–E2 |
| 디버깅·프로파일링 | performance lab | frame/tick inspector, scene resource inspector, trace export, 오류 대상 이동 | E1–E2 |
| 온라인 서비스 | network adapter·상태 계약 | 인증·권한·권위 서버, persistence, 동기화·재접속, 운영 지표 | E2–E3 |
| 협업 제작 | 추가 확인 필요 | 프로젝트 공유, 역할·권한, revision conflict, 변경 이력, 공동 편집 | E3 |
| 확장 생태계 | package exports·plugin | 버전형 plugin API, sample template, asset/package registry, 호환 검사 | E2–E3 |
| Unity 상호운용 | GLB·장면 JSON | Editor 테스트, asset GUID 매핑, prefab/component 변환 규칙, 진단 보고 | E2–E3 |
| 고급 Unity 호환 | 현재 계약으로 보장하지 않음 | shader·Animator·physics·C# 실행 의미 변환을 항목별 조사·추정 | E3 연구 |

### E1: 단일 사용자 웹 제작기

빈 프로젝트에서 asset을 가져와 장면을 만들고, 물리·상호작용을 설정하고, 플레이·정지·복원한 뒤 브라우저에 배포한다. 미니홈피는 이 도구로 유지할 수 있는 공식 템플릿이 된다. 제작 도구가 미니홈피 전용 데이터 구조에 종속되지 않아야 한다.

### E2: 재사용 가능한 제작 플랫폼

다중 scene·prefab·component·asset pipeline·profiler·plugin을 연결한다. 미니홈피 외 서로 다른 두 템플릿(예: 워크스루, 상호작용 전시)을 같은 공개 계약으로 제작한다. 온라인 방문 기능은 서버 어댑터를 실제로 연결해 검증한다.

### E3: 팀 제작·운영 플랫폼

공동 편집·권한·프로젝트 이력·서버 운영·registry·고급 콘텐츠 도구를 구현한다. Unity 상호운용은 지원하는 변환과 손실을 명시하고 실제 Editor 자동 테스트를 운영한다. 임의 Unity 프로젝트를 무손실 변환하는 목표는 별도 기술 검증 및 공수 산정 항목으로 유지한다.

## 9. 단계·의존성·공수 추정

아래는 코드·문서 표본 확인에 기반한 초기 계획 추정이다. 1인 주는 숙련 개발자 5일이며 병렬 투입 시 달력 기간과 같지 않다. 전체 감사·기능 레지스트리 확정 후 재산정한다. 에셋 제작, Unity 환경 준비, 실기기·서버 접근 지연은 별도다.

| 단계 | 범위 | 선행 조건·종료 관문 | 추정 |
| --- | --- | --- | --- |
| P0 | 기존 변경 정리, 기능·모듈 전수 목록, 장치·baseline 고정 | dirty source 식별, R 항목 현황 대조, 재현 실행 | 1–2인 주 |
| P1 | 미니홈피 핵심 편집·실제 asset/avatar·기능 연결 | P0, 저장/수명 정확성; MH 핵심 사용자 여정 | 3–5인 주 |
| P2 | 코어 감사·우선 병목·DRY/KISS, S2–S6 연결 | P0, 공통 계약→물리/NPC→GPU/규모 순서; A/B와 회귀 | 5–9인 주 |
| P3 | npm·Pages CI/CD와 릴리스 검증 | P1/P2의 릴리스 대상 안정화, 권한·호스팅 확인 | 1–2인 주 |
| P4 | 장치·브라우저·수명·시각 통합 검증 | P1–P3, live smoke와 결함 수렴 | 2–3인 주 |
| P5 | 실제 온라인 방문·영속 방명록·재접속 | 권위/권한 계약·서버·인증·저장소 선택 | 추가 3–6인 주 |

첫 오프라인 중심 제품·성능·배포 마일스톤은 P0–P4 합계 12–21인 주, 온라인 통합까지 15–27인 주의 초기 범위다. P1과 P2는 계약 확정 후 일부 병행 가능하다. 2명 투입만으로 기간이 정확히 절반이 된다고 계산하지 않는다.

E1 추가 범용 제작기 범위는 8–14인 주, E2 추가 16–28인 주, E3 추가 24–48인 주를 초기 탐색 예산으로 둔다. 각 추가 공수는 앞 단계 재사용을 전제로 한다. 임의 C#/shader/Animator 의미 변환은 이 숫자에 포함된 확정 구현 견적이 아니며 별도 2–4인 주 타당성 조사 후 재산정한다. 범위 추정의 확신도는 중하이며 프로젝트·prefab·온라인 계약 확정이 가장 큰 변동 요인이다.

## 10. 리스크와 결정 항목

| 항목 | 기본안 | 확정 시점·대응 |
| --- | --- | --- |
| 진행 중 코어 작업과 충돌 | 기존 R/S 계획과 요구사항 ID 재사용 | P0에서 변경별 상태 확인, 같은 모듈 동시 수정 방지 |
| WebGPU 버전별 차이 | capability adapter·실제 backend 표시 | P0 지원표; native GPU 측정과 software 검증 분리 |
| 기능 확대에 따른 초기 로드 증가 | route/tool lazy load·공통 asset cache | P1 cold-load 예산, 필수/선택 asset manifest |
| 사용자 저장 손상 | 안정 ID·version schema·transaction/rollback | 편집·복원 변경 전에 migration fixture |
| 공개 peer 호환 비용 | 실제 지원 조합을 명시적으로 유지 | P0 비용 산정, major 변경은 별도 migration 계획 |
| 온라인 서비스 미확정 | 어댑터 계약 후 인증·DB·서버 선택 | P5 착수 전 비용·권한·운영 책임 결정 |
| npm/Pages 자격·설정 | 기존 main·semantic-release·Pages 유지 | P3 시작 시 실제 설정 확인, CI 성공으로 live 성공 대체 금지 |
| Unity 실제 실행 증거 부재 | Editor 설치 환경의 compile·round-trip gate | MH-13 및 E2 완료 전 검증 |

## 11. 요구사항 추적과 최종 인수

각 요구사항은 `ID / 상태 / 소스 / 시나리오 / baseline run / candidate run / 장치 / 결과 / 제한 / 릴리스`로 추적한다. 상태는 계획·구현 중·구현됨·검증됨·배포됨으로 구분한다. 하위 R 항목의 기존 수치나 검증 상태는 중복 집계하지 않는다.

- 기능: 새 사용자 진입→가구 편집→아바타/상호작용→저장→재진입→공유/가져오기 흐름을 실제 화면에서 검증한다.
- 성능: 전수 감사표의 미분류 모듈 0, 확정 병목별 A/B 자료, 대표 장치 예산과 시각 정확성을 검토한다.
- 안정성: 두 월드 격리·종료·복원 실패·asset 교체·재접속·저장 migration을 관련 실제 구현으로 검사한다.
- 패키지: 실제 발행 tarball의 fresh consumer, ESM/CJS/types 및 지원 peer 조합을 확인한다.
- 배포: npm version·main/release source·CI·live version.json 관계와 라이브 사용자 여정을 확인한다.
- 확장성: E1/E2/E3 요구사항·추정·선행 계약이 추적 가능하며 미구현 기능을 기존 API 존재만으로 완료 처리하지 않는다.

최종 보고는 구현된 기능, 계측된 개선, 유지된 호환성, 배포 버전·URL, 남은 검증 경계를 각각 제시한다.
