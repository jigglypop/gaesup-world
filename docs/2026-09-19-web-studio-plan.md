# gaesup-world 코드 평가 및 Web Studio 실행계획

[English](2026-09-19-web-studio-plan.en.md) · [이후 구현 기록](release-2.0.0-next.0.md)

이 문서는 구현 전 최초 평가 기록입니다. 이후 수정과 검증 결과는 구현 기록을 확인하세요.

기준일: 2026-09-19. 대상: `C:\dev\gaesup-world`, HEAD `c892520a`. 이번 작업은 코드 조사, 공식 자료 조사, 배포 사전검증과 계획 작성이다. 아래 일정은 제안이며 구현 완료를 뜻하지 않는다.

## 1. 판단

장기 비전인 ‘웹에서 개발하는 Unity’는 유지하되, 첫 제품은 **React 개발자가 브라우저에서 작은 3D 공간을 만들고, 플레이하고, 자신의 서비스에 넣는 Studio**로 좁힌다. 첫 대표 결과물은 미니룸·작은 소셜 공간으로 삼는다. 현재 미니홈 예제와 SceneDocument 기반을 활용할 수 있기 때문이다.

코드에는 엔진과 에디터의 유용한 기반이 있다. 그러나 공개 사용자가 경험하는 제품은 미니홈과 엔진 쇼케이스에 가깝다. 범용 게임 제작 환경으로 평가받으려면 ‘프로젝트 생성 → 에셋 배치 → 동작 설정 → Play/Stop → 저장/복원 → 배포/공유’가 하나의 검증된 흐름이어야 한다.

WebGPU, AI, 많은 export의 존재 자체를 핵심 판매 문구로 삼지 않는다. 경쟁사가 이미 제공하는 기술이며, 실제로 줄여 주는 제작 시간과 React 앱으로 가져갈 수 있는 결과물을 보여 주어야 한다. 성공 가능성은 아직 검증되지 않았고 아래 방향은 검증할 제품 가설이다.

## 2. 현재 코드와 배포 평가

| 중요도 | 현재 근거 | 판단과 작업 |
|---|---|---|
| P0 | `package.json:3`은 1.0.2, registry latest는 1.0.30 | 로컬과 공개 릴리스가 불일치한다. 1.0.2 재배포는 불가능하다. 공개 1.0.30과 API/동작 차이를 먼저 비교한다. |
| P0 | `package.json:214`가 없는 `.codex/hooks/astra-guard.test.mjs`를 참조 | `verify`가 시작 단계에서 실패한다. 하네스 원본을 추적해 복구하거나 실제 저장소 정책에 맞는 검증으로 교체한다. 성공을 위해 검증을 무조건 삭제하지 않는다. |
| P0 | 린트 64 errors, `npm whoami` E401 | 코드 품질 gate와 인증 모두 막혀 있다. 현재 상태로 정식 배포를 선언할 수 없다. |
| P0 | `src/core/scene-object/runtime.ts:83-101`이 position/Euler를 단순 합산 | 부모 회전·scale이 자식 위치에 반영되지 않는다. 빌드된 공개 API 재현에서 부모 Z회전 π/2, scale 2, 자식 위치 [1,0,0]의 결과가 [1,0,0]이었다. 기대값은 [0,2,0]이다. 계층 편집 전에 transform 합성을 고쳐야 한다. |
| P0 | GitHub 홈페이지 `https://jigglypop.github.io/gaesup-world/` HTTP 404 | 첫 방문자의 체험 경로가 끊긴다. 우선 복구할 유입 경로다. |
| P0 | `package.json:211-212`는 library build 후 `gh-pages -d dist`; `vite.config.ts:250`의 demo output은 `demo-dist` | 사이트 배포 대상과 산출물이 맞지 않는다. 404의 원인을 서버 이력 없이 단정할 수는 없지만 로컬 설정은 수정해야 한다. Pages base 경로, `/engine` 진입, 새로고침, glTF/JS/CSS 주소도 함께 검증한다. |
| P1 | `examples/main.tsx:6`은 `/engine`과 기본 Minihome만 연결 | 에디터 library export가 있어도 공개 Studio 진입 경험이 완성됐다는 뜻은 아니다. `/studio`를 별도 제품 route로 연결한다. |
| P1 | `README.md:265`는 `/world`, `/edit`, `/blueprints`, `/network`, `/admin`을 안내 | 현재 route 분기와 문서가 어긋난다. 실제로 실행 가능한 route만 안내하고 회귀 검증한다. |
| P1 | `src/core/editor/index.ts`, `shell.ts:106,142`, `playMode.ts` | hierarchy/inspector/gizmo/assets 패널, command stack, play snapshot 등은 재사용할 자산이다. 실제 Studio에서 연결하고 왕복 동작을 검증한다. |
| P1 | `src/core/scene-object/controller.ts:21,69`, `examples/minihome/Minihome.tsx:39-85` | SceneDocument command 기반 편집과 실제 소비 예제가 있다. 새 persistent mutation도 이 경계로 모은다. |
| P1 | `examples/minihome/Minihome.tsx:63-72`의 수동 localStorage 저장 | 현재 예제 저장을 계정 간 복원, 협업, 클라우드 배포로 설명하면 안 된다. 프로젝트 문서/에셋/리비전의 저장 계약이 필요하다. |
| P1 | `src/core/editor/components/panels/ProjectAssetsPanel/types.ts:113` | asset 선택 UI와 import→검증→scene 배치는 다른 기능이다. import/reimport와 prefab 작업을 실제 scene command에 연결해야 한다. |
| P1 | `src/blueprints/core/types.ts:42`의 ComponentContext는 React/Rapier/Three 객체를 참조 | 런타임 context 자체는 필요할 수 있지만 persistent SceneDocument와의 경계를 명시해야 한다. BlueprintDefinition을 저장 가능한 데이터로 유지하고 context는 adapter에 한정한다. Blueprint와 scene prefab의 변환·소유권을 정의한다. |
| P1 | `README.md:37,61`의 긴 설치 명령과 placeholder 캐릭터 URL | 사용자가 첫 장면을 실행하기 전에 의존성과 모델을 준비해야 한다. 영문 quickstart, 실제 실행 가능한 starter, 무료 기본 에셋을 제공한다. |
| P2 | 패키지 소비자 Vite build의 main chunk 약 3.97 MB, gzip 약 1.36 MB | 이 fixture는 많은 API를 사용하는 검증 앱이므로 최소 소비 크기로 해석하지 않는다. runtime-only, controller-only, editor 세 가지 소비 앱으로 실제 비용을 각각 측정한다. |

장점은 ESM/CJS 공개 API, 타입 배포, 독립 패키지 설치와 실행을 검증하는 도구가 이미 있다는 점이다. 엔진을 새로 쓰기보다 이 기반 위에 제작 흐름을 연결하는 것이 비용 대비 낫다.

## 3. 2026-09-19 공식 자료 조사

관련 경쟁 제품과 기반 기술을 조사했다. 모든 제품의 모든 변경사항을 망라한 목록은 아니다. 날짜가 있는 릴리스와 갱신일이 명시되지 않은 현재 문서를 구분했다. 현재 기능 문서에 나온 기능을 모두 2026년 신기능으로 간주하지 않는다.

| 제품/기술 | 확인한 기능과 상태 | gaesup-world에 주는 의미 |
|---|---|---|
| Unity 6.6 | 2026-08-24 공식 발표: WebGPU 정식 지원, compute 기반 GPU culling/resident drawing, STP, VFX Graph, APV, compute skinning. WebGL2 기본값과 fallback 유지, device filtering 제공. | 웹 출력의 렌더링 경쟁이 강해졌다. Unity의 Web 지원과 브라우저 안에서 편집하는 제품은 구분해야 한다. 작은 다운로드와 빠른 수정·공유에 집중한다. |
| PlayCanvas Editor | 현재 공식 저장소: WebGL/WebGPU/WebXR 시각 편집기, 공개된 editor frontend, 열린 Editor를 조작하는 MCP 통합. | 가장 직접적인 비교 대상이다. ‘브라우저 에디터’와 ‘AI 연결’만으로는 차별점이 부족하다. |
| SuperSplat | 2026-09-09 Editor 3.0 WebGPU 재구축, 큰 장면/메모리 개선, 선택과 색 조정. 2026-08-17 publishing API. | SuperSplat 기능을 PlayCanvas 일반 에디터 기능과 혼동하지 않는다. splat 파이프라인은 성장 중이지만 초기 미니룸 제품의 필수 범위는 아니다. |
| Babylon.js 9.0 | 2026-03-26: clustered lighting, textured area lights, node particle editor, volumetric lighting, frame graph, animation retargeting, splat 지원, Inspector v2, 대규모 월드/지리 데이터, navmesh/audio 개선. | 렌더러 기능 수로 추격하기 어렵다. editor 사용성, React 통합, 공개 예제와 문서 완성도를 경쟁축으로 삼는다. |
| Spline | 현재 공식 문서: 실시간 협업, 3D/Hana 2D, AI agent와 MCP, undo 가능한 편집, Code Tab, public URL/React export, components/multi-scenes/team libraries. | 시각 편집→코드→공유의 매끄러운 연결이 기준이다. 게임 행동과 persistent world에 특화할 여지가 있다. |
| Three.js | 현재 WebGPURenderer 문서: WebGPU 우선, WebGL2 fallback, TSL. | 기존 Three.js 기반을 유지한다. 실제 backend와 기능 지원 차이를 diagnostics로 노출하고 fallback 결과를 별도 확인한다. |
| React Three Rapier | 공식 문서: v2는 R3F v9/React 19 지원. | React18/R3F8/Rapier1과 React19/R3F9/Rapier2를 실제 설치 조합으로 검증한다. peer 범위 선언만으로 양쪽 지원을 보증하지 않는다. |
| Godot Web Editor | stable 문서는 preliminary 상태와 export/debugging/C#/GDExtension 제약을 설명하며, 페이지 자체에 4.7 갱신 미완료 경고가 있다. | 브라우저에서 열리는 것과 생산용 authoring 완성도는 다르다. 이 문서의 제한을 모든 최신 빌드에 대한 확정 사실로 일반화하지 않는다. |

출처:

- [Unity 공식 WebGPU 6.6 발표](https://discussions.unity.com/t/webgpu-out-of-experimental-in-unity-6-6/1734694)
- [PlayCanvas Editor](https://github.com/playcanvas/editor)
- [PlayCanvas/SuperSplat 공식 업데이트](https://blog.playcanvas.com/)
- [Babylon.js 9.0 공식 릴리스 글](https://babylonjs.medium.com/welcome-to-babylon-js-9-0-c3edc9ee6428)
- [Spline 현재 기능 문서](https://docs.spline.design/basics/what-is-spline)
- [Three.js WebGPURenderer](https://threejs.org/manual/pages/webgpurenderer)
- [React Three Rapier](https://pmndrs.github.io/react-three-rapier/)
- [Godot Web Editor, stable 문서](https://docs.godotengine.org/en/stable/tutorials/editor/using_the_web_editor.html)

## 4. 인기가 낮은 이유: 관측과 가설

2026-09-19 조회 결과 GitHub stars 22, forks 4, open issues 0. npm downloads API는 2026-08-18~2026-09-16에 2,542회를 반환했다. 이는 설치 이벤트이며 사람 수, 활성 프로젝트 수, 유지율이 아니다. API 구간 종료일도 조사일과 다르다.

출처: [GitHub repository API](https://api.github.com/repos/jigglypop/gaesup-world), [npm 다운로드 API](https://api.npmjs.org/downloads/point/last-month/gaesup-world), [npm registry](https://registry.npmjs.org/gaesup-world). 상대 날짜 endpoint 값은 계속 변한다.

관측된 마찰은 데모 404, 실행되지 않는 placeholder quickstart, 공개 버전과 현재 코드의 간극, Character Controller라는 설명과 광범위한 world/editor API의 불일치다. 이들이 낮은 채택에 기여한다는 것은 타당한 가설이지만 인과관계는 유입·활성화 데이터와 사용자 관찰로 확인해야 한다. 이슈 0개를 안정성이나 수요 부재의 증거로 삼지 않는다.

첫 대상은 React/R3F로 소셜 공간, 커뮤니티 룸, 작은 게임을 만드는 개인 개발자와 소규모 팀이다. 첫 문구는 “Build a playable 3D room in your browser. Ship it in React.”로 제안한다. npm은 개발자 배포 채널이고 Studio는 체험·활성화 채널이다. 둘의 역할을 구분한다.

## 5. 구현 순서와 완료 조건

기간은 1~2명 핵심 개발자 기준 제안이다. 각 단계는 앞 단계의 완료 조건을 만족한 후 진행하며 실제 일정은 실패 원인에 따라 조정한다.

### P0 / 1주: 릴리스와 첫 접점 복구

1. 하네스 누락 이력을 조사해 복구하고 린트 64개를 정리한다. `verify`와 `verify:full`을 실제로 통과시킨다.
   - 정식 release 전에 위 transform 오류를 해결한다. engine-neutral 수학 계층에서 행렬/quaternion 합성을 정의하고 renderer adapter가 같은 결과를 사용하게 한다. 회전된 부모, 비균일 scale, 중첩 부모, reparent 시 world 유지, 비균일 scale+회전의 shear 표현 정책을 검증한다.
2. npm 1.0.30 tarball과 현재 코드를 별도 소비 프로젝트에서 비교한다. export 추가뿐 아니라 기존 동작/의존성/자산/타입 변경도 기록한다. 호환성 확인 전 patch 버전을 임의 선택하지 않는다.
3. 호환되면 다음 minor, 비호환이면 major migration과 prerelease를 준비한다. 우선 `next` tag로 검증하고 `latest` 승격은 실제 설치 smoke 이후 수행한다.
4. demo build/deploy를 library build와 분리하고 Pages base 및 route/asset 주소를 고친다. 홈페이지 200, `/engine` 진입과 새로고침, JS/CSS/GLB 200, 화면과 입력을 실제 브라우저에서 확인한다.
5. 영문 README 첫 화면에 동작하는 데모, 30초 영상, 실행 가능한 starter, 작은 API 예제와 지원 매트릭스를 둔다. 기존 한국어 설명은 별도 문서로 유지한다.

완료 조건: 깨끗한 폴더에서 문서 명령만으로 첫 장면 실행, 외부 CDN placeholder 불필요, registry 설치 성공, 데모 실제 렌더링 확인. npm 인증 갱신은 계정 소유자의 로컬 로그인 또는 적절한 CI 인증이 필요하다. 토큰을 채팅으로 받지 않는다.

### P1 / 2~4주: 하나의 완결된 Studio

- `examples/main.tsx`에 Studio를 연결하고 기존 `src/core/editor`의 hierarchy, inspector, transform gizmo, asset panel, command stack을 조립한다.
- 표준 EditorSession이 document controller, selection, command history, play snapshot, save binding을 소유하게 한다. component별 callback 연결이 서로 다른 상태 원본을 만들지 않게 한다.
- 템플릿 생성, 선택/복제/삭제, 이동/회전/크기, snap, undo/redo, Play/Pause/Stop을 하나의 SceneDocument와 command 경계로 연결한다.
- Play는 편집 snapshot에서 시작하고 Stop은 편집 상태로 돌아간다. runtime 변경을 저장하려면 명시적인 적용 동작을 사용한다.
- 프로젝트 manifest는 schemaVersion, scene, asset ID/hash/license, revision을 가진다. GPU/React 객체는 저장하지 않는다.
- IndexedDB 자동저장, quota/실패 표시, JSON+asset manifest 내보내기/가져오기, schema migration을 제공한다. 기존 Minihome localStorage에는 이동 경로를 둔다.

완료 조건: 기본 룸 생성→가구 배치→undo/redo→Play/Stop→저장→새로고침→다시 편집의 자동 browser 시나리오. 두 프로젝트 전환 때 객체/리스너가 남지 않고 저장 실패를 성공으로 표시하지 않는다. 5명 외부 테스트 중 최소 4명이 도움 없이 10분 내 완료하는 것을 가설 검증 목표로 둔다.

### P2 / 5~6주: 공유와 React 소비

- scene revision과 asset manifest를 고정한 publish artifact를 만든다. editor 코드가 공개 runtime에 필수로 따라가지 않게 분리한다.
- 먼저 정적 export ZIP과 React embed를 구현하고, 이후 동일 artifact를 쓰는 hosted publish를 연결한다.
- 공개 URL, 복제/remix, 이전 revision 복원, 실패 재시도와 asset hash 검증을 제공한다.
- npm runtime/controller/editor 각각 최소 소비 앱을 만들고 다운로드, 초기 실행 시간, dependency 크기를 기록한다. 현재 검증 fixture 번들 크기를 최소 소비 비용으로 광고하지 않는다.

완료 조건: 다른 브라우저의 로그인 없는 방문자가 URL에서 플레이 가능하고, export한 프로젝트가 별도 React 앱에서 실행된다. 공개본에는 authoring 비밀값이나 로컬 전용 URL이 없다.

### P3 / 7~8주: 반복 사용되는 게임 기능

- 문 열기, 근접 상호작용, 간단한 NPC 대화, 트리거, 공간 이동의 작은 행동 묶음을 제공한다. 범용 node scripting 전체 구현보다 템플릿의 실제 요구를 따른다.
- 멀티플레이는 2인 입장/퇴장/재접속, 권한 있는 mutation, snapshot 복원부터 검증한다. 동시 편집 협업은 게임 네트워크와 별도 contract로 설계한다.
- 기본 아바타/GLB import의 스케일·축·충돌·animation·license를 점검한다. 유료 AI 생성은 기본 첫 실행의 필수조건으로 두지 않는다.

완료 조건: 두 브라우저가 같은 공간을 관찰하고 재접속 후 canonical 상태로 돌아온다. 템플릿 사용자 인터뷰에서 반복 요청이 확인된 기능만 확장한다.

### P4 / 9~12주: 검증된 수요 확대

- AI/MCP는 `inspect`, 검증된 command transaction, preview, apply, undo 경계 위에 구현한다. AI만 별도 상태를 직접 변경하게 하지 않는다.
- 사용자가 실제로 만든 3개 사례, remix 가능한 템플릿, 설치 예제, migration guide를 공개한다. 커뮤니티 글은 해당 기능을 보여 주는 짧은 실물 데모 중심으로 작성한다.
- 후속 수익 가설은 hosted project, 팀 저장/권한/버전, asset hosting이다. 기본 SDK/로컬 export는 채택 경로로 유지한다. 가격은 사용자 인터뷰와 사용 비용이 확보된 후 정한다.

초기 제외: Unity 전체 API 복제, 자체 렌더러 전면 재작성, 모든 플랫폼 native export, 자체 asset marketplace, 범용 visual scripting, Gaussian splat 전용 제작 파이프라인. 사용자 수요가 입증되면 우선순위를 재평가한다.

## 6. 채택 측정 계획

현재 활성 사용자 데이터는 없다. 다음은 목표/실험 설계이며 실제 성과가 아니다.

- funnel: landing 방문 → template open → 첫 object edit → 첫 play → save → publish success → 7일 내 return/edit.
- activation: 새 프로젝트에서 편집·play·저장을 모두 성공한 사용자. 단순 방문과 npm CI 다운로드는 제외한다.
- 첫 30일: 외부 개발자 10명 관찰, 10분 내 활성화 8명 목표. 실패 화면과 이유를 기록해 상위 마찰 3개부터 개선한다.
- 이후 30일: 외부 제작 공개 프로젝트 10개, 활성화 사용자 중 7일 내 재편집 30%를 실험 목표로 둔다. 표본 수와 분모를 함께 보고한다.
- 주간 지표: 활성화까지 걸린 시간의 중앙값/p90, 저장·배포 실패율, 공유 링크 실행 성공률, 7일 재편집률. stars/downloads는 유입 보조 지표로만 사용한다.
- 유입은 충분하지만 edit→play가 낮으면 UX/기능 연결을 수정한다. activation은 높고 return이 낮으면 사용 목적을 재검토한다. 사용자는 적지만 반복 사용이 높으면 문서·템플릿·커뮤니티 유입을 늘린다.

## 7. 이번 실행의 검증 결과

| 실행 | 결과 |
|---|---|
| `corepack pnpm run verify` | 실패: 하네스 파일 없음. 후속 전체 suite 미실행. |
| `corepack pnpm run lint` | 실패: 64 errors, 0 warnings. |
| `corepack pnpm run build` | 통과: ESM/CJS 및 타입 생성. |
| `corepack pnpm exec jest src/__tests__/publicApi.test.ts src/__tests__/packageExports.test.ts --runInBand` | 2 suites, 26 tests 통과. |
| `corepack pnpm run test:package:built` | 통과: 별도 설치, 타입/ESM/CJS runtime probe, Vite build. 브라우저 GPU 렌더 검증은 아님. |
| `corepack pnpm exec publint --pack npm` 및 이후 단독 기본 `publint` | 통과. 초기 consumer finalizer와 병렬 실행에서 declaration 누락이 관측되어 단독 재검증으로 분리했다. 이 검사들은 dist 변경과 병렬 실행하지 않는다. |
| `corepack pnpm run test:demo` | 통과: lazy chunk와 responsive style 정적 검사. 초기 JS 195,284 bytes. 실제 시각/입력 성공은 미검증. |
| `npm pack --dry-run --ignore-scripts --json` | 패키징 정보 확인: 1,919 files, 압축 1,325,273 bytes, unpacked 5,124,791 bytes. |
| `npm whoami` | E401 Unauthorized. |
| `npm publish --dry-run --ignore-scripts --tag next` | 실패: 이미 존재하는 1.0.2는 다시 publish할 수 없음. 실제 registry publish는 실행하지 않았다. |
| 공개 홈페이지 HTTP | 404. |
| 빌드된 `createSceneDocument`/`loadSceneRuntime` 계층 transform 재현 | 오류 재현: 부모 Z회전 π/2와 scale 2가 자식 위치에 반영되지 않음. 이번 평가에서 수정하지 않았다. |

로그는 `.tmp/audit-2026-09-19-*.log`와 pack JSON에 남겼다. `.tmp`는 Git 제외 경로다. `verify:full`, 전체 domain/memory suite, native WebGPU/WebGL 브라우저 시각/성능, 공개 npm 새 버전 설치, 실제 사이트 배포는 이번에 완료하지 않았다. 변경은 이 계획 문서이며 기존 소스와 버전은 유지했다.
