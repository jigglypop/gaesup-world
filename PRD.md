# gaesup-world PRD

작성일: 2026-09-27 · 기준: `main` 8e21fc39

## 방향

- gaesup-world는 웹판 Unity/Unreal이다. React Three Fiber 위의 3D 엔진이며, 예제(`examples/minihome`, 포코피아·게더타운식 마을)는 엔진을 증명하는 수단일 뿐이다.
- WebGPU로 전부 간다. 렌더러는 `WebGPURenderer`, 셰이더는 TSL만 쓴다. WebGL2는 `WebGPURenderer` 내장 fallback으로만 지원한다.
- upstream(three r186, R3F 9/10)이 제공하는 기능은 자체 구현을 지우고 upstream을 쓴다.
- 엔진 코어 판단 기준은 "웹판 Unity/Unreal에 필요한가"다. 게임 장르 로직은 코어에 두지 않는다.
- 공개 API 삭제는 승인 후 진행한다. 문서는 `docs/`(사용자용·개발자용)에 두고 slice마다 갱신한다.

## 현재 상태

- `pnpm run verify:full` 통과: jest 3,116개, publint, 설치형 ESM/CJS 소비자, 예제 lazy 라우트.
- 기준 측정(작은 마을, WebGPU, dev): 스크립트 2.3ms/프레임, draw 81, 삼각형 230만(대부분 잔디), 유휴에도 매 프레임 렌더(CPU 15%). 운영 월드 라우트 3,913KB min / 1,311KB gz.
- 소비자 번들(피어 제외, DEL-1 전 측정): `createSceneDocument` 하나에 712KB, 최소 월드 6개 이름에 848KB, 전체 1,495KB. 루트 export는 DEL-1로 1,097개에서 975개가 됐다.
- 수용 테스트 12개가 `pending`이다. `test/accept/budgets.json`의 미구현 계약을 합격 근거로 세지 않는다.

## 실행 순서

표 순서가 착수 순서다. 끝난 slice는 지우고 기록은 커밋 제목의 ID로 남긴다.

| ID | 내용 | 완료 기준 |
|---|---|---|
| DEL-2 | 승인된 공개 API 삭제: NPC 네트워크 섬(`NetworkBridge`·`NetworkSystem`·`NPCNetworkManager`·`ConnectionPool`·`networkStateStore`, hook 5개, 패널 2개, `runtime.networkBridge`), `core/ops`, 샘플 플러그인 3개, deprecated 묶음(`usePhysics`, `BuildingBridge`, `WorldContainer` 별칭, `useGaesupContext`·`useCursorState`, 읽히지 않는 `WorldContainerProps`, `onDestory`) | export snapshot·소비자 검증 갱신, `verify:full` 통과. `blueprints`는 유지 |
| ISO-1 | 런타임별 격리. 자산 카탈로그와 로드 세대(`latestLoad`)를 런타임 소유로, `AvatarProvider` 기본 조회도 런타임 카탈로그로. 오류는 전역 sink 교체 대신 런타임이 소유한 경계(클록, 플러그인 이벤트 버스, 세이브, 상호작용, 캔버스 프레임 스케줄러)가 자기 `onError`로 보고한다 | 같은 asset ID에 다른 메타데이터를 가진 월드 A/B가 각자 결과만 읽고, 한쪽의 느린 로드·해제가 다른 쪽을 바꾸지 않는다. A의 오류는 A의 `onError`로만 가고, 해제 순서와 관계없이 종료된 런타임의 콜백이 다시 불리지 않는다. 두 런타임 해제 뒤 리스너·타이머 누수 0. `S-H08`을 실측으로 |
| ISO-2 | 방문 스냅샷 원자적 적용. 모든 도메인을 먼저 검증하고, 적용 중 실패하면 바뀐 도메인을 역순으로 되돌린다. 복구 실패는 구조화된 결과로 알린다 | `atomic: true`에서 한 도메인이라도 실패하면 로컬 상태가 적용 전과 같다. 호출자가 성공·실패를 구분하고 실패 뒤 autosave가 멈춰 있지 않다. 두 번째 도메인 예외 주입 테스트 |
| GPU-1 | WebGPU 전면. `createRenderer`는 `WebGPURenderer`만 만들고, `WebGLRenderer`·GLSL(`shaderMaterial`)·WebGL 그림자 깊이 재질·`@react-three/postprocessing` 경로(불, 깃발, 잔디, 벚꽃, 눈, 물, 날씨, `ColorGrade`, `LutOverlay`, `ToonOutlines`)를 지운다. 필요한 효과는 TSL로 옮긴다. `postprocessing`·`@react-three/postprocessing` 의존성을 뺀다 | `rendererKind(...) === 'webgl'` 분기 0, GLSL 소스 0, 브라우저에서 WebGPU와 WebGL2 fallback 둘 다 그린다. 설치형 소비자 검증 통과 |
| UP-1 | upstream 대체. `CascadedSun`·`DynamicSky`를 three r186 `SunLight`(두 백엔드 CSM)와 시간대 연동 하나로, 가로등 라이트 풀은 r185 클러스터(Forward+) 조명으로, 품질 tier에 r184 TAAU/FSR 업스케일. `OutfitAvatar`는 `AvatarRuntime`으로 합친다 | 자체 CSM·라이트 풀 코드 삭제, 같은 장면의 draw·프레임 시간 전후 기록 |
| LIB-1 | 라이브러리 형태. `preserveModules` 빌드로 트리셰이킹 복구, `GaesupWorld`가 런타임을 만들고 수명을 관리(legacy 경고 0), 루트 진입점에서 에디터 분리, 캔버스·WebGPU·품질·`GaesupWorldContent`를 묶은 부팅 컴포넌트 | import 모양별 소비자 번들 크기 전후, 최소 월드 부팅 코드 줄 수, 콘솔 경고 0 |
| PERF | 측정 기반 병목 제거. 건물 편집 증분 갱신(`BuildingBatches`, `BlockColliders`), WebGPU 일반 모델 상주 정책, 내비게이션 변경 영역만 갱신, NPC 비가시 시뮬레이션 예산, 장면 전체 순회 제거, 기본 유휴 프레임 정책(`IdleFrameRate`), 잔디 밀도 품질 tier, GPU 시간(`trackTimestamp`)과 성능 HUD | 같은 장면·장치에서 프레임 p50/p95, long task, draw, GPU ms, collider 수를 전후로 남긴다. CPU 미세 측정만으로 FPS 개선을 선언하지 않는다 |
| GI-1 | 동적 GI(웹판 Lumen-lite). 표준 WebGPU에는 하드웨어 레이트레이싱이 없으므로 Lumen의 소프트웨어 경로처럼 간다. upstream 기반: three `SSGINode`, r184 `LightProbeGrid`, r186 `SunLight`. gw 고유: 건축 격자(4m 셀)를 GPU 3D 복셀 텍스처로 직접 채우고 편집한 셀만 갱신, compute가 프로브에서 복셀을 레이마칭(DDGI 방식)하며 프레임마다 일부 프로브만 갱신. wasm은 정적 GI 굽기와 GLB 소품 SDF 생성(워커). 품질 tier: low 굽기, medium 동적 프로브, high 프로브+SSGI | 작은 마을에서 GI를 켠 WebGPU 프레임의 GPU 시간 증가가 내장 GPU 기준 4ms 이하, 타일 편집 뒤 GI 반영 지연, 켜기 전후 스크린샷 |
| EX-1 | 예제 minihome: 계단식 마을 꾸미기(건축), 주민 NPC, 방문자 멀티플레이, 성능 HUD, Pretendard UI | 공개 API만 사용, 브라우저 스크린샷, 성능 HUD 수치 |

## 검증

- slice마다 `pnpm run verify:full`을 통과시킨다. 패키지 검증은 `build` → `publint` → `test:package:built` 순서로, 같은 `dist`에서 병렬 실행하지 않는다.
- 공개 API가 바뀌면 export snapshot과 `scripts/verify-package-consumer.cjs`를 같은 커밋에서 갱신한다.
