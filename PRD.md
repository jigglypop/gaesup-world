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
| CK-1 | 그림자·프레임 정책(ck `Sunlight`). `CascadedSun`이 cascade마다 갱신 주기를 따로 둔다(`updateHz`: 가까운 cascade는 매 프레임, 먼 cascade는 한 프레임에 하나씩 돌아가며 15Hz). 해 방향·투영이 바뀌거나 카메라가 크게 이동하면 전부 다시 그린다. WebGL 단일 맵도 같은 주기를 따른다. 작은 소품·폴백 상자·NPC는 가까운 cascade에만 그림자를 넣는다(`castShadow: 'near'`). 카탈로그 GLB는 그림자를 만든다. `IdleFrameRate`는 카메라 이동과 보이는 NPC 이동도 활동으로 센다(캔버스 스케줄러 `markActivity`). 성능 보고에 그림자 설정과 캐스터 수를 넣는다 | minihome 측정(1600×900@1.5, high, vsync 해제): draw 219→120 이하, 프레임 평균 4.23→2.6ms 이하. 플레이어·NPC·나무 그림자 스크린샷. 입력 없이 NPC가 걸으면 화면 주기로 그림. 상태 패널에 그림자 정보 |
| CK-2 | 조명·재질 기본값. `SkyEnvironment`(하늘 IBL)를 예제에 붙인다. 수입 모델 재질 정규화 `normalizeImportedMaterials(root, 'figure' \| 'prop')`(ck `shadeFigure`: roughness 1·metal 0, MR 맵과 specular 제거, physical→standard)와 NPC 템플릿·캐릭터 옵션을 둔다. 발밑 접지 그림자 `ContactShadows`를 둔다. `MaterialManager`는 기본 거칠기 .9, 유리는 알파 유리로 한다(transmission은 high tier만) | 인물 12종 재질 보고에서 metal>0 0개. 흰 반점이 사라진 전후 스크린샷. 프로그램 +2 이하, draw +1 이하 |
| CK-3 | UI·로딩. 조사 결과로 채운다(글래스 토큰, 로딩 진행 표시, 화면 좌표 이름표, Pretendard 자체 제공). 예제 스타일시트와 로딩 화면(EX-1a 남은 부분)을 포함한다 | 브라우저 기본 스타일 요소 0(스크린샷), Pretendard woff2 로드 확인, 로딩 중 진행률 표시 |
| CK-4 | 렌더 수명·로딩. 언마운트된 clone을 해제한다(`releaseObject`: `Object3D.dispose`, skeleton). `GLTFAssetCache`를 한 벌로 합친다(LRU 24, 동시 3, 보이는 시간 기준 timeout·abort, 실패 쿨다운·재시도, meshopt 워커). 코어의 drei `useGLTF`는 `useGLTFAsset`으로 바꾼다. 모델을 바꾸는 동안 이전 모델을 유지한다. 첫 draw 준비 신호(`CompileGate onReady`)와 `visibleTimeout`을 둔다. Windows에서는 `powerPreference`를 생략한다. 장치 손실 복구(`onDeviceLost`, `RendererRecovery`)를 넣는다. WebGL 미리보기와 WebGPU 월드가 캐시를 함께 쓸 때 생기는 인덱스 변환 문제를 확인한다 | 캐릭터 로드 끝 long task 446ms→100ms 이하. LOD 경계 10회 왕복 뒤 렌더 객체 수·힙이 기준선으로 돌아옴. `device.destroy()` 뒤 3초 안에 같은 상태로 복구. gw 콘솔 경고 −1 |
| CK-5 | 지면. `createTileSampler`(셀→재질·높이·물)를 둔다. 타일 재질은 월드 좌표 UV와 넓은 색 변화를 쓴다. 재질 경계는 물결과 둥근 모서리로 페더 처리한다. 절차 흙길(`surface: 'dirt'`)을 넣는다. 모래·눈·잔디는 결정적 월드 노이즈를 쓴다 | 위에서 본 스크린샷에 4m 반복과 직선 경계가 없음. 새로고침해도 같은 모양. 타일 편집 반영 16ms 이내. 지면 draw 증가 없음 |
| CK-6 | 잔디(ck 바람 잔디). 잔디밭 층(`MeshConfig.grass`)을 두고, 거리장·노이즈로 경계를 불규칙하게, 군집을 만든다. 미리 구운 돌풍 텍스처, 원호 굽힘, 화면 폭 보정, 둥근 법선, 뿌리색=지면색을 쓴다. 예산(최대 blade 수, 거리별 관절 5/3/2, 순위 페이드)을 두고 blade 그림자를 끈다. 빌드는 프레임당 2ms로 나눈다 | minihome 삼각형 1.0M→0.7M 이하, 줌아웃 튐 0, 긴 풀 사각 윤곽 없음(스크린샷) |
| CK-7 | 물가·물. 물 타일과 섬 바깥 바다를 블러해 물가 필드를 만든다(둑→젖은 모래→얕은 물→깊은 물, 거품). 노멀맵은 주기적으로, 물 재질에 fog·톤맵을 켜고, 물 LOD(40/52m)를 둔다 | 연못·해안 그라데이션(스크린샷), 18m 이음선 없음, 안개를 켜면 바다가 안개에 묻힘 |
| CK-8 | 반복 모델 인스턴싱·산포. 같은 GLB 배치를 파트별 InstancedMesh로 그린다(`ModelBatches`). 규칙 산포 `ScatterLayer`(재질·경계 거리·밀도·군집·시드)와 근거리 버킷 인스턴싱을 둔다 | 울타리·의자 draw가 모델 종류 수로 줄어듦. 길가 꽃·돌 산포 스크린샷. 새로고침해도 같은 배치 |
| CK-9 | 애니메이션·NPC 연출. 키 없는 본을 idle 자세로 채워 T자 복귀를 없앤다. 전환 규칙(`useClipTransition`: 첫 클립 weight 1, crossfade, 원샷 뒤 stance)을 둔다. NPC마다 idle 위상·속도를 달리하고, 주기적으로 손을 흔들고 말 걸면 인사한다. 부드럽게 돌고, 말 건 상대를 보고, 두리번거린다. 끝점에서 쉬고, 걸음 재생을 속도에 비례시키고, 제자리 클립을 쓴다. 목표 키로 정규화한다(`NPCTemplate.height`). `NPCSystem`에 가시 상한과 화면 밖 culling(루트 구)을 둔다 | 전환 캡처에서 T자 0프레임. E를 누르면 0.3초 안에 플레이어를 봄. 걷기 재생 속도가 이동 속도에 비례. 카메라를 돌리면 draw 감소 |
| CK-10 | 적응형 품질. 성능 보고에 GPU 시간(`trackTimestamp`)을 넣는다. `quality="auto"`는 계속 조정한다(DPR .7–1.5 히스테리시스, 250ms 프레임은 즉시 낮춤, 탭 복귀 유예). CPU 병목이면 그림자 주기·NPC 상한을 낮춘다 | 강한 부하(후처리+큰 창)에서 DPR이 내려가고 4초 안에 FPS 회복. 보고에 dpr·gpuMs. 평상시 minihome DPR 1.5 유지 |
| CK-11 | 에셋 파이프라인(ck 인물 도구). `assets:production optimize --preset figure`(dedup·prune·resample·meshopt, rest-pose 스텁 제거, matte면 MR 맵 제거, 삼각형 예산 simplify, 클립 이름 정규화)를 만든다. 텍스처 정책(texel 밀도, 법선 절반 크기 무손실 WebP), UV 섬 dilation, idle 이식(`--add-clip`), 검사 확장(리그·정지 클립·팔 벌림·hips 가중치·방향, Blender 시트는 선택), 이음 법선 평활, Tripo 캐릭터 생성(`generate-character`, `--dry-run`)을 넣는다 | trainer_red/green에서 MR 맵 제거(각 −5.6MB). 인물 12종 검사 PASS 표. asset tool 테스트 통과 |
| CK-12 | 조명 구역. `LightingZone`(영역 안에서 환경광·키광 교체, `GameplayArea` 연동)으로 미니룸 실내 조명을 만든다 | 미니룸에 들어가면 조명이 바뀜(스크린샷), 프레임 +0.2ms 이하 |
| UP-1 | upstream 대체. `CascadedSun`·`DynamicSky`를 three r186 `SunLight`(두 백엔드 CSM)와 시간대 연동 하나로 가로등 라이트 풀은 r185 클러스터(Forward+) 조명으로, 품질 tier에 r184 TAAU/FSR 업스케일. `OutfitAvatar`는 `AvatarRuntime`으로 합친다. 새 해도 CK-1의 cascade 갱신 주기와 CK-10의 품질 제어를 그대로 받는다 | 자체 CSM·라이트 풀 코드 삭제, 같은 장면의 draw·프레임 시간 전후 기록 |
| LIB-1 | 라이브러리 형태. `preserveModules` 빌드로 트리셰이킹 복구, `GaesupWorld`가 런타임을 만들고 수명을 관리(legacy 경고 0), 루트 진입점에서 에디터 분리, 캔버스·WebGPU·품질·`GaesupWorldContent`를 묶은 부팅 컴포넌트, 런타임 `logger` 기본값을 개발 모드 콘솔로(지금은 플러그인 로그가 사라진다), 프로젝트 설정의 입력 바인딩을 조작 캐릭터에 연결 | import 모양별 소비자 번들 크기 전후, 최소 월드 부팅 코드 줄 수, 콘솔 경고 0 |
| PERF | 측정 기반 병목 제거. 건물 편집 증분 갱신(`BuildingBatches`, `BlockColliders`), 내비게이션 변경 영역만 갱신(ck처럼 탐색 한 번 동안 격자 샘플 캐시), NPC 비가시 시뮬레이션 예산, 장면 전체 순회 제거, 게임패드 입력도 유휴 해제 활동으로, MRT 후처리에서도 `CompileGate` 사전 컴파일. 유휴 프레임 정책은 CK-1, 모델 상주는 CK-4, 잔디 tier는 CK-6, GPU 시간은 CK-10이 맡는다 | 같은 장면·장치에서 프레임 p50/p95, long task, draw, GPU ms, collider 수를 전후로 남긴다. CPU 미세 측정만으로 FPS 개선을 선언하지 않는다 |
| NPC-1 | NPC 결함. 말하기 상태를 말풍선으로 그리고, 렌더 경로(`fullModelUrl` 단일 모델과 부위 조립)를 한 벌로, 일과표가 시뮬레이션을 움직이게(화면 밖 culling·연출은 CK-9), store의 카탈로그·인스턴스·에디터 선택을 나눈다. 지각이 `fieldOfView`·`hearingRadius`를 쓰고, 두뇌를 정하지 않은 NPC의 기본값을 외부 정책(`reinforcement`/`openai`)이 아닌 `scripted`로 | 예제 마을에서 말풍선과 일과 이동 브라우저 확인, NPC 50명 장면의 프레임 p50/p95 전후 |
| GI-1 | 동적 GI(웹판 Lumen-lite). 표준 WebGPU에는 하드웨어 레이트레이싱이 없으므로 Lumen의 소프트웨어 경로처럼 간다. upstream 기반: three `SSGINode`, r184 `LightProbeGrid`, r186 `SunLight`. gw 고유: 건축 격자(4m 셀)를 GPU 3D 복셀 텍스처로 직접 채우고 편집한 셀만 갱신, compute가 프로브에서 복셀을 레이마칭(DDGI 방식)하며 프레임마다 일부 프로브만 갱신. wasm은 정적 GI 굽기와 GLB 소품 SDF 생성(워커). 품질 tier: low 굽기, medium 동적 프로브, high 프로브+SSGI | 작은 마을에서 GI를 켠 WebGPU 프레임의 GPU 시간 증가가 내장 GPU 기준 4ms 이하, 타일 편집 뒤 GI 반영 지연, 켜기 전후 스크린샷 |
| EX-1 | 예제 2차: 멀티플레이 방문자, 계단식 마을 꾸미기 확장 등. 예제 minihome: 계단식 마을 꾸미기(건축), 주민 NPC, 방문자 멀티플레이, 성능 HUD, Pretendard UI(woff2 `@font-face`, 지금은 이름만 있고 글꼴 파일을 싣지 않는다) | 공개 API만 사용, 브라우저 스크린샷, 성능 HUD 수치 |
| GPU-1 | **보류**(2026-09-27 사용자 결정, 다시 요청할 때까지 착수하지 않음). WebGPU 전면. `createRenderer`는 `WebGPURenderer`만 만들고, `WebGLRenderer`·GLSL(`shaderMaterial`)·WebGL 그림자 깊이 재질·`@react-three/postprocessing` 경로(불, 깃발, 잔디, 벚꽃, 눈, 물, 날씨, `ColorGrade`, `LutOverlay`, `ToonOutlines`)와 `gl`을 넘기지 않아 `WebGLRenderer`로 그리는 `MultiplayerCanvas`, drei `Grid`·`Line`·`Text`(legacy) 사용처를 지운다. 필요한 효과는 TSL로 옮긴다. `postprocessing`·`@react-three/postprocessing` 의존성을 뺀다 | `rendererKind(...) === 'webgl'` 분기 0, GLSL 소스 0, 브라우저에서 WebGPU와, `navigator.gpu`가 없을 때 `WebGPURenderer`의 WebGL2 백엔드 둘 다 그린다(지금은 classic `WebGLRenderer`로 떨어진다). 설치형 소비자 검증 통과 |

## 검증

- slice마다 `pnpm run verify:full`을 통과시킨다. 패키지 검증은 `build` → `publint` → `test:package:built` 순서로, 같은 `dist`에서 병렬 실행하지 않는다.
- 공개 API가 바뀌면 export snapshot과 `scripts/verify-package-consumer.cjs`를 같은 커밋에서 갱신한다.
