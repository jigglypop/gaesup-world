# 개발 원칙

엔진 코드를 고치기 전에 읽는 판단 기준이다. 무엇을 코어에 두고 무엇을 지우는지, 렌더링과 upstream을 어떻게 대하는지, 공개 API를 어떻게 바꾸는지를 정한다. 작업 절차는 [workflow.md](workflow.md), 저장소 규칙 원문은 루트 [`CLAUDE.md`](../../CLAUDE.md)다.

## 1. 웹판 Unity/Unreal

gaesup-world는 게임이 아니라 **엔진**이다. 코어에 둘지는 "Unity나 Unreal이 엔진으로 제공하는가"로 판단한다.

| 코어에 둔다 | 코어에 두지 않는다 |
|---|---|
| 월드 모델, 런타임 수명주기, 저장 | 인벤토리, 화폐, 퀘스트, 우편, 제작, 도감, 농사, 호감도 같은 장르 규칙 |
| 렌더링(WebGPU, TSL 재질, 그림자, 후처리) | 특정 게임의 HUD |
| 물리 캐릭터, 카메라, 입력, 상호작용 | 게임 전용 데이터(아이템 표, 퀘스트 표) |
| 건축(타일·벽·블록·오브젝트)과 에디터 | |
| NPC 시뮬레이션·두뇌·내비게이션 | |
| 대화 트리, 트리거→조건→액션 규칙 엔진 | |
| 멀티플레이 클라이언트, 방문 스냅샷 | |

장르 규칙은 게임이 확장점으로 붙인다. 대화는 `custom` 효과·조건과 `onCustomEffect`·`evaluateCondition`, 게임플레이 규칙은 `registerCondition`·`registerAction`, 저장은 도메인 바인딩, 플레이어 진행은 `createPlayerProgress`의 `domains` 옵션이다. 2026-09-27에 생활 게임 도메인 11개를 이 기준으로 지웠다([decisions.md](decisions.md)).

## 2. 예제는 증명 수단이다

- `examples/minihome`(포코피아·게더타운식 마을)은 엔진을 보여 주는 예제일 뿐이다. 제품은 라이브러리다.
- 예제는 공개 API(`gaesup-world`와 subpath)로만 만든다. 예제에서 엔진 기능을 따로 구현하지 않는다.
- 예제가 막히면 예제에서 우회하지 말고 엔진을 고친다. 옛 minihome은 엔진을 거의 쓰지 않는 자체 엔진이었고 그래서 지웠다.
- 엔진 개선은 예제 화면에서 체감되게 보여 준다. 예제 UI 글꼴은 Pretendard이고 EX-1에서 woff2로 싣는다.

## 3. WebGPU로 전부 간다

- 렌더러는 `WebGPURenderer`, 셰이더는 TSL만 쓴다. WebGPU가 없는 브라우저는 `WebGPURenderer`의 WebGL2 백엔드가 같은 TSL 재질로 그리게 한다. 지금 `createRenderer`는 어댑터가 없으면 classic `WebGLRenderer`와 GLSL 경로로 떨어지며, GPU-1이 이를 없앤다.
- `WebGLRenderer`, GLSL `shaderMaterial`, `@react-three/postprocessing`(WebGL `EffectComposer`) 경로는 새로 만들지 않는다. 남아 있는 것은 PRD GPU-1에서 지운다.
- compute가 필요한 기능(GPU 컬링, 파티클, 동적 GI)은 WebGPU compute로 만든다. 표준 WebGPU에는 하드웨어 레이트레이싱이 없으니 SDF·복셀 같은 소프트웨어 트레이싱으로 설계한다([trends-2026.md](trends-2026.md)).

## 4. upstream 우선

three.js(r186)와 React Three Fiber가 제공하는 기능은 자체 구현하지 않는다. 이미 자체 구현이 있으면 upstream으로 바꾸고 지운다.

| 영역 | upstream | gw의 현재 자체 구현 | PRD |
|---|---|---|---|
| cascade 그림자 해 | r186 `SunLight`(두 백엔드 CSM) | `CascadedSun`, `DynamicSky` | UP-1 |
| 다수 광원 | r185 클러스터(Forward+) 조명 | 가로등 라이트 풀 | UP-1 |
| 업스케일 | r184 TAAU/FSR 노드 | 없음 | UP-1 |
| 후처리 파이프라인 | `RenderPipeline`(TSL) | `WorldPostProcessing`이 이미 사용 | 유지 |
| 화면 공간 GI | `SSGINode` | 없음 | GI-1 |
| 시간 | `THREE.Timer` | R3F가 `Clock` 사용(경고) | R3F 10 |
| 프레임 스케줄러, WebGPU 캔버스 | R3F 10 alpha의 새 `useFrame`, WebGPU 1급 지원 | `FrameScheduler`, `createRenderer` | R3F 10 안정판 뒤 |

## 5. 간결함과 성능

- `CLAUDE.md`: 속도·안정성·코드 간결성이 우선이다. DRY, KISS, 모듈화. 쓸데없는 문구를 쓰지 않는다.
- 같은 문제를 푸는 구현은 한 벌만 둔다. 이 저장소의 복잡도는 대부분 병렬 구현(엔티티 모델 3벌, 아바타 2벌, 멀티플레이 2벌, 해 2벌)에서 왔다.
- 기본 경로가 가장 빠르고 가장 쉬워야 한다. 권장 경로가 번거롭고 deprecated 경로가 기본이 되는 구조를 만들지 않는다.
- 매 프레임 코드에서 할당하지 않는다. scratch 객체를 재사용한다.
- 성능 주장은 측정으로 한다. 같은 장면·장치에서 전후 수치를 남기고, CPU 미세 측정만으로 FPS 개선을 선언하지 않는다([measurement.md](measurement.md)).

## 6. 공개 API 변경

- 공개 API(루트와 subpath의 export, 공개 타입의 필드)를 지우거나 바꾸기 전에 사용자 승인을 받는다. 권한 분류기도 `package.json` exports 삭제를 막을 수 있다.
- 바꿀 때는 같은 커밋에서 export snapshot(`src/__tests__/__snapshots__/exportSnapshot.test.ts.snap`)과 설치형 소비자 검증(`scripts/verify-package-consumer.cjs`)을 갱신하고, 지워진 이름이 모두 의도한 것인지 diff로 확인한다([verification.md](verification.md)).
- 더 넓게 받는 타입 변경(선택 필드 추가, 유니온 확대)은 호환된다. 필드 삭제, 필수화, 시그니처 변경은 호환되지 않는다.

## 7. 테스트

- 지운 기능의 테스트는 지운다. 남는 기능의 테스트가 지운 기능을 수단으로 썼다면 남는 수단으로 바꾸고 단언을 약하게 만들지 않는다.
- 테스트의 수단을 바꿨으면, 검사 대상을 일부러 망가뜨려 테스트가 실패하는지 확인한다(mutation 확인). 복원 가드 테스트가 이 확인 없이 항상 통과할 뻔했다.
- 공개 API 테스트는 소스 텍스트가 아니라 실제 export(값)와 컴파일러(타입)로 검사한다.

## 관련 문서

- [workflow.md](workflow.md) · [architecture.md](architecture.md) · [module-status.md](module-status.md) · [decisions.md](decisions.md) · [trends-2026.md](trends-2026.md)
- [../../PRD.md](../../PRD.md) · [../../CLAUDE.md](../../CLAUDE.md)
