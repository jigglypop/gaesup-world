# gaesup-world 문서

gaesup-world는 React Three Fiber 위에서 도는 **웹판 Unity/Unreal**이다. WebGPU(`WebGPURenderer`, TSL)로 그리고, 물리 캐릭터·카메라·입력·건축·NPC·저장·멀티플레이·에디터를 월드 하나의 모델로 묶는다. 이 폴더는 엔진을 **쓰는 사람**(guide)과 엔진을 **고치는 사람**(dev)을 위한 문서이며, 다음 작업 세션(사람이든 AI든)의 진입점이다.

## 먼저 읽을 것

| 목적 | 읽을 문서 |
|---|---|
| 엔진으로 월드를 만든다 | [guide/getting-started.md](guide/getting-started.md) → 필요한 주제 문서 |
| 엔진 코드를 고친다 | [dev/principles.md](dev/principles.md) → [dev/workflow.md](dev/workflow.md) → [dev/architecture.md](dev/architecture.md) |
| 지금 할 일을 이어받는다 | 루트 [`PRD.md`](../PRD.md)(작업 순서와 완료 기준) → [dev/module-status.md](dev/module-status.md) |
| 규칙을 확인한다 | 루트 [`CLAUDE.md`](../CLAUDE.md) |

## 현재 상태 (2026-09-27, `main` 2fcfcece)

- `pnpm run verify:full` 통과: 타입체크 3종, lint(경고 0), 계층·진입점·품질 래칫, jest 2,639개, 빌드, publint, 메모리 테스트, 설치형 ESM/CJS 소비자, 예제 lazy 라우트.
- 코드: `src` 비테스트 94,917줄. 이번 정리 전(`f2b077d1`) 108,683줄에서 12.7% 줄었다. 루트 export는 1,097개에서 946개가 됐다.
- 예제 `examples/minihome`: 공개 API만 쓰는 최소 마을(12×12 타일 평지, 연못, 길, 오두막 벽, 나무·벚꽃·모닥불·깃발, 플레이어, 배회 NPC 2명). WebGPU에서 60fps로 그린다.
- 알려진 큰 문제:
  1. 라이브러리 빌드가 모듈을 큰 청크로 합쳐 트리셰이킹이 약하다. 함수 하나만 가져와도 수백 KB가 딸려 온다(PRD LIB-1).
  2. `GaesupWorld`만 쓰면 모듈 전역(legacy) store로 돌고 개발 모드 경고가 7개 난다(LIB-1).
  3. 자산 카탈로그와 오류 보고가 전역이라 월드 둘을 동시에 띄우면 섞인다(ISO-1).
  4. 방문 스냅샷의 원자적 적용이 중간 실패를 되돌리지 않는다(ISO-2).
  5. WebGPU가 없으면 `WebGPURenderer`의 WebGL2 백엔드가 아니라 classic `WebGLRenderer`와 GLSL 경로로 그린다. WebGL 전용 후처리(`@react-three/postprocessing`)가 루트 진입점에 정적으로 묶여 WebGPU만 쓰는 앱도 그 패키지를 설치해야 한다(GPU-1).
  6. 편집 UI와 타입에는 있지만 아무 일도 하지 않는 설정이 있다: 건축 안개·지면·물 설정, `cameraOption`·`urls` 일부 필드, `Teleport` props 등(DEAD-1). NPC는 말풍선을 그리지 않고 일과표가 움직이지 않는다(NPC-1).
  7. 동적 GI가 없다(GI-1).
  8. 유휴 상태에서도 매 프레임을 그리고(CPU 약 15%), 잔디가 삼각형 230만 개를 만든다(PERF).
- 다음 작업: PRD 순서대로 ISO-1 → ISO-2 → DEAD-1 → GPU-1 → UP-1 → LIB-1 → PERF → NPC-1 → GI-1 → EX-1.

## 문서 지도

### guide — 엔진 사용자용

| 문서 | 내용 |
|---|---|
| [getting-started.md](guide/getting-started.md) | 설치, 예제 실행, 최소 월드와 각 조각의 역할 |
| [world-runtime.md](guide/world-runtime.md) | 월드·런타임·store 범위, 프레임 단계, 물리 시계, 플러그인 |
| [rendering.md](guide/rendering.md) | WebGPU 렌더러, 품질 tier, 해·안개·후처리, TSL 재질, 인스턴싱 |
| [character-camera-input.md](guide/character-camera-input.md) | 조작 캐릭터, 카메라 모드와 충돌, 입력·터치·클릭 이동, 상호작용 |
| [building.md](guide/building.md) | 건축 데이터 모델, store 액션, 편집 모드, 에디터 패널 |
| [npc-dialog-gameplay.md](guide/npc-dialog-gameplay.md) | NPC(템플릿·인스턴스·두뇌·시뮬레이션), 대화, 게임플레이 규칙 엔진 |
| [save-network.md](guide/save-network.md) | 저장 시스템, 월드·플레이어 스냅샷, 방문, 멀티플레이 클라이언트 |
| [performance.md](guide/performance.md) | 측정 방법, 품질 설정, 비용이 큰 것, 기준선 |
| [api-map.md](guide/api-map.md) | 패키지 진입점별 주요 export와 import 방법 |

### dev — 엔진 개발자용

| 문서 | 내용 |
|---|---|
| [principles.md](dev/principles.md) | 무엇을 코어에 두는가, WebGPU 전면, upstream 우선, 공개 API 변경 절차 |
| [workflow.md](dev/workflow.md) | PRD → slice → 검증 → 커밋 흐름, 커밋 규칙, 병렬 에이전트, 세션 시작·종료 체크리스트 |
| [repository.md](dev/repository.md) | 저장소 지도, 모듈별 크기, 진입점, 스크립트, CI |
| [architecture.md](dev/architecture.md) | 런타임 합성, store 범위, 프레임·시계, 플러그인, 저장, 렌더링, NPC, 네트워크 |
| [module-status.md](dev/module-status.md) | 모듈별 상태(유지·수정·통합·삭제 예정), 결함과 복잡도 핫스팟 |
| [verification.md](dev/verification.md) | 검증 관문 전체, 품질 래칫, export snapshot, 흔한 실패 |
| [measurement.md](dev/measurement.md) | 브라우저·번들·운영 라우트 측정 방법과 기준선 |
| [decisions.md](dev/decisions.md) | 이번 정리에서 내린 결정과 근거, 커밋 |
| [trends-2026.md](dev/trends-2026.md) | 2026년 9월 웹 3D 동향, upstream 대체 계획, Lumen(GI) 분석 |

## 다음 세션 시작 체크리스트

1. `CLAUDE.md`를 읽는다. 채팅과 도구 설명은 한국어로 쓴다.
2. `git status`, `git log --oneline -10`으로 미커밋 변경과 최근 slice를 확인한다. 미커밋 변경은 다른 사람의 작업일 수 있으니 되돌리지 않는다.
3. `PRD.md`에서 맨 위 slice와 완료 기준을 확인한다.
4. [dev/module-status.md](dev/module-status.md)에서 그 slice가 건드리는 모듈의 상태와 함정을 확인한다.
5. 작업 전후로 [dev/verification.md](dev/verification.md)의 관문(`pnpm run verify:full`)을 돌린다.
6. slice를 끝내면 커밋하고, PRD에서 그 행을 지우고, 바뀐 사용법·구조를 이 문서들에 반영한다.

## 용어

| 용어 | 뜻 |
|---|---|
| 월드(world) | `GaesupWorld`와 캔버스 하나로 그리는 장면과 그 상태 전체 |
| 런타임(runtime) | `createGaesupRuntime()`이 만드는 월드 하나의 소유자. store·시계·입력·NPC 시뮬레이션·플러그인·저장을 갖는다 |
| 도메인(domain) | 저장 단위가 되는 상태 묶음(건축, NPC, 시간, 날씨 등). `SaveSystem`에 `key`로 등록된다 |
| legacy store | 런타임 없이 쓸 때 처음 접근 시 만들어지는 모듈 전역 store. 2.0에서 없앨 예정 |
| slice | `PRD.md`의 작업 한 줄. 완료 기준이 있고 커밋 제목 끝에 ID를 붙인다 |
| upstream | three.js와 React Three Fiber |
