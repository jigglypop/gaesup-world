# gaesup-world PRD

작성일: 2026-09-27 · 기준: `main` 6bf59ad1

## 방향

- gaesup-world는 웹판 Unity/Unreal이다. React Three Fiber 위의 3D 엔진이며, 예제(`examples/minihome`, 포코피아·게더타운식 마을)는 엔진을 증명하는 수단일 뿐이다.
- WebGPU로 전부 간다. 렌더러는 `WebGPURenderer`, 셰이더는 TSL만 쓴다. WebGL2는 `WebGPURenderer` 내장 fallback으로만 지원한다.
- upstream(three r186, R3F 9/10)이 제공하는 기능은 자체 구현을 지우고 upstream을 쓴다.
- 엔진 코어 판단 기준은 "웹판 Unity/Unreal에 필요한가"다. 게임 장르 로직은 코어에 두지 않는다.
- 공개 API 삭제는 승인 후 진행한다. 문서는 `docs/`(사용자용·개발자용)에 두고 slice마다 갱신한다.

## 현재 상태

- `pnpm run verify:full` 통과: jest 2,639개, publint, 설치형 ESM/CJS 소비자, 예제 lazy 라우트.
- 기준 측정(작은 마을, WebGPU, dev): 스크립트 2.3ms/프레임, draw 81, 삼각형 230만(대부분 잔디), 유휴에도 매 프레임 렌더(CPU 15%). 운영 월드 라우트 3,913KB min / 1,311KB gz.
- 소비자 번들(피어 제외, DEL-1 전 측정): `createSceneDocument` 하나에 712KB, 최소 월드 6개 이름에 848KB, 전체 1,495KB. 루트 값 export는 DEL-1·DEL-2로 1,097개에서 946개가 됐고, ISO-1이 4개(`createAssetStore`, `useAssetStoreApi`, `createDialogRegistry`, `useDialogRegistry`)를 더했다.
- minihome 측정(2026-09-27, RTX 50 WebGPU, 1600×900@1.5, high tier, vsync 해제): 프레임 4.23ms, draw 219, 삼각형 1.02M, 텍스처 441MB. 해 그림자(cascade 2048px×4장을 매 프레임)가 draw 159개·프레임의 70%다. three `WebGPURenderer`는 draw 하나에 CPU 18–22µs라 프레임 시간이 draw 수를 따른다. 입력이 2초 없으면 NPC가 걸어도 초당 30번만 그린다. 첫 로드는 월드를 조각으로 나눠 컴파일해 렌더 long task가 80ms를 넘지 않는다.
- 초켓몬스터 이식(CK-1~13)은 끝났다. 사용자가 만든 게임 [choketmonster](https://github.com/jigglypop/choketmonster)의 렌더링·그림자·LOD·지형·잔디·UI 기법 가운데 효과가 확인된 것을 코어로 옮겼다(장르 로직 제외). 무엇을 옮기고 뺐는지는 [docs/dev/decisions.md](docs/dev/decisions.md), 각 작업은 커밋 제목의 CK ID에 있다.
- 수용 테스트 12개가 `pending`이다. `test/accept/budgets.json`의 미구현 계약을 합격 근거로 세지 않는다.

## 실행 순서

표 순서가 착수 순서다. 끝난 slice는 지우고 기록은 커밋 제목의 ID로 남긴다.

| ID | 내용 | 완료 기준 |
|---|---|---|
| PERF-2 | 벽 draw. 벽 배치가 BoxGeometry 면 6개를 그룹 6개로 그려 그림자 pass마다 배치당 draw 6개이고, 창·문·난간 틀은 조각마다 배치다(예제 벽 4개가 그림자 draw의 60%). 같은 재질 면을 한 그룹으로, 한 벽 종류의 틀 조각을 한 지오메트리로 합친다 | 예제 섬 draw(main·shadow)와 렌더 CPU 전후. 창·문 모양, 그림자, 클릭 선택 유지 |
| PERF-3 | 절전 모드. 보이는 주민이 움직이면 매 프레임 그려(`markActivity`), 주민이 걷는 예제에서는 절전 모드가 켜지지 않는다(입력이 없어도 60/s, 메인 스레드 62%). 주민 움직임은 물·잔디처럼 배경으로 보고 입력과 카메라만 깨운다 | 입력 없는 예제의 그린 프레임·메인 스레드 사용 전후 |
| PERF-4 | 성능 보고 갱신. `usePerformanceReport(500)`이 store 값마다 따로 구독해 예제 상태 패널이 초당 10.7번 다시 그린다. 간격마다 한 번 읽어 한 번 갱신한다. 예제 숫자 서식은 `Intl.NumberFormat`을 재사용한다 | 패널 렌더 횟수/s, 개발 모드 프레임 CPU 전후 |
| PERF-5 | GLB 받기와 해석 분리. 캐시의 동시 3개가 받기와 해석을 함께 묶어, 큰 주민 모델(1–2.4MB × 10)이 작은 소품·자연 모델 20여 개 뒤에서 4초에야 받기 시작한다. 받기는 요청 즉시, 해석만 동시 3개로 | 50Mbps·RTT 40ms에서 주민 모델 받기 시작·월드 준비 시각 전후 |
| PERF | 측정 기반 병목(남은 것). 큰 월드(타일 수천 개)에서 건물 편집 증분 갱신(`BuildingBatches`, `BlockColliders`), 내비게이션 변경 영역만 갱신(ck처럼 탐색 한 번 동안 격자 샘플 캐시), NPC 비가시 시뮬레이션 예산, 처음 놓는 GLB 소품의 불러오기·해석 long task, 캐릭터 텍스처 2048²(예제 GPU 메모리 414MB 중 약 255MB)의 품질 tier별 상한, 부팅 셰이더 빌드(메인 스레드 약 2.4s, 프로그램 181)(예제 섬 규모에서는 앞의 셋이 병목이 아님) | 같은 장면·장치에서 프레임 p50/p95, long task, draw, GPU ms, collider 수를 전후로 남긴다. CPU 미세 측정만으로 FPS 개선을 선언하지 않는다 |
| UP-1 | upstream 대체. `CascadedSun`·`DynamicSky`를 three r186 `SunLight`(두 백엔드 CSM)와 시간대 연동 하나로 가로등 라이트 풀은 r185 클러스터(Forward+) 조명으로, 품질 tier에 r184 TAAU/FSR 업스케일. `OutfitAvatar`는 `AvatarRuntime`으로 합친다. 새 해도 cascade 갱신 주기(`updateHz`, CPU 병목 때 15/5Hz)와 자동 해상도를 그대로 받는다 | 자체 CSM·라이트 풀 코드 삭제, 같은 장면의 draw·프레임 시간 전후 기록 |
| LIB-1 | 라이브러리 형태. `preserveModules` 빌드로 트리셰이킹 복구, `GaesupWorld`가 런타임을 만들고 수명을 관리(legacy 경고 0), 루트 진입점에서 에디터 분리, 캔버스·WebGPU·품질·`GaesupWorldContent`를 묶은 부팅 컴포넌트, 런타임 `logger` 기본값을 개발 모드 콘솔로(지금은 플러그인 로그가 사라진다), 프로젝트 설정의 입력 바인딩을 조작 캐릭터에 연결 | import 모양별 소비자 번들 크기 전후, 최소 월드 부팅 코드 줄 수, 콘솔 경고 0 |
| NPC-1 | NPC 결함. 말하기 상태를 말풍선으로 그리고, 렌더 경로(`fullModelUrl` 단일 모델과 부위 조립)를 한 벌로, 일과표가 시뮬레이션을 움직이게, store의 카탈로그·인스턴스·에디터 선택을 나눈다. 지각이 `fieldOfView`·`hearingRadius`를 쓰고, 두뇌를 정하지 않은 NPC의 기본값을 외부 정책(`reinforcement`/`openai`)이 아닌 `scripted`로 | 예제 마을에서 말풍선과 일과 이동 브라우저 확인, NPC 50명 장면의 프레임 p50/p95 전후 |
| GI-1 | 월드 공간 동적 GI(웹판 Lumen-lite). 화면 공간 GI·반사(`cinematic`)가 못 보는 화면 밖·가려진 빛을 다룬다. 표준 WebGPU에는 하드웨어 레이트레이싱이 없으므로 Lumen의 소프트웨어 경로처럼 간다. upstream 먼저: r184 `LightProbeGrid`, r186 VXGI 애드온(`lighting/vxgi`, 복셀 콘 트레이싱), r186 `SunLight`. 모자라면 gw 고유: 건축 격자(4m 셀)를 GPU 3D 복셀 텍스처로 직접 채우고 편집한 셀만 갱신, compute가 프로브에서 복셀을 레이마칭(DDGI 방식)하며 프레임마다 일부 프로브만 갱신. wasm은 정적 GI 굽기와 GLB 소품 SDF 생성(워커). 품질 tier: low 굽기, medium 동적 프로브, high 프로브+화면 공간 GI | 작은 마을에서 GI를 켠 WebGPU 프레임의 GPU 시간 증가가 내장 GPU 기준 4ms 이하, 타일 편집 뒤 GI 반영 지연, 켜기 전후 스크린샷 |
| EX-1 | 예제 2차: 멀티플레이 방문자, 계단식 마을 꾸미기 확장 등. 예제 minihome: 계단식 마을 꾸미기(건축), 주민 NPC, 방문자 멀티플레이, 성능 HUD, Pretendard UI(woff2 `@font-face`, 지금은 이름만 있고 글꼴 파일을 싣지 않는다) | 공개 API만 사용, 브라우저 스크린샷, 성능 HUD 수치 |
| GPU-1 | **보류**(2026-09-27 사용자 결정, 다시 요청할 때까지 착수하지 않음). WebGPU 전면. `createRenderer`는 `WebGPURenderer`만 만들고, `WebGLRenderer`·GLSL(`shaderMaterial`)·WebGL 그림자 깊이 재질·`@react-three/postprocessing` 경로(불, 깃발, 잔디, 벚꽃, 눈, 물, 날씨, `ColorGrade`, `LutOverlay`, `ToonOutlines`)와 `gl`을 넘기지 않아 `WebGLRenderer`로 그리는 `MultiplayerCanvas`, drei `Grid`·`Line`·`Text`(legacy) 사용처를 지운다. 필요한 효과는 TSL로 옮긴다. `postprocessing`·`@react-three/postprocessing` 의존성을 뺀다 | `rendererKind(...) === 'webgl'` 분기 0, GLSL 소스 0, 브라우저에서 WebGPU와, `navigator.gpu`가 없을 때 `WebGPURenderer`의 WebGL2 백엔드 둘 다 그린다(지금은 classic `WebGLRenderer`로 떨어진다). 설치형 소비자 검증 통과 |

## 검증

- slice마다 `pnpm run verify:full`을 통과시킨다. 패키지 검증은 `build` → `publint` → `test:package:built` 순서로, 같은 `dist`에서 병렬 실행하지 않는다.
- 공개 API가 바뀌면 export snapshot과 `scripts/verify-package-consumer.cjs`를 같은 커밋에서 갱신한다.
