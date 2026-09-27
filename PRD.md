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
- minihome 측정(2026-09-27, RTX 50 WebGPU, 1600×900@1.5, high tier, vsync 해제): 프레임 4.23ms, draw 219, 삼각형 1.02M, 텍스처 441MB. 해 그림자(cascade 2048px×4장을 매 프레임)가 draw 159개·프레임의 70%다. three `WebGPURenderer`는 draw 하나에 CPU 18–22µs라 프레임 시간이 draw 수를 따른다. 입력이 2초 없으면 NPC가 걸어도 초당 30번만 그리고, 인물이 모두 준비되는 순간 메인 스레드가 0.45초 멈춘다.
- 초켓몬스터 이식(CK): 사용자가 만든 게임 [choketmonster](https://github.com/jigglypop/choketmonster)는 gw 1.1.0에서 월드·카메라·런타임·잔디 드라이버만 쓰고 렌더링·그림자·LOD·지형·잔디·UI를 직접 만들었다. 효과가 확인된 기법을 코어로 옮긴다(장르 로직 제외). 참조 사본은 `chocketmon/`(git·lint 제외), 무엇을 옮기고 뺐는지는 [docs/dev/decisions.md](docs/dev/decisions.md)에 있다.
- 수용 테스트 12개가 `pending`이다. `test/accept/budgets.json`의 미구현 계약을 합격 근거로 세지 않는다.

## 실행 순서

표 순서가 착수 순서다. 끝난 slice는 지우고 기록은 커밋 제목의 ID로 남긴다.

| ID | 내용 | 완료 기준 |
|---|---|---|
| CK-4 | 렌더 수명·로딩. 언마운트된 clone을 해제한다(`releaseObject`: `Object3D.dispose`, skeleton). `GLTFAssetCache`를 한 벌로 합친다(LRU 24, 동시 3, 보이는 시간 기준 timeout·abort, 실패 쿨다운·재시도, meshopt 워커). 코어의 drei `useGLTF`는 `useGLTFAsset`으로 바꾼다. 모델을 바꾸는 동안 이전 모델을 유지한다. 첫 draw 준비 신호(`CompileGate onReady`)와 `visibleTimeout`을 둔다. Windows에서는 `powerPreference`를 생략한다. 장치 손실 복구(`onDeviceLost`, `RendererRecovery`)를 넣는다. WebGL 미리보기와 WebGPU 월드가 캐시를 함께 쓸 때 생기는 인덱스 변환 문제를 확인한다 | 캐릭터 로드 끝 long task 446ms→100ms 이하. LOD 경계 10회 왕복 뒤 렌더 객체 수·힙이 기준선으로 돌아옴. `device.destroy()` 뒤 3초 안에 같은 상태로 복구. gw 콘솔 경고 −1 |
| CK-5 | 지면(남은 것). 타일 재질은 노드 렌더러에서 월드 좌표 UV와 넓은 색 변화를 쓴다(윗면만, 옆면은 기존 UV). 모래·눈밭과 다른 재질의 경계도 흙길처럼 페더 처리한다. 셀→재질·높이·물을 묻는 `createTileSampler`를 물가 필드 옆에 둔다(흙길 덮개·결정적 모래·눈 노이즈는 끝남) | 위에서 본 스크린샷에 4m 반복과 직선 경계가 없음. 새로고침해도 같은 모양. 타일 편집 반영 16ms 이내. 지면 draw 증가 없음 |
| CK-13 | 런타임 UX(ck 앱 계층). 3D 자산 로딩 진행률과 단계 메시지(`useWorldLoadProgress`, 첫 draw까지), 화면 좌표 이름표의 개수 예산과 겹침 정리(가까운 순, 데스크톱 6·모바일 3), 장면 음악 교차 페이드(1초)·재생 위치 이어 듣기·첫 입력 때 자동재생 해제(`useAmbientBgm` 확장), 클릭 이동의 목적지 표시와 경로선, 저장이 바뀐 것만 쓰고 IndexedDB 요청에 타임아웃, 멀티플레이 전송량 상한 | 로딩 중 진행률·단계 표시(스크린샷), 이름표가 겹치지 않음, 음악 전환에 끊김 없음, 저장 한 번에 쓰는 바이트가 바뀐 도메인만큼, 멈춘 IndexedDB에서도 저장 호출이 제한 시간 안에 끝남 |
| UP-1 | upstream 대체. `CascadedSun`·`DynamicSky`를 three r186 `SunLight`(두 백엔드 CSM)와 시간대 연동 하나로 가로등 라이트 풀은 r185 클러스터(Forward+) 조명으로, 품질 tier에 r184 TAAU/FSR 업스케일. `OutfitAvatar`는 `AvatarRuntime`으로 합친다. 새 해도 cascade 갱신 주기(`updateHz`, CPU 병목 때 15/5Hz)와 자동 해상도를 그대로 받는다 | 자체 CSM·라이트 풀 코드 삭제, 같은 장면의 draw·프레임 시간 전후 기록 |
| LIB-1 | 라이브러리 형태. `preserveModules` 빌드로 트리셰이킹 복구, `GaesupWorld`가 런타임을 만들고 수명을 관리(legacy 경고 0), 루트 진입점에서 에디터 분리, 캔버스·WebGPU·품질·`GaesupWorldContent`를 묶은 부팅 컴포넌트, 런타임 `logger` 기본값을 개발 모드 콘솔로(지금은 플러그인 로그가 사라진다), 프로젝트 설정의 입력 바인딩을 조작 캐릭터에 연결 | import 모양별 소비자 번들 크기 전후, 최소 월드 부팅 코드 줄 수, 콘솔 경고 0 |
| PERF | 측정 기반 병목 제거. 건물 편집 증분 갱신(`BuildingBatches`, `BlockColliders`), 내비게이션 변경 영역만 갱신(ck처럼 탐색 한 번 동안 격자 샘플 캐시), NPC 비가시 시뮬레이션 예산, 장면 전체 순회 제거, 게임패드 입력도 유휴 해제 활동으로, MRT 후처리에서도 `CompileGate` 사전 컴파일. 모델 상주는 CK-4가 맡는다 | 같은 장면·장치에서 프레임 p50/p95, long task, draw, GPU ms, collider 수를 전후로 남긴다. CPU 미세 측정만으로 FPS 개선을 선언하지 않는다 |
| NPC-1 | NPC 결함. 말하기 상태를 말풍선으로 그리고, 렌더 경로(`fullModelUrl` 단일 모델과 부위 조립)를 한 벌로, 일과표가 시뮬레이션을 움직이게, store의 카탈로그·인스턴스·에디터 선택을 나눈다. 지각이 `fieldOfView`·`hearingRadius`를 쓰고, 두뇌를 정하지 않은 NPC의 기본값을 외부 정책(`reinforcement`/`openai`)이 아닌 `scripted`로 | 예제 마을에서 말풍선과 일과 이동 브라우저 확인, NPC 50명 장면의 프레임 p50/p95 전후 |
| GI-1 | 동적 GI(웹판 Lumen-lite). 표준 WebGPU에는 하드웨어 레이트레이싱이 없으므로 Lumen의 소프트웨어 경로처럼 간다. upstream 기반: three `SSGINode`, r184 `LightProbeGrid`, r186 `SunLight`. gw 고유: 건축 격자(4m 셀)를 GPU 3D 복셀 텍스처로 직접 채우고 편집한 셀만 갱신, compute가 프로브에서 복셀을 레이마칭(DDGI 방식)하며 프레임마다 일부 프로브만 갱신. wasm은 정적 GI 굽기와 GLB 소품 SDF 생성(워커). 품질 tier: low 굽기, medium 동적 프로브, high 프로브+SSGI | 작은 마을에서 GI를 켠 WebGPU 프레임의 GPU 시간 증가가 내장 GPU 기준 4ms 이하, 타일 편집 뒤 GI 반영 지연, 켜기 전후 스크린샷 |
| EX-1 | 예제 2차: 멀티플레이 방문자, 계단식 마을 꾸미기 확장 등. 예제 minihome: 계단식 마을 꾸미기(건축), 주민 NPC, 방문자 멀티플레이, 성능 HUD, Pretendard UI(woff2 `@font-face`, 지금은 이름만 있고 글꼴 파일을 싣지 않는다) | 공개 API만 사용, 브라우저 스크린샷, 성능 HUD 수치 |
| GPU-1 | **보류**(2026-09-27 사용자 결정, 다시 요청할 때까지 착수하지 않음). WebGPU 전면. `createRenderer`는 `WebGPURenderer`만 만들고, `WebGLRenderer`·GLSL(`shaderMaterial`)·WebGL 그림자 깊이 재질·`@react-three/postprocessing` 경로(불, 깃발, 잔디, 벚꽃, 눈, 물, 날씨, `ColorGrade`, `LutOverlay`, `ToonOutlines`)와 `gl`을 넘기지 않아 `WebGLRenderer`로 그리는 `MultiplayerCanvas`, drei `Grid`·`Line`·`Text`(legacy) 사용처를 지운다. 필요한 효과는 TSL로 옮긴다. `postprocessing`·`@react-three/postprocessing` 의존성을 뺀다 | `rendererKind(...) === 'webgl'` 분기 0, GLSL 소스 0, 브라우저에서 WebGPU와, `navigator.gpu`가 없을 때 `WebGPURenderer`의 WebGL2 백엔드 둘 다 그린다(지금은 classic `WebGLRenderer`로 떨어진다). 설치형 소비자 검증 통과 |

## 검증

- slice마다 `pnpm run verify:full`을 통과시킨다. 패키지 검증은 `build` → `publint` → `test:package:built` 순서로, 같은 `dist`에서 병렬 실행하지 않는다.
- 공개 API가 바뀌면 export snapshot과 `scripts/verify-package-consumer.cjs`를 같은 커밋에서 갱신한다.
